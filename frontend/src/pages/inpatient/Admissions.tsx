import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const patientOptions = [
  { value: "P-10234", label: "John Doe - P-10234" },
  { value: "P-10233", label: "Peter Odhiambo - P-10233" },
  { value: "P-10232", label: "Mary Achieng - P-10232" },
  { value: "P-10229", label: "David Kipchoge - P-10229" },
];

const wardOptions = [
  "General Ward A",
  "General Ward B",
  "Maternity",
  "ICU",
  "Paediatric",
  "Surgical Ward",
];

const bedOptions = [
  "A-01",
  "A-12",
  "B-04",
  "M-05",
  "ICU-03",
  "P-02",
  "S-05",
];

const admissionTypes = ["Emergency", "Elective", "Transfer In", "Observation", "Maternity", "Critical Care"];
const urgencyLevels = ["Routine", "Urgent", "Very Urgent", "Emergency"]; 
const referralSources = ["Self", "Clinic", "Emergency", "Private Consultant", "Transfer from Other Facility", "OPD"]; 
const paymentModes = ["Cash", "Insurance", "NHIF", "SHA", "Corporate", "Waiver"];
const doctors = ["Dr. Ochieng", "Dr. Njeri", "Dr. Kipchoge", "Dr. Akinyi", "Dr. Wanjiku"];

const generatePatientId = () => {
  const timestamp = Date.now().toString().slice(-6);
  return `UHID-${timestamp}`;
};

const initialForm = {
  patient: "",
  patientId: generatePatientId(),
  admissionType: "",
  urgency: "Urgent",
  ward: "",
  bed: "",
  referralSource: "",
  admissionDate: new Date().toISOString().slice(0, 10),
  admissionTime: new Date().toTimeString().slice(0, 5),
  consultant: "",
  attendingDoctor: "",
  provisionalDiagnosis: "",
  chiefComplaint: "",
  modeOfArrival: "Wheelchair",
  insurancePanel: "SHA",
  paymentMode: "Insurance",
  authorizationNo: "",
  expectedStay: "",
  notes: "",
};

export default function Admissions() {
  const [form, setForm] = useState(initialForm);

  const updateField = (field: keyof typeof initialForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!form.patient || !form.ward || !form.bed || !form.attendingDoctor || !form.provisionalDiagnosis) {
      toast.error("Please complete the required admission fields before submitting.");
      return;
    }

    toast.success(`Admission created for ${form.patient} to ${form.ward} (${form.bed}).`);
    setForm(initialForm);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Admissions</h1>
        <p className="text-muted-foreground text-sm">Hospital admission criteria and ward placement</p>
      </div>

      <Card className="shadow-card border-border">
        <CardHeader className="border-b border-border/50 pb-3">
          <CardTitle className="text-base">Admission Form</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6 py-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="space-y-2">
              <Label>Patient</Label>
              <Select value={form.patient} onValueChange={(value) => updateField("patient", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select patient" />
                </SelectTrigger>
                <SelectContent>
                  {patientOptions.map((patient) => (
                    <SelectItem key={patient.value} value={patient.label}>{patient.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>UHID / PID</Label>
              <Input
                value={form.patientId}
                readOnly
                className="bg-slate-50 text-slate-700"
                placeholder="System generated"
              />
            </div>

            <div className="space-y-2">
              <Label>Admission Type</Label>
              <Select value={form.admissionType} onValueChange={(value) => updateField("admissionType", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {admissionTypes.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Urgency</Label>
              <Select value={form.urgency} onValueChange={(value) => updateField("urgency", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose urgency" />
                </SelectTrigger>
                <SelectContent>
                  {urgencyLevels.map((level) => (
                    <SelectItem key={level} value={level}>{level}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
            <div className="space-y-2">
              <Label>Ward</Label>
              <Select value={form.ward} onValueChange={(value) => updateField("ward", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Ward" />
                </SelectTrigger>
                <SelectContent>
                  {wardOptions.map((ward) => (
                    <SelectItem key={ward} value={ward}>{ward}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Bed</Label>
              <Select value={form.bed} onValueChange={(value) => updateField("bed", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Bed" />
                </SelectTrigger>
                <SelectContent>
                  {bedOptions.map((bed) => (
                    <SelectItem key={bed} value={bed}>{bed}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Admission Date</Label>
              <Input
                type="date"
                value={form.admissionDate}
                onChange={(e) => updateField("admissionDate", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Admission Time</Label>
              <Input
                type="time"
                value={form.admissionTime}
                onChange={(e) => updateField("admissionTime", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Referral Source</Label>
              <Select value={form.referralSource} onValueChange={(value) => updateField("referralSource", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Source" />
                </SelectTrigger>
                <SelectContent>
                  {referralSources.map((source) => (
                    <SelectItem key={source} value={source}>{source}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Expected Stay</Label>
              <Input
                value={form.expectedStay}
                onChange={(e) => updateField("expectedStay", e.target.value)}
                placeholder="e.g. 3-5 days"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Attending Doctor</Label>
              <Select value={form.attendingDoctor} onValueChange={(value) => updateField("attendingDoctor", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select doctor" />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map((doctor) => (
                    <SelectItem key={doctor} value={doctor}>{doctor}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Consultant / Senior Review</Label>
              <Select value={form.consultant} onValueChange={(value) => updateField("consultant", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select consultant" />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map((doctor) => (
                    <SelectItem key={doctor} value={doctor}>{doctor}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Chief Complaint</Label>
              <Textarea
                value={form.chiefComplaint}
                onChange={(e) => updateField("chiefComplaint", e.target.value)}
                placeholder="Describe the presenting complaint or reason for admission"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Provisional Diagnosis</Label>
              <Textarea
                value={form.provisionalDiagnosis}
                onChange={(e) => updateField("provisionalDiagnosis", e.target.value)}
                placeholder="Primary diagnosis or working diagnosis"
                rows={3}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label>Mode of Arrival</Label>
              <Input
                value={form.modeOfArrival}
                onChange={(e) => updateField("modeOfArrival", e.target.value)}
                placeholder="Ambulance / Wheelchair / Walk-in"
              />
            </div>

            <div className="space-y-2">
              <Label>Insurance Panel</Label>
              <Input
                value={form.insurancePanel}
                onChange={(e) => updateField("insurancePanel", e.target.value)}
                placeholder="SHA / NHIF / Private"
              />
            </div>

            <div className="space-y-2">
              <Label>Payment Mode</Label>
              <Select value={form.paymentMode} onValueChange={(value) => updateField("paymentMode", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select mode" />
                </SelectTrigger>
                <SelectContent>
                  {paymentModes.map((mode) => (
                    <SelectItem key={mode} value={mode}>{mode}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Authorization No.</Label>
              <Input
                value={form.authorizationNo}
                onChange={(e) => updateField("authorizationNo", e.target.value)}
                placeholder="If applicable"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Admission Notes / Clinical Criteria</Label>
            <Textarea
              value={form.notes}
              onChange={(e) => updateField("notes", e.target.value)}
              placeholder="Any special instructions, triage findings, isolation needs, or patient conditions requiring attention"
              rows={4}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/50 pt-4">
            <p className="text-sm text-muted-foreground">Admission criteria include urgency, ward availability, diagnosis, and insurance clearance.</p>
            <div className="flex gap-3">
              <Button type="button" variant="outline">Save Draft</Button>
              <Button type="button" onClick={handleSubmit}>Admit Patient</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
