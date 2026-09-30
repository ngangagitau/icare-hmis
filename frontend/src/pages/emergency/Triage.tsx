import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useCreateEmergencyCase } from "@/hooks/useEmergency";
import { fetchPatients } from "@/lib/patientService";

const triageLevels = [
  { value: "Red", label: "Red - Immediate" },
  { value: "Orange", label: "Orange - Very urgent" },
  { value: "Yellow", label: "Yellow - Urgent" },
  { value: "Green", label: "Green - Standard" },
  { value: "Black", label: "Black - Deceased" },
] as const;

const toOptionalNumber = (value: string) => value.trim() ? Number(value) : undefined;

const EmergencyTriage = () => {
  const navigate = useNavigate();
  const createCase = useCreateEmergencyCase();
  const [patientId, setPatientId] = useState("");
  const [triageLevel, setTriageLevel] = useState("");
  const [values, setValues] = useState({
    arrivalMode: "",
    bloodPressure: "",
    heartRate: "",
    respiratoryRate: "",
    oxygenSaturation: "",
    temperature: "",
    gcsScore: "",
    painScale: "",
    bloodSugar: "",
    presentingComplaint: "",
    mechanism: "",
    allergies: "",
  });

  const patientsQuery = useQuery({
    queryKey: ["patients", "emergency-intake"],
    queryFn: () => fetchPatients(1, 100),
  });
  const patients = patientsQuery.data?.data ?? [];
  const selectedPatient = patients.find((patient) => patient._id === patientId);

  const updateField = (field: keyof typeof values, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!patientId || !triageLevel || !values.presentingComplaint.trim()) return;

    try {
      await createCase.mutateAsync({
        patientId,
        triageLevel: triageLevel as "Red" | "Orange" | "Yellow" | "Green" | "Black",
        presentingComplaint: values.presentingComplaint,
        vitalSigns: {
          bloodPressure: values.bloodPressure || undefined,
          heartRate: toOptionalNumber(values.heartRate),
          respiratoryRate: toOptionalNumber(values.respiratoryRate),
          oxygenSaturation: toOptionalNumber(values.oxygenSaturation),
          temperature: toOptionalNumber(values.temperature),
          gcsScore: toOptionalNumber(values.gcsScore),
          painScale: toOptionalNumber(values.painScale),
          bloodSugar: toOptionalNumber(values.bloodSugar),
        },
        notes: [
          values.arrivalMode && `Arrival mode: ${values.arrivalMode}`,
          values.mechanism && `Mechanism of injury: ${values.mechanism}`,
          values.allergies && `Allergies: ${values.allergies}`,
        ].filter(Boolean).join("\n"),
      });
      toast.success("Emergency case and triage assessment saved");
      navigate("/emergency");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save emergency assessment");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Emergency Triage Assessment</h1>
        <p className="text-muted-foreground text-sm">Create an emergency case from a registered patient record.</p>
      </div>
      <Card>
        <CardHeader><CardTitle>Patient Assessment</CardTitle></CardHeader>
        <CardContent>
          <form className="grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label>Registered patient</Label>
              <Select value={patientId} onValueChange={setPatientId} disabled={patientsQuery.isLoading || patients.length === 0}>
                <SelectTrigger><SelectValue placeholder={patientsQuery.isLoading ? "Loading patients..." : "Select a patient"} /></SelectTrigger>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient._id} value={patient._id || ""}>
                      {patient.firstName} {patient.lastName} · {patient.patientId}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {patientsQuery.isError && <p className="text-xs text-destructive">Unable to load registered patients.</p>}
              {!patientsQuery.isLoading && !patientsQuery.isError && patients.length === 0 && <p className="text-xs text-muted-foreground">No registered patients found.</p>}
            </div>
            <div className="space-y-2">
              <Label>Patient details</Label>
              <Input readOnly value={selectedPatient ? `${selectedPatient.patientId} · ${selectedPatient.gender || "Gender not recorded"}` : "Select a patient to view their record"} />
            </div>
            <div className="space-y-2">
              <Label>Arrival mode</Label>
              <Select value={values.arrivalMode} onValueChange={(value) => updateField("arrivalMode", value)}>
                <SelectTrigger><SelectValue placeholder="Select arrival mode" /></SelectTrigger>
                <SelectContent>{["Walk-in", "Ambulance", "Police", "Referral", "Self-referral"].map((mode) => <SelectItem key={mode} value={mode}>{mode}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Triage category</Label>
              <Select value={triageLevel} onValueChange={setTriageLevel}>
                <SelectTrigger><SelectValue placeholder="Assign triage level" /></SelectTrigger>
                <SelectContent>{triageLevels.map((level) => <SelectItem key={level.value} value={level.value}>{level.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Blood pressure (mmHg)</Label><Input value={values.bloodPressure} onChange={(event) => updateField("bloodPressure", event.target.value)} placeholder="120/80" /></div>
            <div className="space-y-2"><Label>Heart rate (bpm)</Label><Input type="number" value={values.heartRate} onChange={(event) => updateField("heartRate", event.target.value)} placeholder="72" /></div>
            <div className="space-y-2"><Label>Respiratory rate</Label><Input type="number" value={values.respiratoryRate} onChange={(event) => updateField("respiratoryRate", event.target.value)} placeholder="16" /></div>
            <div className="space-y-2"><Label>SpO2 (%)</Label><Input type="number" value={values.oxygenSaturation} onChange={(event) => updateField("oxygenSaturation", event.target.value)} placeholder="98" /></div>
            <div className="space-y-2"><Label>Temperature (°C)</Label><Input type="number" step="0.1" value={values.temperature} onChange={(event) => updateField("temperature", event.target.value)} placeholder="36.5" /></div>
            <div className="space-y-2"><Label>GCS score (3-15)</Label><Input type="number" min="3" max="15" value={values.gcsScore} onChange={(event) => updateField("gcsScore", event.target.value)} placeholder="15" /></div>
            <div className="space-y-2"><Label>Pain scale (0-10)</Label><Input type="number" min="0" max="10" value={values.painScale} onChange={(event) => updateField("painScale", event.target.value)} placeholder="5" /></div>
            <div className="space-y-2"><Label>Blood sugar (mmol/L)</Label><Input type="number" step="0.1" value={values.bloodSugar} onChange={(event) => updateField("bloodSugar", event.target.value)} placeholder="5.5" /></div>
            <div className="space-y-2 md:col-span-2"><Label>Chief complaint</Label><Textarea required value={values.presentingComplaint} onChange={(event) => updateField("presentingComplaint", event.target.value)} placeholder="Describe the presenting complaint..." /></div>
            <div className="space-y-2 md:col-span-2"><Label>Mechanism of injury (if trauma)</Label><Textarea value={values.mechanism} onChange={(event) => updateField("mechanism", event.target.value)} placeholder="Describe the mechanism..." /></div>
            <div className="space-y-2 md:col-span-2"><Label>Allergies</Label><Input value={values.allergies} onChange={(event) => updateField("allergies", event.target.value)} placeholder="Known allergies..." /></div>
            <div className="flex gap-3 md:col-span-2">
              <Button type="submit" disabled={!patientId || !triageLevel || !values.presentingComplaint.trim() || createCase.isPending}>
                {createCase.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Assessment
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate("/emergency")}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmergencyTriage;
