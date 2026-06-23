import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Stethoscope, FileText, Pill, FlaskConical, Clock, Clipboard, Calendar, Loader2 } from "lucide-react";
import { useQueueList, useTransferQueue, useUpdateQueueStatus } from "@/hooks/useQueue";
import { calcAge, type QueueEntry } from "@/lib/queueService";
import { useCreatePrescription } from "@/hooks/usePrescriptions";
import { useToast } from "@/components/ui/use-toast";

const DoctorModule = () => {
  const { data: patients = [], isLoading } = useQueueList("doctor", { refetchInterval: 10000 });
  const [selected, setSelected] = useState<QueueEntry | null>(null);
  const [drug, setDrug] = useState("");
  const [dosage, setDosage] = useState("");
  const [duration, setDuration] = useState("");
  const [instructions, setInstructions] = useState("");
  const statusMutation = useUpdateQueueStatus();
  const transferMutation = useTransferQueue();
  const createPrescriptionMutation = useCreatePrescription();
  const { toast } = useToast();

  useEffect(() => {
    if (patients.length > 0 && !selected) setSelected(patients[0]);
    if (selected && !patients.find((p) => p._id === selected._id)) setSelected(patients[0] ?? null);
  }, [patients, selected]);

  const patientAge =
    selected?.patient && typeof selected.patient === "object"
      ? calcAge(selected.patient.dateOfBirth)
      : null;

  const handleCheckIn = async (entry: QueueEntry) => {
    setSelected(entry);
    if (entry.status === "Waiting") {
      await statusMutation.mutateAsync({ id: entry._id, status: "In Progress" });
    }
  };

  const handleCheckOut = async (entry: QueueEntry) => {
    await statusMutation.mutateAsync({ id: entry._id, status: "Served" });
    if (selected?._id === entry._id) setSelected(null);
  };

  const sendToPharmacy = async () => {
    if (!selected) return;
    if (!drug || !dosage || !duration) {
      toast({ title: "Missing prescription details", description: "Enter drug, dosage and duration first", variant: "destructive" });
      return;
    }
    try {
      await createPrescriptionMutation.mutateAsync({
        patientId: typeof selected.patient === "object" ? selected.patient._id : String(selected.patient),
        queueEntryId: selected._id,
        items: [{ drug, dosage, duration, instructions }],
      });
      await transferMutation.mutateAsync({ id: selected._id, department: "pharmacy", serviceName: "Prescription" });
      toast({ title: "Prescription sent", description: "Pharmacy can now see this prescription" });
      setDrug("");
      setDosage("");
      setDuration("");
      setInstructions("");
    } catch (err) {
      toast({ title: "Failed to send prescription", description: "Please try again", variant: "destructive" });
    }
  };

  const sendToLab = async () => {
    if (!selected) return;
    await transferMutation.mutateAsync({ id: selected._id, department: "lab", serviceName: "Lab investigation" });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Patient List */}
        <Card className="shadow-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-heading flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" /> Waiting ({patients.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {isLoading && <Loader2 className="h-5 w-5 animate-spin mx-auto" />}
            {patients.map((p) => (
              <div key={p._id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/10">
                <div
                  className={`text-left flex-1 select-none p-2 rounded-md ${
                    selected?._id === p._id ? "bg-primary/10 border-primary" : "hover:bg-muted/20"
                  }`}
                >
                  <p className="text-sm font-medium text-foreground">{p.patientName}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.patientDisplayId} · {p.waitTime} wait
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-primary/10 text-primary hover:bg-primary/20"
                    onClick={() => handleCheckIn(p)}
                  >
                    In
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleCheckOut(p)}
                  >
                    Out
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-4">
          {/* Patient Summary */}
          <Card className="shadow-card border-border">
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                    {selected?.patientName?.split(" ").map(n => n[0]).join("") ?? "?"}
                  </div>
                  <div>
                    <h2 className="font-heading font-semibold">{selected?.patientName}</h2>
                    <p className="text-xs text-muted-foreground">
                      {selected?.patientDisplayId}
                      {patientAge != null && ` · ${patientAge} years`}
                      {selected?.complaint && ` · ${selected.complaint}`}
                    </p>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-lg">
                  {selected?.status} · {selected?.waitTime}
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="notes">
            <TabsList className="grid grid-cols-3 md:grid-cols-5 gap-2 bg-muted/10 p-2 rounded-lg shadow mb-12">
              <TabsTrigger value="notes" className="gap-1.5 hover:bg-primary/10 focus:ring-2 focus:ring-primary rounded-md"><FileText className="h-3.5 w-3.5" /> Notes</TabsTrigger>
              <TabsTrigger value="prescribe" className="gap-1.5 hover:bg-primary/10 focus:ring-2 focus:ring-primary rounded-md"><Pill className="h-3.5 w-3.5" /> Prescribe</TabsTrigger>
              <TabsTrigger value="investigate" className="gap-1.5 hover:bg-primary/10 focus:ring-2 focus:ring-primary rounded-md"><FlaskConical className="h-3.5 w-3.5" /> Investigate</TabsTrigger>
              <TabsTrigger value="history" className="gap-1.5 hover:bg-primary/10 focus:ring-2 focus:ring-primary rounded-md"><Stethoscope className="h-3.5 w-3.5" /> History</TabsTrigger>
              <TabsTrigger value="lab-results" className="gap-1.5 hover:bg-primary/10 focus:ring-2 focus:ring-primary rounded-md"><Clipboard className="h-3.5 w-3.5" /> Lab Results</TabsTrigger>
              <TabsTrigger value="radiology-results" className="gap-1.5 hover:bg-primary/10 focus:ring-2 focus:ring-primary rounded-md"><Clipboard className="h-3.5 w-3.5" /> Radiology Results</TabsTrigger>
              <TabsTrigger value="procedure" className="gap-1.5 hover:bg-primary/10 focus:ring-2 focus:ring-primary rounded-md"><Clipboard className="h-3.5 w-3.5" /> Procedure</TabsTrigger>
              <TabsTrigger value="referral" className="gap-1.5 hover:bg-primary/10 focus:ring-2 focus:ring-primary rounded-md"><Clipboard className="h-3.5 w-3.5" /> Referral</TabsTrigger>
              <TabsTrigger value="appointment" className="gap-1.5 hover:bg-primary/10 focus:ring-2 focus:ring-primary rounded-md"><Calendar className="h-3.5 w-3.5" /> Appointment</TabsTrigger>
            </TabsList>

            <TabsContent value="notes">
              <Card className="shadow-card border-border">
                <CardContent className="p-4 space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold">Patient History</h3>
                    <Textarea placeholder="Enter patient history..." />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Presenting Complaints</h3>
                    <Textarea placeholder="Enter presenting complaints..." />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Vital Signs Review</h3>
                    <Textarea placeholder="Enter vital signs review..." />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Physical Examination Notes</h3>
                    <Textarea placeholder="Enter physical examination notes..." />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Medical Notes</h3>
                    <Textarea placeholder="Enter medical notes..." />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Clinical Notes</h3>
                    <Textarea placeholder="Enter clinical notes..." />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Treatment Plan</h3>
                    <Textarea placeholder="Enter treatment plan..." />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Diagnosis</h3>
                    <Input placeholder="Enter primary diagnosis..." />
                    <Input placeholder="Enter secondary diagnosis..." className="mt-2" />
                    <Input placeholder="Enter ICD codes..." className="mt-2" />
                  </div>
                  <Button className="mt-4" onClick={() => alert('Notes saved successfully!')}>Save Notes</Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="prescribe">
              <Card className="shadow-card border-border">
                <CardContent className="p-4 space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold">Drug Selection</h3>
                    <Input placeholder="Enter drug name..." value={drug} onChange={(e) => setDrug(e.target.value)} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Dosage and Duration</h3>
                    <Input placeholder="Enter dosage..." value={dosage} onChange={(e) => setDosage(e.target.value)} />
                    <Input placeholder="Enter duration..." className="mt-2" value={duration} onChange={(e) => setDuration(e.target.value)} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Instructions</h3>
                    <Textarea placeholder="Take after meals..." value={instructions} onChange={(e) => setInstructions(e.target.value)} />
                  </div>
                  <Button className="mt-4" onClick={sendToPharmacy} disabled={transferMutation.isPending || createPrescriptionMutation.isPending}>
                    {createPrescriptionMutation.isPending ? "Sending..." : "Send Prescription to Pharmacy"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="investigate">
              <Card className="shadow-card border-border">
                <CardContent className="p-4 space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold">Lab Test Request</h3>
                    <div className="space-y-2">
                      <Input
                        placeholder="Search lab tests..."
                        onChange={(e) => {
                          // Implement search logic here
                        }}
                      />
                      <div className="space-y-1">
                        {/* Render selected lab tests here */}
                        {['Complete Blood Count', 'Liver Function Test'].map((test, index) => (
                          <div key={index} className="flex items-center justify-between p-2 border rounded">
                            <span>{test}</span>
                            <button
                              className="text-red-500 hover:underline"
                              onClick={() => {
                                // Remove the selected test
                                console.log(`Removed lab test: ${test}`);
                              }}
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Radiology Request</h3>
                    <div className="space-y-2">
                      <Input
                        placeholder="Search radiology tests..."
                        onChange={(e) => {
                          // Implement search logic here
                        }}
                      />
                      <div className="space-y-1">
                        {/* Render selected radiology tests here */}
                        {['X-Ray', 'MRI'].map((test, index) => (
                          <div key={index} className="flex items-center justify-between p-2 border rounded">
                            <span>{test}</span>
                            <button
                              className="text-red-500 hover:underline"
                              onClick={() => {
                                // Remove the selected test
                                console.log(`Removed radiology test: ${test}`);
                              }}
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">View Results</h3>
                    <p>Completed lab and radiology results will appear here.</p>
                  </div>
                  <Button className="mt-4" onClick={sendToLab} disabled={transferMutation.isPending}>Send Investigation</Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="procedure">
              <Card className="shadow-card border-border">
                <CardContent className="p-4 space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold">Minor Procedures</h3>
                    <Textarea placeholder="Enter minor procedures performed..." />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Procedure Notes</h3>
                    <Textarea placeholder="Enter procedure notes..." />
                  </div>
                  <Button className="mt-4" onClick={() => alert('Procedure details saved successfully!')}>Save Procedure</Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="referral">
              <Card className="shadow-card border-border">
                <CardContent className="p-4 space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold">Refer to Specialist</h3>
                    <Textarea placeholder="Enter referral details..." />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Refer to Another Facility</h3>
                    <Textarea placeholder="Enter facility referral details..." />
                  </div>
                  <Button className="mt-4" onClick={() => alert('Referral details saved successfully!')}>Save Referral</Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="appointment">
              <Card className="shadow-card border-border">
                <CardContent className="p-4 space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold">Schedule Next Visit</h3>
                    <Input type="date" placeholder="Select date..." />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Follow-Up Notes</h3>
                    <Textarea placeholder="Enter follow-up notes..." />
                  </div>
                  <Button className="mt-4" onClick={() => alert('Appointment details saved successfully!')}>Save Appointment</Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default DoctorModule;
