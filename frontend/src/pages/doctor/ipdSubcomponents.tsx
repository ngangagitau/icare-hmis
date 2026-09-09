import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import {
  AlertTriangle,
  ClipboardList,
  CheckCircle2,
  Plus,
  Save,
  Trash2,
  FileText,
  Upload,
  Printer,
  Clock,
  Activity,
  HeartPulse,
  Send,
  Download,
  Stethoscope,
  Droplets,
  Brain,
  FileCheck,
  ShieldAlert,
} from "lucide-react";

// ==========================================
// 1. NOTES VIEW COMPONENT
// ==========================================
export function NotesViewComponent({ patient }: { patient: any }) {
  const { toast } = useToast();
  const [notes, setNotes] = useState([
    {
      id: "N-1",
      author: patient.doctor || "Dr. Ochieng",
      cadre: "Consultant Physician",
      type: "Ward Round Note",
      note: "Patient remains stable with controlled blood pressure. Chest clear bilaterally, abdomen soft, no pedal edema. Plan: continue current antihypertensives, repeat U&E tomorrow.",
      time: "2026-03-14 09:20",
      priority: "Routine",
    },
    {
      id: "N-2",
      author: "Nurse Akinyi",
      cadre: "Staff Nurse",
      type: "Nursing Note",
      note: "IV site clean, patent without signs of phlebitis. Legs elevated, pain score 2/10 managed with paracetamol. Vital signs stable.",
      time: "2026-03-13 17:35",
      priority: "Routine",
    },
    {
      id: "N-3",
      author: "Dr. Njeri",
      cadre: "Senior Registrar",
      type: "Consult Note",
      note: "Cardiology review requested for optimization. ECG shows normal sinus rhythm with LVH criteria. Advised echo post discharge.",
      time: "2026-03-12 14:10",
      priority: "Important",
    },
  ]);

  const [filterType, setFilterType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newType, setNewType] = useState("Ward Round Note");
  const [newAuthor, setNewAuthor] = useState(patient.doctor || "Dr. John Smith");
  const [newPriority, setNewPriority] = useState("Routine");
  const [newNote, setNewNote] = useState("");

  const handleAddNote = () => {
    if (!newNote.trim()) {
      toast({ title: "Note required", description: "Please enter clinical note content.", variant: "destructive" });
      return;
    }
    const created = {
      id: `N-${Date.now()}`,
      author: newAuthor.trim() || "Attending Clinician",
      cadre: "Medical Staff",
      type: newType,
      note: newNote.trim(),
      time: new Date().toLocaleString(),
      priority: newPriority,
    };
    setNotes([created, ...notes]);
    setNewNote("");
    setShowAddForm(false);
    toast({ title: "Clinical Note Added", description: `${newType} saved successfully for ${patient.name}.` });
  };

  const handleDelete = (id: string) => {
    setNotes(notes.filter((n) => n.id !== id));
    toast({ title: "Note deleted", description: "Clinical note removed." });
  };

  const filteredNotes = notes.filter((item) => {
    const matchesType = filterType === "all" || item.type === filterType;
    const matchesSearch =
      !searchQuery ||
      item.note.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Clinical Notes & Ward Observations
          </CardTitle>
          <p className="text-xs text-muted-foreground">Recorded progress notes for admission #{patient.id}</p>
        </div>
        <Button size="sm" onClick={() => setShowAddForm(!showAddForm)} className="gap-2">
          <Plus className="h-4 w-4" />
          {showAddForm ? "Close Form" : "Add Clinical Note"}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {showAddForm && (
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-4">
            <p className="text-sm font-semibold">New Clinical Progress Note</p>
            <div className="grid gap-3 md:grid-cols-3">
              <div>
                <Label>Note Type</Label>
                <Select value={newType} onValueChange={setNewType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ward Round Note">Ward Round Note</SelectItem>
                    <SelectItem value="Nursing Note">Nursing Note</SelectItem>
                    <SelectItem value="Consult Note">Consult Note</SelectItem>
                    <SelectItem value="Doctor Note">Doctor Note</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Author</Label>
                <Input value={newAuthor} onChange={(e) => setNewAuthor(e.target.value)} />
              </div>
              <div>
                <Label>Priority</Label>
                <Select value={newPriority} onValueChange={setNewPriority}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Routine">Routine</SelectItem>
                    <SelectItem value="Important">Important</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Note Content</Label>
              <Textarea
                rows={3}
                placeholder="Enter clinical observations, findings, and immediate plan..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowAddForm(false)}>Cancel</Button>
              <Button size="sm" onClick={handleAddNote} className="gap-2">
                <Save className="h-4 w-4" /> Save Note
              </Button>
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Search notes by keyword or author..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Note Types</SelectItem>
              <SelectItem value="Ward Round Note">Ward Round Note</SelectItem>
              <SelectItem value="Nursing Note">Nursing Note</SelectItem>
              <SelectItem value="Consult Note">Consult Note</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-xl border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date / Time</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Note Details</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredNotes.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{item.time}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{item.type}</Badge>
                  </TableCell>
                  <TableCell className="font-medium text-sm">
                    {item.author}
                    <div className="text-xs text-muted-foreground">{item.cadre}</div>
                  </TableCell>
                  <TableCell className="text-sm max-w-[450px]">{item.note}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        item.priority === "Critical"
                          ? "bg-red-100 text-red-800"
                          : item.priority === "Important"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-blue-50 text-blue-700"
                      }
                    >
                      {item.priority}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(item.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredNotes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                    No notes matching your criteria.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

// ==========================================
// 2. VITAL SIGN GRAPH COMPONENT
// ==========================================
export function VitalSignGraphComponent({ patient }: { patient: any }) {
  const { toast } = useToast();
  const [timeframe, setTimeframe] = useState("24h");
  const [readings, setReadings] = useState([
    { time: "2026-03-14 16:00", temp: 36.8, pulse: 78, bpSys: 130, bpDia: 82, spo2: 98, rr: 18 },
    { time: "2026-03-14 12:00", temp: 37.0, pulse: 80, bpSys: 132, bpDia: 84, spo2: 97, rr: 18 },
    { time: "2026-03-14 08:00", temp: 36.9, pulse: 82, bpSys: 134, bpDia: 86, spo2: 98, rr: 19 },
    { time: "2026-03-13 20:00", temp: 37.1, pulse: 84, bpSys: 128, bpDia: 80, spo2: 98, rr: 18 },
    { time: "2026-03-13 14:00", temp: 36.7, pulse: 76, bpSys: 126, bpDia: 78, spo2: 99, rr: 17 },
  ]);

  const [newTemp, setNewTemp] = useState("36.8");
  const [newPulse, setNewPulse] = useState("78");
  const [newBpSys, setNewBpSys] = useState("130");
  const [newBpDia, setNewBpDia] = useState("82");
  const [newSpo2, setNewSpo2] = useState("98");
  const [newRr, setNewRr] = useState("18");

  const latest = readings[0] || { temp: 36.8, pulse: 78, bpSys: 130, bpDia: 82, spo2: 98, rr: 18 };

  const handleAddReading = () => {
    const reading = {
      time: new Date().toLocaleString([], { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }),
      temp: parseFloat(newTemp) || 36.8,
      pulse: parseInt(newPulse) || 78,
      bpSys: parseInt(newBpSys) || 120,
      bpDia: parseInt(newBpDia) || 80,
      spo2: parseInt(newSpo2) || 98,
      rr: parseInt(newRr) || 18,
    };
    setReadings([reading, ...readings]);
    toast({ title: "Vitals Recorded", description: `New vitals logged for ${patient.name}. Trend updated.` });
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card className="p-4 border-l-4 border-l-blue-500">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Temperature</p>
          <p className="text-2xl font-bold mt-1">{latest.temp}°C</p>
          <Badge variant="secondary" className="mt-1 text-xs">Normal (36.5 - 37.5)</Badge>
        </Card>
        <Card className="p-4 border-l-4 border-l-emerald-500">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Pulse Rate</p>
          <p className="text-2xl font-bold mt-1">{latest.pulse} bpm</p>
          <Badge variant="secondary" className="mt-1 text-xs">Normal (60 - 100)</Badge>
        </Card>
        <Card className="p-4 border-l-4 border-l-amber-500">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Blood Pressure</p>
          <p className="text-2xl font-bold mt-1">{latest.bpSys}/{latest.bpDia} mmHg</p>
          <Badge className="mt-1 text-xs bg-amber-100 text-amber-800">Borderline</Badge>
        </Card>
        <Card className="p-4 border-l-4 border-l-cyan-500">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">SpO2 (Oxygen)</p>
          <p className="text-2xl font-bold mt-1">{latest.spo2}%</p>
          <Badge variant="secondary" className="mt-1 text-xs">Optimal (≥ 95%)</Badge>
        </Card>
        <Card className="p-4 border-l-4 border-l-purple-500">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Resp Rate</p>
          <p className="text-2xl font-bold mt-1">{latest.rr} /min</p>
          <Badge variant="secondary" className="mt-1 text-xs">Normal (12 - 20)</Badge>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Vital Signs Trend Graph & Timeline
            </CardTitle>
            <p className="text-xs text-muted-foreground">Historical physiological progression</p>
          </div>
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
              <SelectItem value="48h">Last 48 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-2xl border bg-slate-950 p-6 text-white space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
              <span>Timepoint</span>
              <span>Temp (°C)</span>
              <span>Pulse (bpm)</span>
              <span>BP (mmHg)</span>
              <span>SpO2 (%)</span>
            </div>
            {readings.map((r, i) => (
              <div key={i} className="flex items-center justify-between text-sm py-1 border-b border-slate-900 last:border-0">
                <span className="text-xs text-slate-400">{r.time}</span>
                <span className="font-mono text-emerald-400">{r.temp}°C</span>
                <span className="font-mono text-cyan-400">{r.pulse} bpm</span>
                <span className="font-mono text-amber-400">{r.bpSys}/{r.bpDia}</span>
                <span className="font-mono text-blue-400">{r.spo2}%</span>
              </div>
            ))}
          </div>

          <div className="rounded-xl border p-4 bg-muted/40 space-y-3">
            <p className="text-sm font-semibold flex items-center gap-2">
              <HeartPulse className="h-4 w-4 text-primary" />
              Quick Log Bedside Reading
            </p>
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-6">
              <div>
                <Label className="text-xs">Temp (°C)</Label>
                <Input value={newTemp} onChange={(e) => setNewTemp(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Pulse (bpm)</Label>
                <Input value={newPulse} onChange={(e) => setNewPulse(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Systolic</Label>
                <Input value={newBpSys} onChange={(e) => setNewBpSys(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Diastolic</Label>
                <Input value={newBpDia} onChange={(e) => setNewBpDia(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">SpO2 (%)</Label>
                <Input value={newSpo2} onChange={(e) => setNewSpo2(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Resp (/min)</Label>
                <Input value={newRr} onChange={(e) => setNewRr(e.target.value)} />
              </div>
            </div>
            <div className="flex justify-end">
              <Button size="sm" onClick={handleAddReading} className="gap-2">
                <Save className="h-4 w-4" /> Save Reading to Trend
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ==========================================
// 3. PRESCRIBED MEDICINE COMPONENT
// ==========================================
export function PrescribedMedicineComponent({ patient }: { patient: any }) {
  const { toast } = useToast();
  const [prescriptions, setPrescriptions] = useState([
    {
      id: "RX-101",
      drug: "Captopril 25mg",
      dose: "25mg",
      route: "PO",
      frequency: "BD",
      duration: "7 days",
      startDate: "2026-03-10",
      prescribedBy: patient.doctor || "Dr. John Smith",
      status: "Active",
      instructions: "Take 1 hour before meals",
    },
    {
      id: "RX-102",
      drug: "Metformin 500mg",
      dose: "500mg",
      route: "PO",
      frequency: "BD",
      duration: "14 days",
      startDate: "2026-03-10",
      prescribedBy: patient.doctor || "Dr. John Smith",
      status: "Active",
      instructions: "Take with or after meals",
    },
    {
      id: "RX-103",
      drug: "Paracetamol 1g",
      dose: "1000mg",
      route: "PO",
      frequency: "PRN",
      duration: "5 days",
      startDate: "2026-03-12",
      prescribedBy: "Dr. Ochieng",
      status: "Active",
      instructions: "Max 4g in 24 hours for pain",
    },
  ]);

  const [showAdd, setShowAdd] = useState(false);
  const [drug, setDrug] = useState("");
  const [dose, setDose] = useState("");
  const [route, setRoute] = useState("PO");
  const [frequency, setFrequency] = useState("BD");
  const [duration, setDuration] = useState("5 days");
  const [instructions, setInstructions] = useState("");

  const handleAddMed = () => {
    if (!drug.trim()) {
      toast({ title: "Drug required", description: "Please enter drug name.", variant: "destructive" });
      return;
    }
    const newRx = {
      id: `RX-${Date.now().toString().slice(-4)}`,
      drug: drug.trim(),
      dose: dose.trim() || "As directed",
      route,
      frequency,
      duration: duration.trim() || "5 days",
      startDate: new Date().toISOString().slice(0, 10),
      prescribedBy: patient.doctor || "Dr. John Smith",
      status: "Active",
      instructions: instructions.trim() || "Follow clinical instructions",
    };
    setPrescriptions([newRx, ...prescriptions]);
    setDrug("");
    setDose("");
    setInstructions("");
    setShowAdd(false);
    toast({ title: "Prescription Created", description: `${newRx.drug} added to patient active medication chart.` });
  };

  const toggleStatus = (id: string) => {
    setPrescriptions(
      prescriptions.map((p) => (p.id === id ? { ...p, status: p.status === "Active" ? "Discontinued" : "Active" } : p))
    );
    toast({ title: "Status Updated", description: "Prescription status has been toggled." });
  };

  const removeMed = (id: string) => {
    setPrescriptions(prescriptions.filter((p) => p.id !== id));
    toast({ title: "Medication Removed", description: "Order deleted from chart." });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            Active Medication Orders
          </CardTitle>
          <p className="text-xs text-muted-foreground">Inpatient pharmacy prescription chart</p>
        </div>
        <Button size="sm" onClick={() => setShowAdd(!showAdd)} className="gap-2">
          <Plus className="h-4 w-4" />
          {showAdd ? "Cancel" : "Prescribe New Medicine"}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {showAdd && (
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-4">
            <p className="text-sm font-semibold">New Medication Order</p>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
              <div>
                <Label>Drug Name *</Label>
                <Input placeholder="e.g. Amoxicillin 500mg" value={drug} onChange={(e) => setDrug(e.target.value)} />
              </div>
              <div>
                <Label>Dosage</Label>
                <Input placeholder="e.g. 500mg or 1 tab" value={dose} onChange={(e) => setDose(e.target.value)} />
              </div>
              <div>
                <Label>Route</Label>
                <Select value={route} onValueChange={setRoute}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PO">PO (Oral)</SelectItem>
                    <SelectItem value="IV">IV (Intravenous)</SelectItem>
                    <SelectItem value="IM">IM (Intramuscular)</SelectItem>
                    <SelectItem value="SC">SC (Subcutaneous)</SelectItem>
                    <SelectItem value="Topical">Topical</SelectItem>
                    <SelectItem value="Inhalation">Inhalation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Frequency</Label>
                <Select value={frequency} onValueChange={setFrequency}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OD">OD (Once Daily)</SelectItem>
                    <SelectItem value="BD">BD (Twice Daily)</SelectItem>
                    <SelectItem value="TDS">TDS (Thrice Daily)</SelectItem>
                    <SelectItem value="QID">QID (Four Times Daily)</SelectItem>
                    <SelectItem value="PRN">PRN (As Needed)</SelectItem>
                    <SelectItem value="STAT">STAT (Immediately)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label>Duration</Label>
                <Input placeholder="e.g. 5 days" value={duration} onChange={(e) => setDuration(e.target.value)} />
              </div>
              <div>
                <Label>Special Instructions</Label>
                <Input placeholder="e.g. Take after meals" value={instructions} onChange={(e) => setInstructions(e.target.value)} />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowAdd(false)}>Cancel</Button>
              <Button size="sm" onClick={handleAddMed} className="gap-2">
                <CheckCircle2 className="h-4 w-4" /> Prescribe
              </Button>
            </div>
          </div>
        )}

        <div className="rounded-xl border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Drug Name</TableHead>
                <TableHead>Dose / Route</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Instructions</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {prescriptions.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    {item.drug}
                    <div className="text-xs text-muted-foreground">{item.id} · Prescribed by {item.prescribedBy}</div>
                  </TableCell>
                  <TableCell>{item.dose} · {item.route}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{item.frequency}</Badge>
                  </TableCell>
                  <TableCell>{item.duration}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{item.instructions}</TableCell>
                  <TableCell>
                    <Badge className={item.status === "Active" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-700"}>
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" onClick={() => toggleStatus(item.id)}>
                      {item.status === "Active" ? "Discontinue" : "Resume"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeMed(item.id)}
                      className="text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

// ==========================================
// 4. MAR COMPONENT
// ==========================================
export function MARComponent({ patient }: { patient: any }) {
  const { toast } = useToast();
  const [shift, setShift] = useState("all");
  const [administrations, setAdministrations] = useState([
    { id: "MAR-1", time: "08:00", shift: "morning", medication: "Captopril 25mg", dose: "25mg PO", nurse: "Nurse Akinyi", status: "Given", notes: "Taken with water, tolerated well" },
    { id: "MAR-2", time: "08:00", shift: "morning", medication: "Metformin 500mg", dose: "500mg PO", nurse: "Nurse Akinyi", status: "Given", notes: "Administered post-breakfast" },
    { id: "MAR-3", time: "14:00", shift: "afternoon", medication: "Metformin 500mg", dose: "500mg PO", nurse: "Nurse Wanjiru", status: "Scheduled", notes: "Due with lunch" },
    { id: "MAR-4", time: "20:00", shift: "night", medication: "Captopril 25mg", dose: "25mg PO", nurse: "Nurse Chebet", status: "Scheduled", notes: "Night routine dose" },
  ]);

  const [medName, setMedName] = useState("Captopril 25mg");
  const [adminTime, setAdminTime] = useState("14:00");
  const [adminStatus, setAdminStatus] = useState("Given");
  const [adminNurse, setAdminNurse] = useState("Nurse Wanjiru");
  const [adminNotes, setAdminNotes] = useState("");

  const handleLogAdmin = () => {
    const rec = {
      id: `MAR-${Date.now().toString().slice(-4)}`,
      time: adminTime,
      shift: parseInt(adminTime) < 14 ? "morning" : parseInt(adminTime) < 20 ? "afternoon" : "night",
      medication: medName,
      dose: "Standard dose",
      nurse: adminNurse,
      status: adminStatus,
      notes: adminNotes.trim() || "Recorded bedside administration",
    };
    setAdministrations([rec, ...administrations]);
    setAdminNotes("");
    toast({ title: "MAR Entry Recorded", description: `${medName} logged as ${adminStatus} by ${adminNurse}.` });
  };

  const updateStatus = (id: string, newStatus: string) => {
    setAdministrations(administrations.map((a) => (a.id === id ? { ...a, status: newStatus } : a)));
    toast({ title: "Administration Updated", description: `Marked as ${newStatus}.` });
  };

  const filtered = shift === "all" ? administrations : administrations.filter((a) => a.shift === shift);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Medication Administration Record (MAR)
          </CardTitle>
          <p className="text-xs text-muted-foreground">Nurse medication distribution and bedside signing</p>
        </div>
        <Select value={shift} onValueChange={setShift}>
          <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Shifts</SelectItem>
            <SelectItem value="morning">Morning (06:00 - 14:00)</SelectItem>
            <SelectItem value="afternoon">Afternoon (14:00 - 22:00)</SelectItem>
            <SelectItem value="night">Night (22:00 - 06:00)</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-xl border p-4 bg-muted/40 space-y-3">
          <p className="text-sm font-semibold">Record Medication Administration</p>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
            <div>
              <Label>Medication</Label>
              <Input value={medName} onChange={(e) => setMedName(e.target.value)} />
            </div>
            <div>
              <Label>Scheduled / Actual Time</Label>
              <Input type="time" value={adminTime} onChange={(e) => setAdminTime(e.target.value)} />
            </div>
            <div>
              <Label>Nurse Signature</Label>
              <Input value={adminNurse} onChange={(e) => setAdminNurse(e.target.value)} />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={adminStatus} onValueChange={setAdminStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Given">Given</SelectItem>
                  <SelectItem value="Held">Held (Doctor Order)</SelectItem>
                  <SelectItem value="Refused">Refused by Patient</SelectItem>
                  <SelectItem value="Omitted">Omitted / NPO</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Administration Notes / Reason</Label>
            <Input
              placeholder="e.g. Held due to BP 90/60 or patient sleeping"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
            />
          </div>
          <div className="flex justify-end">
            <Button size="sm" onClick={handleLogAdmin} className="gap-2">
              <CheckCircle2 className="h-4 w-4" /> Record on MAR
            </Button>
          </div>
        </div>

        <div className="rounded-xl border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Medication & Dose</TableHead>
                <TableHead>Nurse Staff</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="text-right">Quick Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono text-sm font-semibold">{item.time}</TableCell>
                  <TableCell>
                    <div className="font-medium">{item.medication}</div>
                    <div className="text-xs text-muted-foreground">{item.dose}</div>
                  </TableCell>
                  <TableCell>{item.nurse}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        item.status === "Given"
                          ? "bg-emerald-100 text-emerald-800"
                          : item.status === "Held"
                          ? "bg-amber-100 text-amber-800"
                          : item.status === "Refused"
                          ? "bg-red-100 text-red-800"
                          : "bg-blue-100 text-blue-800"
                      }
                    >
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{item.notes}</TableCell>
                  <TableCell className="text-right space-x-2">
                    {item.status !== "Given" && (
                      <Button size="sm" variant="outline" onClick={() => updateStatus(item.id, "Given")}>
                        Mark Given
                      </Button>
                    )}
                    {item.status !== "Held" && (
                      <Button size="sm" variant="ghost" onClick={() => updateStatus(item.id, "Held")}>
                        Hold
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

// ==========================================
// 5. IPD SERVICES COMPONENT
// ==========================================
export function IPDServicesComponent({ patient }: { patient: any }) {
  const { toast } = useToast();
  const [services, setServices] = useState([
    { id: "SRV-1", name: "Physiotherapy & Mobilization", department: "Rehabilitation", priority: "Urgent", status: "In Progress", date: "2026-03-14", notes: "Post-op chest therapy and passive range of motion" },
    { id: "SRV-2", name: "Dietitian Consultation", department: "Nutrition", priority: "Routine", status: "Scheduled", date: "2026-03-15", notes: "Diabetic meal plan optimization" },
    { id: "SRV-3", name: "Wound Care Specialist Review", department: "Nursing Special", priority: "Routine", status: "Completed", date: "2026-03-12", notes: "Initial post-op dressing evaluation" },
  ]);

  const [serviceName, setServiceName] = useState("");
  const [dept, setDept] = useState("Rehabilitation");
  const [priority, setPriority] = useState("Routine");
  const [notes, setNotes] = useState("");

  const handleAddService = () => {
    if (!serviceName.trim()) {
      toast({ title: "Service required", description: "Please enter service name.", variant: "destructive" });
      return;
    }
    const newSrv = {
      id: `SRV-${Date.now().toString().slice(-4)}`,
      name: serviceName.trim(),
      department: dept,
      priority,
      status: "Pending",
      date: new Date().toISOString().slice(0, 10),
      notes: notes.trim() || "Inpatient clinical request",
    };
    setServices([newSrv, ...services]);
    setServiceName("");
    setNotes("");
    toast({ title: "IPD Service Ordered", description: `${newSrv.name} sent to ${dept}.` });
  };

  const updateStatus = (id: string, s: string) => {
    setServices(services.map((srv) => (srv.id === id ? { ...srv, status: s } : s)));
    toast({ title: "Service Updated", description: `Status changed to ${s}.` });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Stethoscope className="h-5 w-5 text-primary" />
          Inpatient Clinical Services Tracker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-xl border p-4 bg-muted/40 space-y-3">
          <p className="text-sm font-semibold">Order New Service</p>
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <Label>Service Name *</Label>
              <Input placeholder="e.g. Speech & Swallow Therapy" value={serviceName} onChange={(e) => setServiceName(e.target.value)} />
            </div>
            <div>
              <Label>Department</Label>
              <Select value={dept} onValueChange={setDept}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Rehabilitation">Rehabilitation</SelectItem>
                  <SelectItem value="Nutrition">Nutrition & Dietetics</SelectItem>
                  <SelectItem value="Social Work">Medical Social Work</SelectItem>
                  <SelectItem value="Nursing Special">Specialized Nursing</SelectItem>
                  <SelectItem value="Respiratory">Respiratory Care</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Routine">Routine</SelectItem>
                  <SelectItem value="Urgent">Urgent</SelectItem>
                  <SelectItem value="STAT">STAT / Immediate</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Clinical Indication & Notes</Label>
            <Input placeholder="Specify clinical reason or instructions" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <div className="flex justify-end">
            <Button size="sm" onClick={handleAddService} className="gap-2">
              <Plus className="h-4 w-4" /> Order Service
            </Button>
          </div>
        </div>

        <div className="rounded-xl border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell>{s.department}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{s.priority}</Badge>
                  </TableCell>
                  <TableCell>{s.date}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        s.status === "Completed"
                          ? "bg-emerald-100 text-emerald-800"
                          : s.status === "In Progress"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-amber-100 text-amber-800"
                      }
                    >
                      {s.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{s.notes}</TableCell>
                  <TableCell className="text-right space-x-1">
                    {s.status !== "Completed" && (
                      <Button size="sm" variant="outline" onClick={() => updateStatus(s.id, "Completed")}>
                        Done
                      </Button>
                    )}
                    {s.status === "Pending" && (
                      <Button size="sm" variant="ghost" onClick={() => updateStatus(s.id, "In Progress")}>
                        Start
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

// ==========================================
// 6. PROCEDURES COMPONENT
// ==========================================
export function ProceduresComponent({ patient }: { patient: any }) {
  const { toast } = useToast();
  const [procedures, setProcedures] = useState([
    { id: "PRC-1", procedure: "IV Cannulation 18G", category: "Bedside Intervention", date: "2026-03-13", clinician: "Dr. Ochieng", anesthesia: "None", status: "Completed", notes: "Cephalic vein right arm" },
    { id: "PRC-2", procedure: "Chest X-ray PA View", category: "Diagnostic Imaging", date: "2026-03-15", clinician: "Radiology Team", anesthesia: "None", status: "Planned", notes: "Assess lung field resolution" },
    { id: "PRC-3", procedure: "Wound Suture Removal", category: "Minor Surgical", date: "2026-03-16", clinician: patient.doctor || "Dr. John Smith", anesthesia: "Local", status: "Planned", notes: "Planned prior to discharge" },
  ]);

  const [procName, setProcName] = useState("");
  const [category, setCategory] = useState("Minor Surgical");
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().slice(0, 10));
  const [clinician, setClinician] = useState(patient.doctor || "Dr. John Smith");
  const [anesthesia, setAnesthesia] = useState("Local");
  const [notes, setNotes] = useState("");

  const handleAddProc = () => {
    if (!procName.trim()) {
      toast({ title: "Procedure required", description: "Please enter procedure name.", variant: "destructive" });
      return;
    }
    const newProc = {
      id: `PRC-${Date.now().toString().slice(-4)}`,
      procedure: procName.trim(),
      category,
      date: scheduledDate,
      clinician: clinician.trim() || "Lead Clinician",
      anesthesia,
      status: "Planned",
      notes: notes.trim() || "Clinical procedure request",
    };
    setProcedures([newProc, ...procedures]);
    setProcName("");
    setNotes("");
    toast({ title: "Procedure Scheduled", description: `${newProc.procedure} added to care plan.` });
  };

  const updateStatus = (id: string, st: string) => {
    setProcedures(procedures.map((p) => (p.id === id ? { ...p, status: st } : p)));
    toast({ title: "Procedure Updated", description: `Marked as ${st}.` });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Inpatient Procedures & Surgical Interventions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-xl border p-4 bg-muted/40 space-y-3">
          <p className="text-sm font-semibold">Schedule / Log Procedure</p>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
            <div>
              <Label>Procedure Name *</Label>
              <Input placeholder="e.g. Wound Debridement" value={procName} onChange={(e) => setProcName(e.target.value)} />
            </div>
            <div>
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bedside Intervention">Bedside Intervention</SelectItem>
                  <SelectItem value="Minor Surgical">Minor Surgical</SelectItem>
                  <SelectItem value="Major Surgical">Major Surgical</SelectItem>
                  <SelectItem value="Diagnostic Imaging">Diagnostic Imaging</SelectItem>
                  <SelectItem value="Endoscopy">Endoscopy</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Planned Date</Label>
              <Input type="date" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} />
            </div>
            <div>
              <Label>Clinician / Surgeon</Label>
              <Input value={clinician} onChange={(e) => setClinician(e.target.value)} />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Anesthesia</Label>
              <Select value={anesthesia} onValueChange={setAnesthesia}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="None">None</SelectItem>
                  <SelectItem value="Local">Local Anesthesia</SelectItem>
                  <SelectItem value="Sedation">Conscious Sedation</SelectItem>
                  <SelectItem value="General">General Anesthesia</SelectItem>
                  <SelectItem value="Spinal">Spinal / Epidural</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Clinical Notes / Site Details</Label>
              <Input placeholder="Anatomical location or remarks" value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
          </div>
          <div className="flex justify-end">
            <Button size="sm" onClick={handleAddProc} className="gap-2">
              <Plus className="h-4 w-4" /> Save Procedure
            </Button>
          </div>
        </div>

        <div className="rounded-xl border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Procedure</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Clinician</TableHead>
                <TableHead>Anesthesia</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {procedures.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">
                    {p.procedure}
                    <div className="text-xs text-muted-foreground">{p.notes}</div>
                  </TableCell>
                  <TableCell>{p.category}</TableCell>
                  <TableCell>{p.date}</TableCell>
                  <TableCell>{p.clinician}</TableCell>
                  <TableCell>{p.anesthesia}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        p.status === "Completed"
                          ? "bg-emerald-100 text-emerald-800"
                          : p.status === "Planned"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-slate-100 text-slate-800"
                      }
                    >
                      {p.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    {p.status !== "Completed" && (
                      <Button size="sm" variant="outline" onClick={() => updateStatus(p.id, "Completed")}>
                        Mark Completed
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

// ==========================================
// 7. DOCTOR VISIT COMPONENT
// ==========================================
export function DoctorVisitComponent({ patient }: { patient: any }) {
  const { toast } = useToast();
  const [visits, setVisits] = useState([
    {
      id: "DV-1",
      doctor: patient.doctor || "Dr. Ochieng",
      cadre: "Consultant Physician",
      date: "2026-03-14",
      time: "09:00",
      findings: "Patient fully alert, afebrile. BP 130/82, Chest clear. Good oral tolerance.",
      managementPlan: "Continue antihypertensives, repeat U&E tomorrow morning. Encourage ambulation.",
      nextReview: "Tomorrow 09:00",
    },
    {
      id: "DV-2",
      doctor: "Dr. Njeri",
      cadre: "Senior Registrar",
      date: "2026-03-13",
      time: "15:00",
      findings: "Post-op wound clean, no signs of infection. Drain output 50ml serous.",
      managementPlan: "Step down analgesia to oral paracetamol. Remove drain tomorrow if <30ml.",
      nextReview: "Tomorrow 09:00",
    },
  ]);

  const [docName, setDocName] = useState(patient.doctor || "Dr. John Smith");
  const [cadre, setCadre] = useState("Consultant");
  const [findings, setFindings] = useState("");
  const [plan, setPlan] = useState("");
  const [nextReview, setNextReview] = useState("Tomorrow morning round");

  const handleAddVisit = () => {
    if (!findings.trim() || !plan.trim()) {
      toast({ title: "Details required", description: "Please enter examination findings and management plan.", variant: "destructive" });
      return;
    }
    const newVisit = {
      id: `DV-${Date.now().toString().slice(-4)}`,
      doctor: docName.trim(),
      cadre,
      date: new Date().toISOString().slice(0, 10),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      findings: findings.trim(),
      managementPlan: plan.trim(),
      nextReview: nextReview.trim(),
    };
    setVisits([newVisit, ...visits]);
    setFindings("");
    setPlan("");
    toast({ title: "Doctor Visit Logged", description: `Ward round documentation saved for ${patient.name}.` });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Stethoscope className="h-5 w-5 text-primary" />
          Doctor Ward Round & Visit Logs
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-xl border p-4 bg-muted/40 space-y-3">
          <p className="text-sm font-semibold">Log Ward Round Visit</p>
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <Label>Doctor Name</Label>
              <Input value={docName} onChange={(e) => setDocName(e.target.value)} />
            </div>
            <div>
              <Label>Cadre / Designation</Label>
              <Select value={cadre} onValueChange={setCadre}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Consultant">Consultant</SelectItem>
                  <SelectItem value="Senior Registrar">Senior Registrar</SelectItem>
                  <SelectItem value="Medical Officer">Medical Officer</SelectItem>
                  <SelectItem value="Clinical Officer">Clinical Officer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Next Planned Review</Label>
              <Input value={nextReview} onChange={(e) => setNextReview(e.target.value)} />
            </div>
          </div>
          <div>
            <Label>Examination Findings & Observations</Label>
            <Textarea rows={2} placeholder="Subjective complaints, vitals summary, physical examination..." value={findings} onChange={(e) => setFindings(e.target.value)} />
          </div>
          <div>
            <Label>Clinical Orders & Management Plan</Label>
            <Textarea rows={2} placeholder="Medication adjustments, lab tests ordered, discharge goals..." value={plan} onChange={(e) => setPlan(e.target.value)} />
          </div>
          <div className="flex justify-end">
            <Button size="sm" onClick={handleAddVisit} className="gap-2">
              <CheckCircle2 className="h-4 w-4" /> Save Visit Note
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          {visits.map((v) => (
            <div key={v.id} className="rounded-xl border p-4 space-y-2 bg-card">
              <div className="flex flex-wrap items-center justify-between border-b pb-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">{v.doctor}</span>
                  <Badge variant="outline">{v.cadre}</Badge>
                </div>
                <span className="text-xs text-muted-foreground">{v.date} at {v.time}</span>
              </div>
              <div className="grid gap-2 text-sm md:grid-cols-2 pt-1">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Findings</p>
                  <p className="text-slate-700 mt-0.5">{v.findings}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Plan & Orders</p>
                  <p className="text-slate-700 mt-0.5">{v.managementPlan}</p>
                </div>
              </div>
              <div className="text-xs text-muted-foreground pt-1">
                Next Review: <span className="font-medium text-foreground">{v.nextReview}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ==========================================
// 8. VITAL SIGN CHART COMPONENT
// ==========================================
export function VitalSignChartComponent({ patient }: { patient: any }) {
  const { toast } = useToast();
  const [chart, setChart] = useState([
    { id: "V-1", date: "2026-03-14 16:00", temp: "36.8°C", pulse: "78 bpm", bp: "130/82 mmHg", rr: "18 /min", spo2: "98%", nurse: "Nurse Akinyi" },
    { id: "V-2", date: "2026-03-14 08:00", temp: "36.9°C", pulse: "82 bpm", bp: "134/86 mmHg", rr: "19 /min", spo2: "98%", nurse: "Nurse Wanjiru" },
    { id: "V-3", date: "2026-03-13 20:00", temp: "37.1°C", pulse: "80 bpm", bp: "128/80 mmHg", rr: "18 /min", spo2: "98%", nurse: "Nurse Chebet" },
  ]);

  const [t, setT] = useState("36.8");
  const [p, setP] = useState("80");
  const [bp, setBp] = useState("120/80");
  const [rr, setRr] = useState("18");
  const [spo2, setSpo2] = useState("98");
  const [nurse, setNurse] = useState("Nurse Akinyi");

  const handleAdd = () => {
    const newEntry = {
      id: `V-${Date.now().toString().slice(-4)}`,
      date: new Date().toLocaleString([], { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }),
      temp: `${t}°C`,
      pulse: `${p} bpm`,
      bp: `${bp} mmHg`,
      rr: `${rr} /min`,
      spo2: `${spo2}%`,
      nurse,
    };
    setChart([newEntry, ...chart]);
    toast({ title: "Vitals Charted", description: "Entry added to patient permanent chart." });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Structured Vital Sign Chart
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-xl border p-4 bg-muted/40 space-y-3">
          <p className="text-sm font-semibold">Record Bedside Vital Signs</p>
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-6">
            <div>
              <Label>Temp (°C)</Label>
              <Input value={t} onChange={(e) => setT(e.target.value)} />
            </div>
            <div>
              <Label>Pulse (bpm)</Label>
              <Input value={p} onChange={(e) => setP(e.target.value)} />
            </div>
            <div>
              <Label>BP (mmHg)</Label>
              <Input value={bp} onChange={(e) => setBp(e.target.value)} />
            </div>
            <div>
              <Label>Resp (/min)</Label>
              <Input value={rr} onChange={(e) => setRr(e.target.value)} />
            </div>
            <div>
              <Label>SpO2 (%)</Label>
              <Input value={spo2} onChange={(e) => setSpo2(e.target.value)} />
            </div>
            <div>
              <Label>Nurse Signature</Label>
              <Input value={nurse} onChange={(e) => setNurse(e.target.value)} />
            </div>
          </div>
          <div className="flex justify-end">
            <Button size="sm" onClick={handleAdd} className="gap-2">
              <Plus className="h-4 w-4" /> Add Vitals Entry
            </Button>
          </div>
        </div>

        <div className="rounded-xl border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date / Time</TableHead>
                <TableHead>Temperature</TableHead>
                <TableHead>Pulse</TableHead>
                <TableHead>Blood Pressure</TableHead>
                <TableHead>Resp Rate</TableHead>
                <TableHead>SpO2</TableHead>
                <TableHead>Recorded By</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {chart.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-mono text-xs">{c.date}</TableCell>
                  <TableCell className="font-medium">{c.temp}</TableCell>
                  <TableCell>{c.pulse}</TableCell>
                  <TableCell>{c.bp}</TableCell>
                  <TableCell>{c.rr}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{c.spo2}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{c.nurse}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

// ==========================================
// 9. BLOOD TRANSFUSION COMPONENT
// ==========================================
export function BloodTransfusionComponent({ patient }: { patient: any }) {
  const { toast } = useToast();
  const [bloodGroup, setBloodGroup] = useState("O+");
  const [component, setComponent] = useState("Packed Red Blood Cells (PRBC)");
  const [units, setUnits] = useState(2);
  const [urgency, setUrgency] = useState("Urgent");
  const [hb, setHb] = useState("7.8");
  const [indication, setIndication] = useState("Post-operative symptomatic anemia");
  const [consent, setConsent] = useState(true);
  const [sampleSent, setSampleSent] = useState(true);
  const [requests, setRequests] = useState([
    { id: "BTR-101", component: "Packed Red Blood Cells", units: 2, group: "O+", urgency: "Urgent", status: "Crossmatched - Ready", date: "2026-03-14" },
  ]);

  const handleSubmit = () => {
    if (!consent) {
      toast({ title: "Consent required", description: "Blood transfusion consent must be obtained.", variant: "destructive" });
      return;
    }
    const newReq = {
      id: `BTR-${Date.now().toString().slice(-4)}`,
      component,
      units,
      group: bloodGroup,
      urgency,
      status: "Requested from Blood Bank",
      date: new Date().toISOString().slice(0, 10),
    };
    setRequests([newReq, ...requests]);
    toast({ title: "Blood Requisition Submitted", description: `${units} unit(s) of ${component} requested for ${patient.name}.` });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Droplets className="h-5 w-5 text-red-600" />
          Blood Transfusion Order & Pre-Transfusion Safety
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-xl border p-4 bg-red-50/40 space-y-4">
          <p className="text-sm font-semibold text-red-900">Blood Product Request</p>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
            <div>
              <Label>Patient Blood Group</Label>
              <Select value={bloodGroup} onValueChange={setBloodGroup}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="A+">A Positive (A+)</SelectItem>
                  <SelectItem value="A-">A Negative (A-)</SelectItem>
                  <SelectItem value="B+">B Positive (B+)</SelectItem>
                  <SelectItem value="B-">B Negative (B-)</SelectItem>
                  <SelectItem value="O+">O Positive (O+)</SelectItem>
                  <SelectItem value="O-">O Negative (O-)</SelectItem>
                  <SelectItem value="AB+">AB Positive (AB+)</SelectItem>
                  <SelectItem value="AB-">AB Negative (AB-)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Component</Label>
              <Select value={component} onValueChange={setComponent}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Packed Red Blood Cells (PRBC)">Packed Red Cells (PRBC)</SelectItem>
                  <SelectItem value="Whole Blood">Whole Blood</SelectItem>
                  <SelectItem value="Platelet Concentrate">Platelet Concentrate</SelectItem>
                  <SelectItem value="Fresh Frozen Plasma (FFP)">Fresh Frozen Plasma (FFP)</SelectItem>
                  <SelectItem value="Cryoprecipitate">Cryoprecipitate</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Units Needed</Label>
              <Input type="number" min={1} max={10} value={units} onChange={(e) => setUnits(Number(e.target.value) || 1)} />
            </div>
            <div>
              <Label>Current Hb (g/dL)</Label>
              <Input value={hb} onChange={(e) => setHb(e.target.value)} />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Urgency</Label>
              <Select value={urgency} onValueChange={setUrgency}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Stat">Stat / Immediate Emergency</SelectItem>
                  <SelectItem value="Urgent">Urgent (Within 2 Hours)</SelectItem>
                  <SelectItem value="Routine">Elective / Scheduled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Clinical Indication</Label>
              <Input value={indication} onChange={(e) => setIndication(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t">
            <div className="flex items-center space-x-2">
              <Checkbox id="consent-check" checked={consent} onCheckedChange={(v) => setConsent(Boolean(v))} />
              <label htmlFor="consent-check" className="text-xs font-medium cursor-pointer">
                Informed written transfusion consent signed by patient / legal guardian
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="sample-check" checked={sampleSent} onCheckedChange={(v) => setSampleSent(Boolean(v))} />
              <label htmlFor="sample-check" className="text-xs font-medium cursor-pointer">
                Crossmatch sample drawn and dispatched to lab with double bedside verification
              </label>
            </div>
          </div>

          <div className="flex justify-end">
            <Button size="sm" onClick={handleSubmit} className="gap-2 bg-red-600 hover:bg-red-700 text-white">
              <Send className="h-4 w-4" /> Submit Transfusion Request
            </Button>
          </div>
        </div>

        <div className="rounded-xl border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Request ID</TableHead>
                <TableHead>Component</TableHead>
                <TableHead>Units</TableHead>
                <TableHead>Group</TableHead>
                <TableHead>Urgency</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-semibold">{r.id}</TableCell>
                  <TableCell>{r.component}</TableCell>
                  <TableCell>{r.units}</TableCell>
                  <TableCell>{r.group}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{r.urgency}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-amber-100 text-amber-800">{r.status}</Badge>
                  </TableCell>
                  <TableCell>{r.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

// ==========================================
// 10. BLOOD TRANSFUSION RECORD COMPONENT
// ==========================================
export function BloodTransfusionRecordComponent({ patient }: { patient: any }) {
  const { toast } = useToast();
  const [records, setRecords] = useState([
    {
      id: "TR-1",
      date: "2026-03-12",
      bagNo: "KEN-BT-89412",
      component: "Packed Cells",
      units: 1,
      startTime: "14:00",
      endTime: "16:30",
      preVitals: "BP 118/74, Temp 36.7°C, Pulse 76",
      postVitals: "BP 124/78, Temp 36.9°C, Pulse 80",
      adverse: "None",
      nurse: "Nurse Akinyi",
      status: "Completed",
    },
  ]);

  const [bagNo, setBagNo] = useState("");
  const [comp, setComp] = useState("Packed Cells");
  const [nurseName, setNurseName] = useState("Nurse Akinyi");
  const [preVitals, setPreVitals] = useState("BP 120/80, Temp 36.8°C");

  const handleAdd = () => {
    if (!bagNo.trim()) {
      toast({ title: "Bag Number Required", description: "Enter blood bag barcode/serial.", variant: "destructive" });
      return;
    }
    const newRec = {
      id: `TR-${Date.now().toString().slice(-4)}`,
      date: new Date().toISOString().slice(0, 10),
      bagNo: bagNo.trim(),
      component: comp,
      units: 1,
      startTime: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      endTime: "In Progress",
      preVitals,
      postVitals: "Monitoring underway",
      adverse: "None",
      nurse: nurseName,
      status: "In Progress",
    };
    setRecords([newRec, ...records]);
    setBagNo("");
    toast({ title: "Transfusion Session Started", description: `Bag ${newRec.bagNo} initiated.` });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Droplets className="h-5 w-5 text-red-600" />
          Delivered Blood Transfusion Administration Records
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-xl border p-4 bg-muted/40 space-y-3">
          <p className="text-sm font-semibold">Start Bedside Transfusion Session</p>
          <div className="grid gap-3 sm:grid-cols-4">
            <div>
              <Label>Blood Bag / Unit Serial No. *</Label>
              <Input placeholder="e.g. KEN-BT-9921" value={bagNo} onChange={(e) => setBagNo(e.target.value)} />
            </div>
            <div>
              <Label>Component</Label>
              <Select value={comp} onValueChange={setComp}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Packed Cells">Packed Cells</SelectItem>
                  <SelectItem value="Whole Blood">Whole Blood</SelectItem>
                  <SelectItem value="Platelets">Platelets</SelectItem>
                  <SelectItem value="FFP">FFP</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Baseline Pre-Vitals</Label>
              <Input value={preVitals} onChange={(e) => setPreVitals(e.target.value)} />
            </div>
            <div>
              <Label>Administering Nurse</Label>
              <Input value={nurseName} onChange={(e) => setNurseName(e.target.value)} />
            </div>
          </div>
          <div className="flex justify-end">
            <Button size="sm" onClick={handleAdd} className="gap-2">
              <Plus className="h-4 w-4" /> Start Transfusion
            </Button>
          </div>
        </div>

        <div className="rounded-xl border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date / Time</TableHead>
                <TableHead>Unit / Bag No.</TableHead>
                <TableHead>Component</TableHead>
                <TableHead>Pre-Vitals</TableHead>
                <TableHead>Adverse Reactions</TableHead>
                <TableHead>Nurse</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="text-xs">{r.date} ({r.startTime})</TableCell>
                  <TableCell className="font-mono font-semibold">{r.bagNo}</TableCell>
                  <TableCell>{r.component}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{r.preVitals}</TableCell>
                  <TableCell>
                    <Badge className={r.adverse === "None" ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}>
                      {r.adverse}
                    </Badge>
                  </TableCell>
                  <TableCell>{r.nurse}</TableCell>
                  <TableCell>
                    <Badge variant={r.status === "Completed" ? "secondary" : "default"}>{r.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

// ==========================================
// 11. BILLING COMPONENT
// ==========================================
export function BillingComponent({ patient }: { patient: any }) {
  const { toast } = useToast();
  const [charges, setCharges] = useState([
    { id: "C-1", item: "Bed Charges (4 Days @ KES 1,050)", category: "Room & Board", amount: 4200, coverage: "NHIF / SHA" },
    { id: "C-2", item: "Inpatient Medications & Infusions", category: "Pharmacy", amount: 1800, coverage: "Insurance" },
    { id: "C-3", item: "Full Blood Count, U&E, Lipid Panel", category: "Laboratory", amount: 2100, coverage: "NHIF / SHA" },
    { id: "C-4", item: "Physiotherapy Session (2 sessions)", category: "Therapy", amount: 2000, coverage: "Insurance" },
  ]);

  const [itemDesc, setItemDesc] = useState("");
  const [category, setCategory] = useState("Pharmacy");
  const [amount, setAmount] = useState(1000);
  const [coverage, setCoverage] = useState("Insurance");

  const total = charges.reduce((acc, curr) => acc + curr.amount, 0);

  const handleAddCharge = () => {
    if (!itemDesc.trim()) {
      toast({ title: "Description required", description: "Enter charge description.", variant: "destructive" });
      return;
    }
    const newC = {
      id: `C-${Date.now().toString().slice(-4)}`,
      item: itemDesc.trim(),
      category,
      amount,
      coverage,
    };
    setCharges([...charges, newC]);
    setItemDesc("");
    toast({ title: "Charge Added", description: `KES ${amount} added to inpatient bill.` });
  };

  const handleRemove = (id: string) => {
    setCharges(charges.filter((c) => c.id !== id));
    toast({ title: "Charge Removed", description: "Item removed from bill." });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            Inpatient Ledger & Charges
          </CardTitle>
          <p className="text-xs text-muted-foreground">Admission financial statement for #{patient.id}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground uppercase">Current Total</p>
          <p className="text-xl font-bold text-primary">KES {total.toLocaleString()}</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-xl border p-4 bg-muted/40 space-y-3">
          <p className="text-sm font-semibold">Add Billable Charge Item</p>
          <div className="grid gap-3 sm:grid-cols-4">
            <div className="sm:col-span-2">
              <Label>Description *</Label>
              <Input placeholder="e.g. Specialized Nursing Dressing" value={itemDesc} onChange={(e) => setItemDesc(e.target.value)} />
            </div>
            <div>
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Room & Board">Room & Board</SelectItem>
                  <SelectItem value="Pharmacy">Pharmacy</SelectItem>
                  <SelectItem value="Laboratory">Laboratory</SelectItem>
                  <SelectItem value="Radiology">Radiology</SelectItem>
                  <SelectItem value="Therapy">Therapy</SelectItem>
                  <SelectItem value="Consumables">Consumables</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Amount (KES)</Label>
              <Input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value) || 0)} />
            </div>
          </div>
          <div className="flex justify-end">
            <Button size="sm" onClick={handleAddCharge} className="gap-2">
              <Plus className="h-4 w-4" /> Add to Bill
            </Button>
          </div>
        </div>

        <div className="rounded-xl border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Coverage</TableHead>
                <TableHead className="text-right">Amount (KES)</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {charges.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.item}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{c.category}</Badge>
                  </TableCell>
                  <TableCell>{c.coverage}</TableCell>
                  <TableCell className="text-right font-mono font-semibold">{c.amount.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleRemove(c.id)} className="text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="font-bold bg-muted/30">
                <TableCell colSpan={3}>Grand Total</TableCell>
                <TableCell className="text-right font-mono text-base">KES {total.toLocaleString()}</TableCell>
                <TableCell />
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

// ==========================================
// 12. ALLERGY COMPONENT
// ==========================================
export function AllergyComponent({ patient }: { patient: any }) {
  const { toast } = useToast();
  const [allergies, setAllergies] = useState([
    { id: "A-1", agent: "Penicillin", category: "Drug", reaction: "Maculopapular Rash, Urticaria", severity: "Moderate", date: "2024-05-10" },
    { id: "A-2", agent: "Diclofenac / NSAIDs", category: "Drug", reaction: "Bronchospasm, Facial Edema", severity: "Severe / Anaphylaxis", date: "2025-01-14" },
  ]);

  const [agent, setAgent] = useState("");
  const [category, setCategory] = useState("Drug");
  const [reaction, setReaction] = useState("");
  const [severity, setSeverity] = useState("Moderate");

  const hasSevere = allergies.some((a) => a.severity.includes("Severe"));

  const handleAdd = () => {
    if (!agent.trim() || !reaction.trim()) {
      toast({ title: "Fields required", description: "Please enter allergen and reaction.", variant: "destructive" });
      return;
    }
    const newA = {
      id: `A-${Date.now().toString().slice(-4)}`,
      agent: agent.trim(),
      category,
      reaction: reaction.trim(),
      severity,
      date: new Date().toISOString().slice(0, 10),
    };
    setAllergies([...allergies, newA]);
    setAgent("");
    setReaction("");
    toast({ title: "Allergy Added", description: `${newA.agent} recorded in patient profile.` });
  };

  const handleRemove = (id: string) => {
    setAllergies(allergies.filter((a) => a.id !== id));
    toast({ title: "Allergy Removed", description: "Entry deleted." });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-destructive" />
          Patient Allergy & Adverse Drug Reaction Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasSevere && (
          <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-red-900 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm">Critical Adverse Reaction Warning</p>
              <p className="text-xs mt-1">
                Patient has documented severe hypersensitivity reactions. Double-check all prescription orders before dispensing.
              </p>
            </div>
          </div>
        )}

        <div className="rounded-xl border p-4 bg-muted/40 space-y-3">
          <p className="text-sm font-semibold">Document New Allergy</p>
          <div className="grid gap-3 sm:grid-cols-4">
            <div>
              <Label>Allergen / Substance *</Label>
              <Input placeholder="e.g. Ciprofloxacin or Latex" value={agent} onChange={(e) => setAgent(e.target.value)} />
            </div>
            <div>
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Drug">Medication / Drug</SelectItem>
                  <SelectItem value="Food">Food Product</SelectItem>
                  <SelectItem value="Contact">Contact Material (Latex/Tape)</SelectItem>
                  <SelectItem value="Environmental">Environmental</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Severity</Label>
              <Select value={severity} onValueChange={setSeverity}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mild">Mild</SelectItem>
                  <SelectItem value="Moderate">Moderate</SelectItem>
                  <SelectItem value="Severe / Anaphylaxis">Severe / Anaphylaxis</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Manifestation / Reaction *</Label>
              <Input placeholder="e.g. Hives, Angioedema" value={reaction} onChange={(e) => setReaction(e.target.value)} />
            </div>
          </div>
          <div className="flex justify-end">
            <Button size="sm" onClick={handleAdd} className="gap-2">
              <Plus className="h-4 w-4" /> Save Allergy
            </Button>
          </div>
        </div>

        <div className="rounded-xl border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Allergen</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Observed Reaction</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Date Logged</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allergies.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-semibold text-destructive">{a.agent}</TableCell>
                  <TableCell>{a.category}</TableCell>
                  <TableCell>{a.reaction}</TableCell>
                  <TableCell>
                    <Badge className={a.severity.includes("Severe") ? "bg-red-600 text-white" : "bg-amber-100 text-amber-800"}>
                      {a.severity}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{a.date}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleRemove(a.id)} className="text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

// ==========================================
// 13. VIEW REQUISITION COMPONENT
// ==========================================
export function ViewRequisitionComponent({ patient }: { patient: any }) {
  const { toast } = useToast();
  const [filter, setFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [requisitions, setRequisitions] = useState([
    { id: "REQ-1001", type: "Medication", dept: "Pharmacy", date: "2026-03-14", status: "Approved", items: "Captopril 25mg (14 tabs), Metformin 500mg (28 tabs)", priority: "Urgent" },
    { id: "REQ-1002", type: "Consumable", dept: "Stores", date: "2026-03-13", status: "Dispensed", items: "Normal Saline 500ml (4), IV Cannula 18G (2)", priority: "Stat" },
    { id: "REQ-1003", type: "Lab Supplies", dept: "Laboratory", date: "2026-03-14", status: "Pending", items: "Blood Culture Bottles (2), EDTA tubes (2)", priority: "Routine" },
  ]);

  const updateStatus = (id: string, s: string) => {
    setRequisitions(requisitions.map((r) => (r.id === id ? { ...r, status: s } : r)));
    toast({ title: "Requisition Updated", description: `${id} set to ${s}.` });
  };

  const filtered = filter === "all" ? requisitions : requisitions.filter((r) => r.type === filter);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            Ward Requisitions Log
          </CardTitle>
          <p className="text-xs text-muted-foreground">Track consumable, medicine and laboratory store requests</p>
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Requisitions</SelectItem>
            <SelectItem value="Medication">Medication</SelectItem>
            <SelectItem value="Consumable">Consumable</SelectItem>
            <SelectItem value="Lab Supplies">Lab Supplies</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="rounded-xl border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Requisition ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r) => (
                <>
                  <TableRow key={r.id}>
                    <TableCell className="font-semibold font-mono">{r.id}</TableCell>
                    <TableCell>{r.type}</TableCell>
                    <TableCell>{r.dept}</TableCell>
                    <TableCell>{r.date}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{r.priority}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={r.status === "Dispensed" ? "bg-emerald-100 text-emerald-800" : r.status === "Approved" ? "bg-blue-100 text-blue-800" : "bg-amber-100 text-amber-800"}>
                        {r.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}>
                        {expandedId === r.id ? "Hide" : "Details"}
                      </Button>
                      {r.status === "Pending" && (
                        <Button size="sm" variant="outline" onClick={() => updateStatus(r.id, "Approved")}>
                          Approve
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                  {expandedId === r.id && (
                    <TableRow key={`${r.id}-det`}>
                      <TableCell colSpan={7} className="bg-muted/30 p-3 text-xs">
                        <span className="font-semibold">Line Items: </span>
                        {r.items}
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

// ==========================================
// 14. SAMPLE COLLECTION COMPONENT
// ==========================================
export function SampleCollectionComponent({ patient }: { patient: any }) {
  const { toast } = useToast();
  const [samples, setSamples] = useState([
    { id: "SMP-1", test: "Full Blood Count", sample: "Whole Blood", tube: "EDTA (Purple)", barcode: "BC-904812", status: "Collected", time: "2026-03-14 08:30", collector: "Nurse Akinyi" },
    { id: "SMP-2", test: "Blood Culture & Sensitivity", sample: "Whole Blood", tube: "Blood Culture Bottle", barcode: "BC-904813", status: "Pending", time: "-", collector: "-" },
    { id: "SMP-3", test: "Serum U&E / Creatinine", sample: "Serum", tube: "SST (Yellow)", barcode: "BC-904814", status: "Dispatched", time: "2026-03-14 08:40", collector: "Nurse Wanjiru" },
  ]);

  const [testName, setTestName] = useState("");
  const [sampleType, setSampleType] = useState("Whole Blood");
  const [tubeType, setTubeType] = useState("EDTA (Purple)");

  const handleCollect = (id: string) => {
    setSamples(
      samples.map((s) =>
        s.id === id
          ? {
              ...s,
              status: "Collected",
              time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              collector: "Nurse Akinyi",
            }
          : s
      )
    );
    toast({ title: "Sample Collected", description: "Bedside phlebotomy verified and sample labeled." });
  };

  const handleAddSample = () => {
    if (!testName.trim()) {
      toast({ title: "Test required", description: "Enter test name.", variant: "destructive" });
      return;
    }
    const newS = {
      id: `SMP-${Date.now().toString().slice(-4)}`,
      test: testName.trim(),
      sample: sampleType,
      tube: tubeType,
      barcode: `BC-${Math.floor(100000 + Math.random() * 900000)}`,
      status: "Pending",
      time: "-",
      collector: "-",
    };
    setSamples([newS, ...samples]);
    setTestName("");
    toast({ title: "Sample Order Created", description: `Barcode ${newS.barcode} generated.` });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Droplets className="h-5 w-5 text-primary" />
          Laboratory Sample Collection & Specimen Handover
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-xl border p-4 bg-muted/40 space-y-3">
          <p className="text-sm font-semibold">Generate Sample Requisition</p>
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <Label>Test Name *</Label>
              <Input placeholder="e.g. Serum Electrolytes" value={testName} onChange={(e) => setTestName(e.target.value)} />
            </div>
            <div>
              <Label>Specimen Type</Label>
              <Select value={sampleType} onValueChange={setSampleType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Whole Blood">Whole Blood</SelectItem>
                  <SelectItem value="Serum">Serum</SelectItem>
                  <SelectItem value="Plasma">Plasma</SelectItem>
                  <SelectItem value="Urine">Urine</SelectItem>
                  <SelectItem value="Sputum">Sputum</SelectItem>
                  <SelectItem value="Swab">Wound Swab</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Container / Tube</Label>
              <Select value={tubeType} onValueChange={setTubeType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="EDTA (Purple)">EDTA (Purple)</SelectItem>
                  <SelectItem value="SST (Yellow)">SST (Yellow)</SelectItem>
                  <SelectItem value="Plain (Red)">Plain (Red)</SelectItem>
                  <SelectItem value="Citrate (Blue)">Citrate (Blue)</SelectItem>
                  <SelectItem value="Sterile Cup">Sterile Cup</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end">
            <Button size="sm" onClick={handleAddSample} className="gap-2">
              <Plus className="h-4 w-4" /> Add Specimen Label
            </Button>
          </div>
        </div>

        <div className="rounded-xl border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Barcode</TableHead>
                <TableHead>Test Name</TableHead>
                <TableHead>Specimen & Tube</TableHead>
                <TableHead>Collection Time</TableHead>
                <TableHead>Collector</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {samples.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-mono font-bold text-xs">{s.barcode}</TableCell>
                  <TableCell className="font-medium">{s.test}</TableCell>
                  <TableCell>{s.sample} · {s.tube}</TableCell>
                  <TableCell>{s.time}</TableCell>
                  <TableCell>{s.collector}</TableCell>
                  <TableCell>
                    <Badge className={s.status === "Collected" ? "bg-emerald-100 text-emerald-800" : s.status === "Dispatched" ? "bg-blue-100 text-blue-800" : "bg-amber-100 text-amber-800"}>
                      {s.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {s.status === "Pending" && (
                      <Button size="sm" onClick={() => handleCollect(s.id)}>
                        Mark Collected
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

// ==========================================
// 15. INVESTIGATION COMPONENT
// ==========================================
export function InvestigationComponent({ patient }: { patient: any }) {
  const { toast } = useToast();
  const [investigations, setInvestigations] = useState([
    { id: "INV-1", name: "Chest X-ray PA", department: "Radiology", date: "2026-03-13", status: "Completed", result: "Normal cardiothoracic ratio, no infiltrates" },
    { id: "INV-2", name: "Blood culture & sensitivity", department: "Microbiology", date: "2026-03-14", status: "Processing", result: "Incubating (24h preliminary: No growth)" },
    { id: "INV-3", name: "Renal Function Tests (U&E)", department: "Biochemistry", date: "2026-03-14", status: "Completed", result: "Creatinine 84 umol/L, Potassium 4.1 mmol/L" },
  ]);

  const [invName, setInvName] = useState("");
  const [dept, setDept] = useState("Radiology");
  const [priority, setPriority] = useState("Routine");
  const [indication, setIndication] = useState("");

  const handleOrder = () => {
    if (!invName.trim()) {
      toast({ title: "Name required", description: "Enter investigation name.", variant: "destructive" });
      return;
    }
    const newInv = {
      id: `INV-${Date.now().toString().slice(-4)}`,
      name: invName.trim(),
      department: dept,
      date: new Date().toISOString().slice(0, 10),
      status: "Ordered",
      result: "Pending lab/radiology execution",
    };
    setInvestigations([newInv, ...investigations]);
    setInvName("");
    setIndication("");
    toast({ title: "Investigation Ordered", description: `${newInv.name} dispatched to ${dept}.` });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Diagnostics & Investigations View
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-xl border p-4 bg-muted/40 space-y-3">
          <p className="text-sm font-semibold">Order Diagnostic Investigation</p>
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <Label>Investigation Name *</Label>
              <Input placeholder="e.g. Abdominal Ultrasound, ECG" value={invName} onChange={(e) => setInvName(e.target.value)} />
            </div>
            <div>
              <Label>Department</Label>
              <Select value={dept} onValueChange={setDept}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Radiology">Radiology / Imaging</SelectItem>
                  <SelectItem value="Biochemistry">Biochemistry</SelectItem>
                  <SelectItem value="Hematology">Hematology</SelectItem>
                  <SelectItem value="Microbiology">Microbiology</SelectItem>
                  <SelectItem value="Cardiology">Cardiology / ECG</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Urgency</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Routine">Routine</SelectItem>
                  <SelectItem value="Urgent">Urgent</SelectItem>
                  <SelectItem value="STAT">STAT</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Clinical Justification</Label>
            <Input placeholder="Diagnostic question to answer" value={indication} onChange={(e) => setIndication(e.target.value)} />
          </div>
          <div className="flex justify-end">
            <Button size="sm" onClick={handleOrder} className="gap-2">
              <Plus className="h-4 w-4" /> Place Investigation Order
            </Button>
          </div>
        </div>

        <div className="rounded-xl border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Investigation</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Date Ordered</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Report / Findings</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {investigations.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-semibold">{item.name}</TableCell>
                  <TableCell>{item.department}</TableCell>
                  <TableCell>{item.date}</TableCell>
                  <TableCell>
                    <Badge className={item.status === "Completed" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}>
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{item.result}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

// ==========================================
// 16. BLOOD REQUEST COMPONENT
// ==========================================
export function BloodRequestComponent({ patient }: { patient: any }) {
  const { toast } = useToast();
  const [component, setComponent] = useState("Packed Cells");
  const [units, setUnits] = useState(2);
  const [justification, setJustification] = useState("Post-operative anemia with Hb 7.8 g/dL.");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    setSubmitted(true);
    toast({ title: "Blood Bank Notified", description: `Requisition for ${units} units of ${component} sent.` });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Droplets className="h-5 w-5 text-red-600" />
          Blood Bank Product Requisition
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label>Patient Information</Label>
            <Input value={`${patient.name} (${patient.pid}) - ${patient.ward}`} readOnly className="bg-muted" />
          </div>
          <div>
            <Label>Required Component</Label>
            <Select value={component} onValueChange={setComponent}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Packed Cells">Packed Cells (PRBC)</SelectItem>
                <SelectItem value="Whole Blood">Whole Blood</SelectItem>
                <SelectItem value="Platelet Concentrate">Platelet Concentrate</SelectItem>
                <SelectItem value="Fresh Frozen Plasma">Fresh Frozen Plasma (FFP)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label>Units</Label>
            <Input type="number" min={1} max={6} value={units} onChange={(e) => setUnits(Number(e.target.value) || 1)} />
          </div>
          <div>
            <Label>Attending Clinician</Label>
            <Input value={patient.doctor || "Dr. John Smith"} readOnly className="bg-muted" />
          </div>
        </div>
        <div>
          <Label>Clinical Justification</Label>
          <Textarea rows={3} value={justification} onChange={(e) => setJustification(e.target.value)} />
        </div>
        <div className="flex justify-end gap-2">
          <Button onClick={handleSubmit} className="gap-2 bg-red-600 hover:bg-red-700 text-white">
            <CheckCircle2 className="h-4 w-4" /> Submit Blood Request
          </Button>
        </div>

        {submitted && (
          <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-emerald-900 flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
            <p className="text-sm">
              Blood request active in blood bank queue. Contact Blood Bank Ext: 412 for crossmatch status.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ==========================================
// 17. PRE-OP CHECKLIST COMPONENT
// ==========================================
export function PreOpChecklistComponent({ patient }: { patient: any }) {
  const { toast } = useToast();
  const [checklist, setChecklist] = useState([
    { id: "c1", label: "Informed surgical & anesthesia consent signed and attached", checked: true },
    { id: "c2", label: "Patient identification band in place and verified against chart", checked: true },
    { id: "c3", label: "Surgical site marked by operating surgeon", checked: true },
    { id: "c4", label: "Nil Per Os (NPO) / Fasting confirmed (solid food ≥ 6 hours)", checked: true },
    { id: "c5", label: "Known allergies re-verified and red allergy band placed", checked: true },
    { id: "c6", label: "Blood crossmatched and confirmed available at blood bank", checked: false },
    { id: "c7", label: "Dentures, jewelry, nail polish, body piercings removed", checked: true },
    { id: "c8", label: "IV access secured (minimum 18G cannula patent)", checked: true },
    { id: "c9", label: "Pre-operative vital signs recorded within acceptable limits", checked: true },
    { id: "c10", label: "Pre-operative medications / prophylactic antibiotics given as ordered", checked: false },
  ]);

  const [surgeon, setSurgeon] = useState(patient.doctor || "Dr. John Smith");
  const [nurse, setNurse] = useState("Nurse Akinyi");

  const completedCount = checklist.filter((i) => i.checked).length;
  const pct = Math.round((completedCount / checklist.length) * 100);

  const toggleCheck = (id: string) => {
    setChecklist(checklist.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item)));
  };

  const handleSignOff = () => {
    toast({
      title: "Pre-Op Checklist Verified",
      description: `Safety checklist signed off (${pct}% completed) by ${nurse}.`,
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-primary" />
            WHO Surgical Safety Pre-Operative Checklist
          </CardTitle>
          <p className="text-xs text-muted-foreground">Mandatory bedside verification before theater transfer</p>
        </div>
        <Badge className={pct === 100 ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}>
          {completedCount} / {checklist.length} Verified ({pct}%)
        </Badge>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label>Operating Surgeon</Label>
            <Input value={surgeon} onChange={(e) => setSurgeon(e.target.value)} />
          </div>
          <div>
            <Label>Handover Nurse</Label>
            <Input value={nurse} onChange={(e) => setNurse(e.target.value)} />
          </div>
        </div>

        <div className="space-y-2">
          {checklist.map((item) => (
            <div
              key={item.id}
              onClick={() => toggleCheck(item.id)}
              className="flex items-center gap-3 rounded-xl border p-3 cursor-pointer transition-colors hover:bg-muted/50"
            >
              <Checkbox checked={item.checked} onCheckedChange={() => toggleCheck(item.id)} />
              <span className={`text-sm ${item.checked ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                {item.label}
              </span>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => setChecklist(checklist.map((c) => ({ ...c, checked: true })))}
          >
            Check All
          </Button>
          <Button onClick={handleSignOff} className="gap-2">
            <CheckCircle2 className="h-4 w-4" /> Sign Off Checklist
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ==========================================
// 18. ROOM SHIFT COMPONENT
// ==========================================
export function RoomShiftComponent({ patient }: { patient: any }) {
  const { toast } = useToast();
  const [currentWard, setCurrentWard] = useState(patient.ward || "General Ward A");
  const [currentBed, setCurrentBed] = useState(patient.bed || "A-12");
  const [targetWard, setTargetWard] = useState("Surgical Ward");
  const [targetBed, setTargetBed] = useState("Bed B-04");
  const [transferType, setTransferType] = useState("Clinical Escalation");
  const [reason, setReason] = useState("Requires post-operative surgical observation");
  const [authorizedBy, setAuthorizedBy] = useState(patient.doctor || "Dr. John Smith");

  const handleTransfer = () => {
    toast({
      title: "Transfer Order Submitted",
      description: `Patient ${patient.name} movement to ${targetWard} (${targetBed}) approved.`,
    });
    setCurrentWard(targetWard);
    setCurrentBed(targetBed);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Ward / Room Shift Transfer Protocol
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border p-4 bg-muted/40">
            <p className="text-xs font-semibold uppercase text-muted-foreground">Current Location</p>
            <p className="text-lg font-bold mt-1">{currentWard}</p>
            <p className="text-sm text-muted-foreground">Bed: {currentBed}</p>
          </div>
          <div className="rounded-xl border p-4 bg-primary/5 border-primary/20">
            <p className="text-xs font-semibold uppercase text-primary">Target Destination</p>
            <p className="text-lg font-bold mt-1 text-primary">{targetWard}</p>
            <p className="text-sm text-muted-foreground">Bed: {targetBed}</p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label>Destination Ward</Label>
            <Select value={targetWard} onValueChange={setTargetWard}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="General Ward A">General Ward A</SelectItem>
                <SelectItem value="General Ward B">General Ward B</SelectItem>
                <SelectItem value="Surgical Ward">Surgical Ward</SelectItem>
                <SelectItem value="ICU / HDU">ICU / HDU</SelectItem>
                <SelectItem value="Pediatric Ward">Pediatric Ward</SelectItem>
                <SelectItem value="Private VIP Wing">Private VIP Wing</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Destination Bed Number</Label>
            <Input value={targetBed} onChange={(e) => setTargetBed(e.target.value)} />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label>Transfer Type</Label>
            <Select value={transferType} onValueChange={setTransferType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Clinical Escalation">Clinical Escalation (ICU/HDU)</SelectItem>
                <SelectItem value="Step Down">Step Down Care</SelectItem>
                <SelectItem value="Isolation">Infection Control / Isolation</SelectItem>
                <SelectItem value="Patient Request">Patient / Family Request</SelectItem>
                <SelectItem value="Bed Reallocation">Bed Management Reallocation</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Authorizing Clinician</Label>
            <Input value={authorizedBy} onChange={(e) => setAuthorizedBy(e.target.value)} />
          </div>
        </div>

        <div>
          <Label>Clinical Justification & Equipment Needed En Route</Label>
          <Textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} />
        </div>

        <div className="flex justify-end gap-2">
          <Button onClick={handleTransfer} className="gap-2">
            <CheckCircle2 className="h-4 w-4" /> Submit Ward Transfer
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ==========================================
// 19. DOCUMENTS COMPONENT
// ==========================================
export function DocumentsComponent({ patient }: { patient: any }) {
  const { toast } = useToast();
  const [docs, setDocs] = useState([
    { id: "D-1", name: "Inpatient Admission Form.pdf", size: "240 KB", uploaded: "2026-03-10", category: "Admission" },
    { id: "D-2", name: "Chest X-Ray Film.png", size: "1.8 MB", uploaded: "2026-03-13", category: "Radiology" },
    { id: "D-3", name: "Insurance Pre-Auth Guarantee.pdf", size: "320 KB", uploaded: "2026-03-10", category: "Billing" },
  ]);

  const [docName, setDocName] = useState("");
  const [category, setCategory] = useState("Lab Result");

  const handleUpload = () => {
    if (!docName.trim()) {
      toast({ title: "Filename required", description: "Enter document name.", variant: "destructive" });
      return;
    }
    const newD = {
      id: `D-${Date.now().toString().slice(-4)}`,
      name: docName.trim(),
      size: "450 KB",
      uploaded: new Date().toISOString().slice(0, 10),
      category,
    };
    setDocs([newD, ...docs]);
    setDocName("");
    toast({ title: "Document Uploaded", description: `${newD.name} attached to patient file.` });
  };

  const handleDelete = (id: string) => {
    setDocs(docs.filter((d) => d.id !== id));
    toast({ title: "Document Removed", description: "Attachment deleted." });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Patient Medical Documents & Attachments
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-xl border p-4 bg-muted/40 space-y-3">
          <p className="text-sm font-semibold">Upload Document Attachment</p>
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <Label>Document Name *</Label>
              <Input placeholder="e.g. ECG Strip 2026-03-14.pdf" value={docName} onChange={(e) => setDocName(e.target.value)} />
            </div>
            <div>
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admission">Admission Paperwork</SelectItem>
                  <SelectItem value="Lab Result">Lab Result</SelectItem>
                  <SelectItem value="Radiology">Radiology Scan</SelectItem>
                  <SelectItem value="Consent">Consent Form</SelectItem>
                  <SelectItem value="Billing">Insurance / Billing</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={handleUpload} className="gap-2 w-full">
                <Upload className="h-4 w-4" /> Upload Document
              </Button>
            </div>
          </div>
        </div>

        <div className="rounded-xl border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Date Uploaded</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {docs.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="font-semibold flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    {d.name}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{d.category}</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{d.size}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{d.uploaded}</TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toast({ title: "Downloading", description: `Downloading ${d.name}...` })}
                    >
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(d.id)}
                      className="text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

// ==========================================
// 20. INTAKE OUTPUT COMPONENT
// ==========================================
export function IntakeOutputComponent({ patient }: { patient: any }) {
  const { toast } = useToast();
  const [entries, setEntries] = useState([
    { id: "IO-1", time: "08:00", type: "Intake", route: "Oral Fluids", fluid: "Water / Tea", amount: 300, nurse: "Nurse Akinyi" },
    { id: "IO-2", time: "08:30", type: "Output", route: "Urine", fluid: "Clear urine", amount: 450, nurse: "Nurse Akinyi" },
    { id: "IO-3", time: "10:00", type: "Intake", route: "IV Infusion", fluid: "Normal Saline 0.9%", amount: 1000, nurse: "Nurse Wanjiru" },
    { id: "IO-4", time: "12:30", type: "Output", route: "Urine", fluid: "Via Foley Catheter", amount: 500, nurse: "Nurse Wanjiru" },
    { id: "IO-5", time: "14:00", type: "Intake", route: "Oral", fluid: "Soup & Water", amount: 500, nurse: "Nurse Akinyi" },
    { id: "IO-6", time: "15:00", type: "Output", route: "Drain", fluid: "Abdominal Drain bulb", amount: 150, nurse: "Nurse Chebet" },
  ]);

  const [ioType, setIoType] = useState("Intake");
  const [route, setRoute] = useState("Oral Fluids");
  const [fluid, setFluid] = useState("Water / Oral Rehydration");
  const [amount, setAmount] = useState(250);
  const [nurse, setNurse] = useState("Nurse Akinyi");

  const totalIntake = entries.filter((e) => e.type === "Intake").reduce((acc, curr) => acc + curr.amount, 0);
  const totalOutput = entries.filter((e) => e.type === "Output").reduce((acc, curr) => acc + curr.amount, 0);
  const netBalance = totalIntake - totalOutput;

  const handleAdd = () => {
    const newE = {
      id: `IO-${Date.now().toString().slice(-4)}`,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      type: ioType,
      route,
      fluid: fluid.trim(),
      amount,
      nurse,
    };
    setEntries([newE, ...entries]);
    toast({ title: "Fluid Entry Saved", description: `${newE.type}: ${newE.amount}ml recorded.` });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Droplets className="h-5 w-5 text-primary" />
          24-Hour Fluid Balance & Intake / Output Chart
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border p-4 bg-blue-50/50 border-blue-200">
            <p className="text-xs font-semibold uppercase text-blue-800">Total 24h Intake</p>
            <p className="text-2xl font-bold text-blue-900 mt-1">{totalIntake} mL</p>
          </div>
          <div className="rounded-xl border p-4 bg-amber-50/50 border-amber-200">
            <p className="text-xs font-semibold uppercase text-amber-800">Total 24h Output</p>
            <p className="text-2xl font-bold text-amber-900 mt-1">{totalOutput} mL</p>
          </div>
          <div className="rounded-xl border p-4 bg-emerald-50/50 border-emerald-200">
            <p className="text-xs font-semibold uppercase text-emerald-800">Net Fluid Balance</p>
            <p className="text-2xl font-bold text-emerald-900 mt-1">
              {netBalance >= 0 ? `+${netBalance}` : netBalance} mL
            </p>
          </div>
        </div>

        <div className="rounded-xl border p-4 bg-muted/40 space-y-3">
          <p className="text-sm font-semibold">Log Fluid Entry</p>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
            <div>
              <Label>Entry Type</Label>
              <Select value={ioType} onValueChange={setIoType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Intake">Intake (+)</SelectItem>
                  <SelectItem value="Output">Output (-)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Route</Label>
              <Input value={route} onChange={(e) => setRoute(e.target.value)} />
            </div>
            <div>
              <Label>Fluid Description</Label>
              <Input value={fluid} onChange={(e) => setFluid(e.target.value)} />
            </div>
            <div>
              <Label>Volume (mL)</Label>
              <Input type="number" min={10} value={amount} onChange={(e) => setAmount(Number(e.target.value) || 0)} />
            </div>
          </div>
          <div className="flex justify-end">
            <Button size="sm" onClick={handleAdd} className="gap-2">
              <Plus className="h-4 w-4" /> Add Fluid Reading
            </Button>
          </div>
        </div>

        <div className="rounded-xl border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Route</TableHead>
                <TableHead>Fluid</TableHead>
                <TableHead>Amount (mL)</TableHead>
                <TableHead>Nurse Staff</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="font-mono text-xs">{e.time}</TableCell>
                  <TableCell>
                    <Badge className={e.type === "Intake" ? "bg-blue-100 text-blue-800" : "bg-amber-100 text-amber-800"}>
                      {e.type}
                    </Badge>
                  </TableCell>
                  <TableCell>{e.route}</TableCell>
                  <TableCell>{e.fluid}</TableCell>
                  <TableCell className="font-mono font-semibold">{e.amount} mL</TableCell>
                  <TableCell className="text-muted-foreground">{e.nurse}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

// ==========================================
// 21. TRANSFER MORTUARY COMPONENT
// ==========================================
export function TransferMortuaryComponent({ patient }: { patient: any }) {
  const { toast } = useToast();
  const [certDoctor, setCertDoctor] = useState(patient.doctor || "Dr. John Smith");
  const [timeOfDeath, setTimeOfDeath] = useState(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
  const [dateOfDeath, setDateOfDeath] = useState(new Date().toISOString().slice(0, 10));
  const [cause, setCause] = useState("Cardiopulmonary arrest secondary to acute myocardial infarction");
  const [kinNotified, setKinNotified] = useState(true);
  const [tagNumber, setTagNumber] = useState(`MORT-${Date.now().toString().slice(-4)}`);
  const [notes, setNotes] = useState("Patient property sealed in bag #24 and handed to mortuary staff.");

  const handleTransfer = () => {
    toast({
      title: "Mortuary Transfer Logged",
      description: `Official deceased handover documentation for ${patient.name} recorded.`,
      variant: "destructive",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-5 w-5" />
          Transfer to Mortuary & Deceased Handover Record
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 space-y-2 text-xs text-destructive">
          <p className="font-semibold text-sm">Official Death Documentation Requirement</p>
          <p>
            Ensure death certification by licensed medical practitioner, confirm family notification, and affix mortuary identification tag before transferring to morgue attendant.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <Label>Date of Death</Label>
            <Input type="date" value={dateOfDeath} onChange={(e) => setDateOfDeath(e.target.value)} />
          </div>
          <div>
            <Label>Time of Death</Label>
            <Input type="time" value={timeOfDeath} onChange={(e) => setTimeOfDeath(e.target.value)} />
          </div>
          <div>
            <Label>Certifying Medical Officer</Label>
            <Input value={certDoctor} onChange={(e) => setCertDoctor(e.target.value)} />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label>Cause of Death</Label>
            <Input value={cause} onChange={(e) => setCause(e.target.value)} />
          </div>
          <div>
            <Label>Mortuary Tag Number</Label>
            <Input value={tagNumber} onChange={(e) => setTagNumber(e.target.value)} />
          </div>
        </div>

        <div>
          <Label>Belongings Handover & Transfer Notes</Label>
          <Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox id="kin-notified" checked={kinNotified} onCheckedChange={(v) => setKinNotified(Boolean(v))} />
          <label htmlFor="kin-notified" className="text-xs font-medium cursor-pointer">
            Next of kin personally notified and mortuary clearance received
          </label>
        </div>

        <div className="flex justify-end">
          <Button variant="destructive" onClick={handleTransfer} className="gap-2">
            <AlertTriangle className="h-4 w-4" /> Submit Mortuary Transfer
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ==========================================
// 22. OT TRAINER COMPONENT
// ==========================================
export function OTTrainerComponent({ patient }: { patient: any }) {
  const { toast } = useToast();
  const [sessions, setSessions] = useState([
    { id: "OT-1", date: "2026-03-14", therapist: "Jane Muthoni, OT", duration: "45 mins", exercises: "Upper extremity fine motor skills, bed mobility", tolerance: "Well tolerated" },
    { id: "OT-2", date: "2026-03-12", therapist: "David Kiptoo, PT", duration: "30 mins", exercises: "Passive range of motion exercises for lower limbs", tolerance: "Mild fatigue" },
  ]);

  const [therapist, setTherapist] = useState("Jane Muthoni, OT");
  const [duration, setDuration] = useState("45 mins");
  const [exercises, setExercises] = useState("Active sitting balance, hand grip strength exercises");
  const [tolerance, setTolerance] = useState("Well tolerated");

  const handleAdd = () => {
    const newS = {
      id: `OT-${Date.now().toString().slice(-4)}`,
      date: new Date().toISOString().slice(0, 10),
      therapist,
      duration,
      exercises,
      tolerance,
    };
    setSessions([newS, ...sessions]);
    toast({ title: "OT Session Logged", description: "Rehabilitation progress saved." });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Occupational Therapy & Physical Rehabilitation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-xl border p-4 bg-muted/40 space-y-3">
          <p className="text-sm font-semibold">Log Therapy Session</p>
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <Label>Therapist</Label>
              <Input value={therapist} onChange={(e) => setTherapist(e.target.value)} />
            </div>
            <div>
              <Label>Session Duration</Label>
              <Input value={duration} onChange={(e) => setDuration(e.target.value)} />
            </div>
            <div>
              <Label>Patient Tolerance</Label>
              <Select value={tolerance} onValueChange={setTolerance}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Well tolerated">Well tolerated</SelectItem>
                  <SelectItem value="Mild fatigue">Mild fatigue</SelectItem>
                  <SelectItem value="Moderate pain limited">Moderate pain limited</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Therapy Activities & Goals</Label>
            <Textarea rows={2} value={exercises} onChange={(e) => setExercises(e.target.value)} />
          </div>
          <div className="flex justify-end">
            <Button size="sm" onClick={handleAdd} className="gap-2">
              <Save className="h-4 w-4" /> Save OT Session
            </Button>
          </div>
        </div>

        <div className="rounded-xl border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Therapist</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Activities</TableHead>
                <TableHead>Tolerance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>{s.date}</TableCell>
                  <TableCell className="font-medium">{s.therapist}</TableCell>
                  <TableCell>{s.duration}</TableCell>
                  <TableCell className="text-sm">{s.exercises}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{s.tolerance}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

// ==========================================
// 23. BILL PRINT COMPONENT
// ==========================================
export function BillPrintComponent({ patient }: { patient: any }) {
  const { toast } = useToast();

  const handlePrint = () => {
    toast({ title: "Print Order Sent", description: "Printing inpatient statement." });
    window.print();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base flex items-center gap-2">
            <Printer className="h-5 w-5 text-primary" />
            Inpatient Invoice & Interim Billing Statement
          </CardTitle>
          <p className="text-xs text-muted-foreground">Official hospital statement printout</p>
        </div>
        <Button onClick={handlePrint} className="gap-2">
          <Printer className="h-4 w-4" /> Print Statement
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-2xl border p-6 bg-card space-y-4">
          <div className="flex justify-between border-b pb-4">
            <div>
              <h3 className="text-xl font-bold text-primary">iCare HMIS Multi-Specialty Hospital</h3>
              <p className="text-xs text-muted-foreground">Medical Center Way, Nairobi | P.O. Box 40210</p>
              <p className="text-xs text-muted-foreground">Tax PIN: P051234567Z | Tel: +254 700 000000</p>
            </div>
            <div className="text-right">
              <Badge className="bg-emerald-100 text-emerald-800 text-sm">ACTIVE INPATIENT</Badge>
              <p className="text-xs text-muted-foreground mt-2">Invoice #: INV-IPD-2026-089</p>
              <p className="text-xs text-muted-foreground">Date: {new Date().toLocaleDateString()}</p>
            </div>
          </div>

          <div className="grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <p className="text-xs text-muted-foreground uppercase font-semibold">Patient Details</p>
              <p className="font-semibold text-base">{patient.name}</p>
              <p className="text-xs text-muted-foreground">Patient ID: {patient.pid} · Age: {patient.age} / {patient.gender}</p>
            </div>
            <div className="sm:text-right">
              <p className="text-xs text-muted-foreground uppercase font-semibold">Admission Details</p>
              <p className="font-semibold">{patient.ward} (Bed {patient.bed})</p>
              <p className="text-xs text-muted-foreground">Admitted: {patient.admissionDate} · Doctor: {patient.doctor}</p>
            </div>
          </div>

          <div className="rounded-xl border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service Department</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead className="text-right">Charges (KES)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Room & Accommodation</TableCell>
                  <TableCell>4 Days General Ward Care</TableCell>
                  <TableCell className="text-right font-mono">4,200.00</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Pharmaceuticals</TableCell>
                  <TableCell>Oral & IV Meds, Fluids</TableCell>
                  <TableCell className="text-right font-mono">1,800.00</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Laboratory Investigations</TableCell>
                  <TableCell>FBC, Chemistry, Lipid profile</TableCell>
                  <TableCell className="text-right font-mono">2,100.00</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Doctor Ward Rounds</TableCell>
                  <TableCell>Attending Consultant Daily Reviews</TableCell>
                  <TableCell className="text-right font-mono">4,500.00</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Nursing & Bedside Consumables</TableCell>
                  <TableCell>IV Sets, Syringes, Dressings</TableCell>
                  <TableCell className="text-right font-mono">950.00</TableCell>
                </TableRow>
                <TableRow className="font-bold bg-muted/40 text-base">
                  <TableCell colSpan={2}>Grand Total Gross Charges</TableCell>
                  <TableCell className="text-right font-mono text-primary">KES 13,550.00</TableCell>
                </TableRow>
                <TableRow className="text-xs text-muted-foreground">
                  <TableCell colSpan={2}>Less: SHA / NHIF Rebate Coverage</TableCell>
                  <TableCell className="text-right font-mono">-12,600.00</TableCell>
                </TableRow>
                <TableRow className="text-sm font-semibold text-emerald-700">
                  <TableCell colSpan={2}>Net Patient Payable Balance</TableCell>
                  <TableCell className="text-right font-mono">KES 950.00</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ==========================================
// 24. NEUROLOGICAL EXAM COMPONENT
// ==========================================
export function NeurologicalExamComponent({ patient }: { patient: any }) {
  const { toast } = useToast();
  const [eyeScore, setEyeScore] = useState(4);
  const [verbalScore, setVerbalScore] = useState(5);
  const [motorScore, setMotorScore] = useState(6);
  const [rPupilSize, setRPupilSize] = useState("3mm");
  const [lPupilSize, setLPupilSize] = useState("3mm");
  const [pupilReaction, setPupilReaction] = useState("Brisk");
  const [limbPower, setLimbPower] = useState("5/5 (Normal Power)");
  const [notes, setNotes] = useState("Cranial nerves II-XII grossly intact. No focal deficits, gait steady.");

  const totalGcs = eyeScore + verbalScore + motorScore;

  const handleSave = () => {
    toast({
      title: "Neurological Exam Saved",
      description: `GCS Score ${totalGcs}/15 logged for ${patient.name}.`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          Glasgow Coma Scale (GCS) & Neurological Assessment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-xl border p-4 bg-primary/5 border-primary/20 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase text-muted-foreground">Total GCS Score</p>
            <p className="text-3xl font-bold text-primary mt-1">{totalGcs} / 15</p>
          </div>
          <Badge
            className={
              totalGcs >= 13
                ? "bg-emerald-100 text-emerald-800 text-sm"
                : totalGcs >= 9
                ? "bg-amber-100 text-amber-800 text-sm"
                : "bg-red-100 text-red-800 text-sm"
            }
          >
            {totalGcs >= 13 ? "Mild / Normal (13-15)" : totalGcs >= 9 ? "Moderate Injury (9-12)" : "Severe Coma (≤ 8)"}
          </Badge>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label>Eye Opening (1-4)</Label>
            <Select value={String(eyeScore)} onValueChange={(v) => setEyeScore(Number(v))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="4">4 - Spontaneous</SelectItem>
                <SelectItem value="3">3 - To Speech</SelectItem>
                <SelectItem value="2">2 - To Pain</SelectItem>
                <SelectItem value="1">1 - None</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Verbal Response (1-5)</Label>
            <Select value={String(verbalScore)} onValueChange={(v) => setVerbalScore(Number(v))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 - Oriented</SelectItem>
                <SelectItem value="4">4 - Confused</SelectItem>
                <SelectItem value="3">3 - Inappropriate Words</SelectItem>
                <SelectItem value="2">2 - Incomprehensible</SelectItem>
                <SelectItem value="1">1 - None</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Motor Response (1-6)</Label>
            <Select value={String(motorScore)} onValueChange={(v) => setMotorScore(Number(v))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="6">6 - Obeys Commands</SelectItem>
                <SelectItem value="5">5 - Localizes Pain</SelectItem>
                <SelectItem value="4">4 - Normal Flexion / Withdrawal</SelectItem>
                <SelectItem value="3">3 - Abnormal Flexion (Decorticate)</SelectItem>
                <SelectItem value="2">2 - Extension (Decerebrate)</SelectItem>
                <SelectItem value="1">1 - None</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 pt-2 border-t">
          <div>
            <Label>Right Pupil Size</Label>
            <Select value={rPupilSize} onValueChange={setRPupilSize}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="2mm">2mm (Constricted)</SelectItem>
                <SelectItem value="3mm">3mm (Normal)</SelectItem>
                <SelectItem value="4mm">4mm (Normal)</SelectItem>
                <SelectItem value="5mm">5mm (Dilated)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Left Pupil Size</Label>
            <Select value={lPupilSize} onValueChange={setLPupilSize}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="2mm">2mm (Constricted)</SelectItem>
                <SelectItem value="3mm">3mm (Normal)</SelectItem>
                <SelectItem value="4mm">4mm (Normal)</SelectItem>
                <SelectItem value="5mm">5mm (Dilated)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Pupillary Light Reflex</Label>
            <Select value={pupilReaction} onValueChange={setPupilReaction}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Brisk">Brisk Reaction</SelectItem>
                <SelectItem value="Sluggish">Sluggish</SelectItem>
                <SelectItem value="Fixed">Fixed / Non-reactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label>Motor Limb Power Examination</Label>
          <Input value={limbPower} onChange={(e) => setLimbPower(e.target.value)} />
        </div>

        <div>
          <Label>Sensory, Reflexes & Cranial Nerve Observations</Label>
          <Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} className="gap-2">
            <CheckCircle2 className="h-4 w-4" /> Save Neurological Exam
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
