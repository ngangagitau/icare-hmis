import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { admittedPatients } from "./ipd";
import { AlertTriangle, ClipboardList, CalendarCheck, CheckCircle2 } from "lucide-react";

const submoduleMeta: Record<string, { title: string; description: string }> = {
  notes: {
    title: "Notes",
    description: "View the patient's clinical and nursing notes recorded during this admission.",
  },
  "note-create": {
    title: "Create Note",
    description: "Write a new progress note for the patient and attach it to the current admission record.",
  },
  "note-finder": {
    title: "Note Finder",
    description: "Search through patient notes by keyword, author, or date.",
  },
  "consumable-requisition": {
    title: "Consumable Requisition",
    description: "Request ward consumables and chart items needed for bedside care.",
  },
  "vital-sign-graph": {
    title: "Vital Sign Graph",
    description: "Visualize trends in temperature, pulse, blood pressure, and oxygen saturation.",
  },
  "prescribed-medicine": {
    title: "Prescribed Medicine",
    description: "Review and update the patient's active medication orders.",
  },
  mar: {
    title: "MAR",
    description: "Medication administration history and nurse checks for the inpatient stay.",
  },
  "ipd-services": {
    title: "IPD Services",
    description: "Track clinical services ordered for the patient during admission.",
  },
  procedures: {
    title: "Procedures",
    description: "View scheduled or completed procedures and their clinical status.",
  },
  "final-diagnosis": {
    title: "Final Diagnosis",
    description: "Capture the admission discharge diagnosis and clinical summary for the patient.",
  },
  "doctor-visit": {
    title: "Doctor Visit",
    description: "Review the doctor's ward visit notes and planned follow-up actions.",
  },
  "vital-sign-chart": {
    title: "Vital Sign Chart",
    description: "See the vital sign values recorded over time in a structured chart view.",
  },
  "blood-transfusion": {
    title: "Blood Transfusion",
    description: "Create a blood transfusion request and collect pre-transfusion checks.",
  },
  "blood-transfusion-record": {
    title: "Blood Transfusion Record",
    description: "Review the history of blood transfusions delivered during this admission.",
  },
  billing: {
    title: "Billing",
    description: "Check the patient's current charges, insurance coverage, and payment status.",
  },
  allergy: {
    title: "Patient Allergy",
    description: "Document and review allergies, reactions, and medication sensitivities.",
  },
  "med-return": {
    title: "Medication Return Requisition",
    description: "Register medicines being returned from the ward or patient bedside.",
  },
  "view-requisition": {
    title: "View Requisition",
    description: "Browse open requisitions for consumables, medicines and investigations.",
  },
  "sample-collection": {
    title: "Sample Collection",
    description: "Manage lab sample labels, collection status and pickup schedules.",
  },
  investigation: {
    title: "Investigation View",
    description: "Track ordered investigations, report status and review pending tests.",
  },
  "blood-request": {
    title: "Blood Request",
    description: "Request blood products and specify the required components for transfusion.",
  },
  "pre-op-checklist": {
    title: "Pre-Op Checklist",
    description: "Confirm all pre-operative safety checks before planned surgery.",
  },
  "room-shift": {
    title: "Room Shift",
    description: "Move the patient to a new ward, room or bed as clinical needs change.",
  },
  discharge: {
    title: "Discharge",
    description: "Complete the discharge summary and prepare the patient for transfer home.",
  },
  documents: {
    title: "View / Uploaded Document",
    description: "Reference admission documents, attachments and scanned reports.",
  },
  "intake-output": {
    title: "Intake Output Chart",
    description: "Monitor fluid balance with intake and output totals for the patient.",
  },
  "transfer-mortuary": {
    title: "Transfer To Mortuary",
    description: "Create a transfer order for the patient in the event of a deceased admission.",
  },
  "ot-trainer": {
    title: "OT Trainer",
    description: "Record occupational therapy sessions and planned rehab activities.",
  },
  "bill-print": {
    title: "Bill Print",
    description: "Print the patient's current invoice and summary billing statement.",
  },
  "neurological-exam": {
    title: "Neurological Exam",
    description: "Document bedside neurological findings and cognitive assessment.",
  },
};

function ConsumableRequisitionForm({ patient }: { patient: any }) {
  const consumableOptions = [
    "Normal saline 500ml",
    "Gauze swabs",
    "Syringes 10ml",
    "IV cannula 18G",
    "Urine bag",
    "Oxygen mask",
    "Gloves (Medium)",
    "Gauze roll 10cm",
  ];
  const priorities = ["Normal", "Urgent", "Stat"];
  const issuingDepartments = ["Pharmacy", "Stores", "Laboratory", "CSSD", "Radiology"];
  const { toast } = useToast();
  const [wardLocation, setWardLocation] = useState(patient.ward || "");
  const [requestedBy, setRequestedBy] = useState(patient.billingDoctor || "");
  const [requestTo, setRequestTo] = useState(issuingDepartments[0]);
  const [neededBy, setNeededBy] = useState(new Date().toISOString().slice(0, 10));
  const [selectedItem, setSelectedItem] = useState(consumableOptions[0]);
  const [quantity, setQuantity] = useState(1);
  const [priority, setPriority] = useState(priorities[0]);
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<Array<{ item: string; qty: number; priority: string }>>([
    { item: "Normal saline 500ml", qty: 2, priority: "Normal" },
    { item: "Gauze swabs", qty: 10, priority: "Urgent" },
  ]);
  const [requisitions, setRequisitions] = useState<Array<{
    id: string;
    createdAt: string;
    wardLocation: string;
    requestedBy: string;
    requestTo: string;
    neededBy: string;
    notes: string;
    items: Array<{ item: string; qty: number; priority: string }>;
    itemCount: number;
    status: "Pending" | "Issued" | "Partially Issued" | "Rejected";
  }>>([]);
  const [showRequisitionList, setShowRequisitionList] = useState(false);
  const [selectedRequisitionId, setSelectedRequisitionId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addLineItem = () => {
    if (!selectedItem || quantity < 1) {
      toast({ title: "Invalid line item", description: "Select an item and quantity before adding.", variant: "destructive" });
      return;
    }
    setItems((prev) => [...prev, { item: selectedItem, qty: quantity, priority }]);
    setQuantity(1);
    setPriority(priorities[0]);
  };

  const removeLineItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const submitRequisition = async () => {
    if (!wardLocation.trim() || !requestedBy.trim() || !requestTo.trim()) {
      toast({ title: "Missing details", description: "Enter the ward location, requester, and issuing department before submitting.", variant: "destructive" });
      return;
    }

    if (items.length === 0) {
      toast({ title: "No items added", description: "Add at least one consumable item to the requisition.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    setIsSubmitting(false);

    const newRequisition = {
      id: `${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      createdAt: new Date().toLocaleString(),
      wardLocation: wardLocation.trim(),
      requestedBy: requestedBy.trim(),
      requestTo: requestTo.trim(),
      neededBy,
      notes,
      items: [...items],
      itemCount: items.length,
      status: "Pending" as const,
    };

    setRequisitions((prev) => [newRequisition, ...prev]);
    setSelectedRequisitionId(null);
    toast({
      title: "Requisition raised",
      description: `Requested ${items.length} consumable item(s) for ${patient.name}.`,
    });
    setItems([]);
    setNotes("");
    setShowRequisitionList(true);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Consumable Requisition</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Patient</Label>
            <Input value={`${patient.name} (${patient.pid})`} readOnly />
          </div>
          <div className="space-y-2">
            <Label>Ward / Location</Label>
            <Input value={wardLocation} onChange={(e) => setWardLocation(e.target.value)} />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label>Requested By</Label>
            <Input value={requestedBy} onChange={(e) => setRequestedBy(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Request To</Label>
            <Select onValueChange={(value) => setRequestTo(value)}>
              <SelectTrigger className="w-full">
                <SelectValue>{requestTo}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {issuingDepartments.map((department) => (
                  <SelectItem key={department} value={department}>
                    {department}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Required By</Label>
            <Input type="date" value={neededBy} onChange={(e) => setNeededBy(e.target.value)} />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label>Consumable Item</Label>
            <Select onValueChange={(value) => setSelectedItem(value)}>
              <SelectTrigger className="w-full">
                <SelectValue>{selectedItem}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {consumableOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Quantity</Label>
            <Input type="number" min={1} value={quantity} onChange={(e) => setQuantity(Number(e.target.value) || 1)} />
          </div>
          <div className="space-y-2">
            <Label>Priority</Label>
            <Select onValueChange={(value) => setPriority(value)}>
              <SelectTrigger className="w-full">
                <SelectValue>{priority}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {priorities.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Notes / Instructions</Label>
          <Textarea rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Delivery notes, preferred packaging, or clinical justification." />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" onClick={addLineItem}>
            Add Item
          </Button>
          <span className="text-sm text-slate-500">Add each consumable line item before submitting the requisition.</span>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, index) => (
                <TableRow key={`${item.item}-${index}`}>
                  <TableCell>{item.item}</TableCell>
                  <TableCell>{item.qty}</TableCell>
                  <TableCell>{item.priority}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => removeLineItem(index)}>
                      Remove
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-slate-500 py-4">
                    No requisition items added yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-slate-500">Total items: {items.length}</div>
          <div className="flex flex-wrap items-center gap-3">
            {requisitions.length > 0 && (
              <Button type="button" variant="outline" onClick={() => setShowRequisitionList((prev) => !prev)}>
                {showRequisitionList ? "Hide Requisitions" : "View Requisition"}
              </Button>
            )}
            <Button type="button" onClick={submitRequisition} disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Raise Requisition"}
            </Button>
          </div>
        </div>

        {requisitions.length > 0 && showRequisitionList && (
          <div className="space-y-4 pt-4">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">Raised Requisitions</p>
                  <p className="text-xs text-slate-500">Showing all requests and their current status.</p>
                </div>
              </div>
            </div>
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead>Ward</TableHead>
                    <TableHead>Requested By</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requisitions.map((req) => (
                    <>
                      <TableRow key={req.id}>
                        <TableCell>{req.createdAt}</TableCell>
                        <TableCell>{req.requestTo}</TableCell>
                        <TableCell>{req.wardLocation}</TableCell>
                        <TableCell>{req.requestedBy}</TableCell>
                        <TableCell>{req.itemCount}</TableCell>
                        <TableCell>
                          <Badge className="capitalize">{req.status.toLowerCase()}</Badge>
                        </TableCell>
                        <TableCell>
                          <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedRequisitionId((prev) => (prev === req.id ? null : req.id))}>
                            {selectedRequisitionId === req.id ? "Hide Details" : "View"}
                          </Button>
                        </TableCell>
                      </TableRow>
                      {selectedRequisitionId === req.id && (
                        <TableRow>
                          <TableCell colSpan={7} className="bg-slate-50 p-4">
                            <div className="space-y-3 rounded-3xl border border-slate-200 bg-white p-4">
                              <div className="grid gap-4 md:grid-cols-3">
                                <div>
                                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Needed By</p>
                                  <p className="text-sm font-medium">{req.neededBy}</p>
                                </div>
                                <div>
                                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Request Notes</p>
                                  <p className="text-sm text-slate-600">{req.notes || "No additional notes."}</p>
                                </div>
                                <div>
                                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Status</p>
                                  <Badge className="capitalize">{req.status.toLowerCase()}</Badge>
                                </div>
                              </div>
                              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50">
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Item</TableHead>
                                      <TableHead>Qty</TableHead>
                                      <TableHead>Priority</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {req.items.map((item, index) => (
                                      <TableRow key={`${req.id}-item-${index}`}>
                                        <TableCell>{item.item}</TableCell>
                                        <TableCell>{item.qty}</TableCell>
                                        <TableCell>{item.priority}</TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function renderSubmoduleBody(key: string, patient: any) {
  switch (key) {
    case "notes": {
      const notes = [
        { author: "Dr. Ochieng", type: "Ward Round Note", note: "Patient remains stable with controlled blood pressure.", time: "2026-03-14 09:20" },
        { author: "Nurse Akinyi", type: "Nursing Note", note: "IV site clean, legs elevated, pain managed with paracetamol.", time: "2026-03-13 17:35" },
      ];
      return (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Clinical Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Author</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notes.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.author}</TableCell>
                    <TableCell>{item.type}</TableCell>
                    <TableCell>{item.note}</TableCell>
                    <TableCell>{item.time}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      );
    }
    case "note-create": {
      const noteTypes = ["Ward Round Note", "Nursing Note", "Discharge Note", "Consult Note"];
      const templates = ["History Template", "Assessment Template", "Plan Template"];
      const sources = ["Active Medicine", "Patient Demographic", "Last Vital", "Investigation", "NICU", "PACS Images"];

      return (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Note Writer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Note Type</Label>
                <Select>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select note type" />
                  </SelectTrigger>
                  <SelectContent>
                    {noteTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Template</Label>
                <Select>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template} value={template}>
                        {template}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Note Type Entries</Label>
              <div className="flex flex-wrap gap-2">
                {sources.map((source) => (
                  <Badge key={source} variant="secondary" className="rounded-full px-3 py-1 text-xs font-medium">
                    {source}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50">
              <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-white px-3 py-2">
                {[
                  { label: "B" },
                  { label: "I" },
                  { label: "U" },
                  { label: "•" },
                  { label: "1." },
                  { label: "Quote" },
                  { label: "Table" },
                  { label: "Img" },
                ].map((action) => (
                  <Button key={action.label} variant="outline" size="sm" className="min-w-[40px] px-2">
                    {action.label}
                  </Button>
                ))}
              </div>
              <div className="p-4">
                <Textarea
                  rows={12}
                  className="min-h-[320px] bg-white text-slate-900"
                  defaultValue="Enter the patient's progress note, clinical update and care plan here..."
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3">
              <Button variant="outline">Save Draft</Button>
              <Button>Create Note</Button>
            </div>
          </CardContent>
        </Card>
      );
    }
    case "note-finder":
      return (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Find Note</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Search keyword</Label>
                <Input placeholder="Enter note text, author or date" />
              </div>
              <div className="space-y-2">
                <Label>Filter by type</Label>
                <Input placeholder="Doctor note, nursing note, discharge note" />
              </div>
            </div>
            <Button>Search Notes</Button>
          </CardContent>
        </Card>
      );
    case "consumable-requisition":
      return <ConsumableRequisitionForm patient={patient} />;
    case "vital-sign-graph":
      return (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Vital Signs Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72 rounded-3xl bg-slate-950 p-6 text-slate-400">
                <p className="text-sm">Graph preview placeholder showing temperature, pulse, blood pressure, and SPO2 trends over time.</p>
              </div>
            </CardContent>
          </Card>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              { label: "Latest Temperature", value: "36.8°C" },
              { label: "Latest Pulse", value: "78 bpm" },
              { label: "Latest BP", value: "132/84 mmHg" },
              { label: "Latest SPO2", value: "98%" },
            ].map((card) => (
              <Card key={card.label}>
                <CardContent className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{card.label}</p>
                  <p className="text-2xl font-semibold text-foreground">{card.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      );
    case "prescribed-medicine": {
      const meds = [
        { drug: "Captopril 25mg", dose: "1 tab BD", route: "PO", status: "Active" },
        { drug: "Metformin 500mg", dose: "1 tab BD", route: "PO", status: "Active" },
      ];
      return (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Prescribed Medicines</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Drug</TableHead>
                  <TableHead>Dosage</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {meds.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.drug}</TableCell>
                    <TableCell>{item.dose}</TableCell>
                    <TableCell>{item.route}</TableCell>
                    <TableCell>{item.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Button>Update Prescription</Button>
          </CardContent>
        </Card>
      );
    }
    case "mar": {
      const administrations = [
        { time: "08:00", medication: "Captopril", nurse: "Nurse Akinyi", status: "Given" },
        { time: "14:00", medication: "Metformin", nurse: "Nurse Wanjiru", status: "Scheduled" },
      ];
      return (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Medication Administration Record</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Medication</TableHead>
                  <TableHead>Nurse</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {administrations.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.time}</TableCell>
                    <TableCell>{item.medication}</TableCell>
                    <TableCell>{item.nurse}</TableCell>
                    <TableCell>{item.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      );
    }
    case "ipd-services": {
      const services = [
        { name: "Physiotherapy", status: "Pending" },
        { name: "Dietitian Consultation", status: "Scheduled" },
      ];
      return (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">IPD Services</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Button>Order New Service</Button>
          </CardContent>
        </Card>
      );
    }
    case "procedures": {
      const procedures = [
        { procedure: "Chest X-ray", date: "2026-03-15", status: "Planned" },
        { procedure: "IV Cannulation", date: "2026-03-13", status: "Completed" },
      ];
      return (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Procedures</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Procedure</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {procedures.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.procedure}</TableCell>
                    <TableCell>{item.date}</TableCell>
                    <TableCell>{item.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      );
    }
    case "final-diagnosis":
      return (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Final Diagnosis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea rows={6} defaultValue={patient.diagnosis} />
            <Button>Save Diagnosis</Button>
          </CardContent>
        </Card>
      );
    case "doctor-visit": {
      const visits = [
        { doctor: "Dr. Ochieng", time: "09:00", notes: "Continue antihypertensives, observe input/output." },
        { doctor: "Dr. Njeri", time: "15:00", notes: "Review post-op wound, order repeat labs." },
      ];
      return (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Doctor Visit Log</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visits.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.doctor}</TableCell>
                    <TableCell>{item.time}</TableCell>
                    <TableCell>{item.notes}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      );
    }
    case "vital-sign-chart": {
      const values = [
        { date: "2026-03-13", temp: "37.1°C", pulse: "80 bpm", bp: "120/78" },
        { date: "2026-03-14", temp: "36.9°C", pulse: "78 bpm", bp: "118/76" },
      ];
      return (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Vital Sign Chart</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Temperature</TableHead>
                  <TableHead>Pulse</TableHead>
                  <TableHead>BP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {values.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.date}</TableCell>
                    <TableCell>{item.temp}</TableCell>
                    <TableCell>{item.pulse}</TableCell>
                    <TableCell>{item.bp}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      );
    }
    case "blood-transfusion":
      return (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Blood Transfusion Request</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2"><Label>Blood Group</Label><Input defaultValue="O+" /></div>
              <div className="space-y-2"><Label>Component</Label><Input defaultValue="Packed Cells" /></div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2"><Label>Units</Label><Input defaultValue="2" type="number" /></div>
              <div className="space-y-2"><Label>Reason</Label><Input defaultValue="Anemia requiring transfusion" /></div>
            </div>
            <Button>Submit Request</Button>
          </CardContent>
        </Card>
      );
    case "blood-transfusion-record": {
      const records = [
        { date: "2026-03-12", component: "Packed Cells", units: 2, status: "Completed" },
      ];
      return (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Transfusion Records</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Component</TableHead>
                  <TableHead>Units</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.date}</TableCell>
                    <TableCell>{item.component}</TableCell>
                    <TableCell>{item.units}</TableCell>
                    <TableCell>{item.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      );
    }
    case "billing": {
      const charges = [
        { item: "Bed charges", amount: 4200 },
        { item: "Medication", amount: 1800 },
        { item: "Lab tests", amount: 2100 },
      ];
      return (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Billing Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount (KES)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {charges.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.item}</TableCell>
                    <TableCell>{item.amount.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="font-semibold">
                  <TableCell>Total</TableCell>
                  <TableCell>{charges.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
            <Button>Review Invoice</Button>
          </CardContent>
        </Card>
      );
    }
    case "allergy": {
      const allergies = [
        { agent: "Penicillin", reaction: "Rash", severity: "Moderate" },
      ];
      return (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Allergy Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Allergen</TableHead>
                  <TableHead>Reaction</TableHead>
                  <TableHead>Severity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allergies.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.agent}</TableCell>
                    <TableCell>{item.reaction}</TableCell>
                    <TableCell>{item.severity}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Button>Add Allergy</Button>
          </CardContent>
        </Card>
      );
    }
    case "med-return":
      return (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Medication Return Requisition</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder="Medicine name" />
            <Input placeholder="Quantity to return" type="number" />
            <Textarea rows={4} placeholder="Reason for return" />
            <Button>Submit Return</Button>
          </CardContent>
        </Card>
      );
    case "view-requisition": {
      const requisitions = [
        { id: "REQ-1001", type: "Medication", status: "Approved" },
        { id: "REQ-1002", type: "Consumable", status: "Pending" },
      ];
      return (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Requisition Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Request ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requisitions.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.id}</TableCell>
                    <TableCell>{item.type}</TableCell>
                    <TableCell>{item.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      );
    }
    case "sample-collection": {
      const samples = [
        { sample: "CBC", status: "Collected" },
        { sample: "Culture", status: "Pending" },
      ];
      return (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sample Collection</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sample</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {samples.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.sample}</TableCell>
                    <TableCell>{item.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Button>Request Collection</Button>
          </CardContent>
        </Card>
      );
    }
    case "investigation": {
      const investigations = [
        { name: "Chest X-ray", status: "Approved" },
        { name: "Blood culture", status: "Pending" },
      ];
      return (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Investigations</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Investigation</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {investigations.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      );
    }
    case "blood-request":
      return (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Blood Request</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder="Component required" defaultValue="Packed Cells" />
            <Input placeholder="Units" defaultValue="2" type="number" />
            <Textarea rows={4} placeholder="Clinical justification" defaultValue="Post-operative anemia with Hb 7.8 g/dL." />
            <Button>Submit Blood Request</Button>
          </CardContent>
        </Card>
      );
    case "pre-op-checklist": {
      const checklist = [
        "Consent form signed",
        "Fasting confirmed",
        "Blood group checked",
        "Allergies verified",
        "IV access secured",
      ];
      return (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pre-Op Checklist</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {checklist.map((item, index) => (
              <div key={index} className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span>{item}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      );
    }
    case "room-shift":
      return (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Room Shift</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2"><Label>Current Ward</Label><Input defaultValue={patient.ward} readOnly /></div>
              <div className="space-y-2"><Label>New Ward / Bed</Label><Input placeholder="Enter new ward / bed" /></div>
            </div>
            <Button>Submit Transfer</Button>
          </CardContent>
        </Card>
      );
    case "discharge":
      return (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Discharge Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input defaultValue={patient.name} readOnly />
            <Textarea rows={5} defaultValue="Discharge summary and follow-up plan." />
            <Button>Finalize Discharge</Button>
          </CardContent>
        </Card>
      );
    case "documents": {
      const docs = [
        { name: "Admission Form.pdf", uploaded: "2026-03-10" },
        { name: "Lab Result.pdf", uploaded: "2026-03-13" },
      ];
      return (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Uploaded Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document</TableHead>
                  <TableHead>Uploaded</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {docs.map((doc, index) => (
                  <TableRow key={index}>
                    <TableCell>{doc.name}</TableCell>
                    <TableCell>{doc.uploaded}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Button>Upload Document</Button>
          </CardContent>
        </Card>
      );
    }
    case "intake-output":
      return (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Intake / Output Chart</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-3xl bg-slate-950 p-4">
                <p className="text-xs uppercase text-slate-500">Total Intake</p>
                <p className="mt-2 text-2xl font-semibold">2300 ml</p>
              </div>
              <div className="rounded-3xl bg-slate-950 p-4">
                <p className="text-xs uppercase text-slate-500">Total Output</p>
                <p className="mt-2 text-2xl font-semibold">1900 ml</p>
              </div>
            </div>
            <div className="h-48 rounded-3xl bg-slate-900 p-4 text-slate-400">Chart preview placeholder for fluid balance.</div>
          </CardContent>
        </Card>
      );
    case "transfer-mortuary":
      return (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Transfer to Mortuary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <AlertTriangle className="h-6 w-6 text-destructive" />
            <Textarea rows={4} defaultValue="Confirm deceased patient transfer to mortuary with transfer notes." />
            <Button variant="destructive">Submit Transfer</Button>
          </CardContent>
        </Card>
      );
    case "ot-trainer":
      return (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">OT Trainer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-400">Plan and track occupational therapy exercises and training sessions.</p>
            <Textarea rows={5} defaultValue="Document rehabilitation goals and daily therapy progress." />
            <Button>Save OT Plan</Button>
          </CardContent>
        </Card>
      );
    case "bill-print":
      return (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Bill Print</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-400">Preview the current patient bill and print it for the ward cashier.</p>
            <Button>Print Bill</Button>
          </CardContent>
        </Card>
      );
    case "neurological-exam":
      return (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Neurological Exam</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2"><Label>Level of consciousness</Label><Input defaultValue="Alert" readOnly /></div>
              <div className="space-y-2"><Label>Pupils</Label><Input defaultValue="Equal reactive" readOnly /></div>
            </div>
            <Textarea rows={5} defaultValue="Motor exam, reflexes, coordination and sensory findings." />
          </CardContent>
        </Card>
      );
    default:
      return (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Patient Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-400">Select a submodule from the sidebar to manage the patient's IPD workflow.</p>
          </CardContent>
        </Card>
      );
  }
}

export default function IPDSubmodulePage() {
  const { id, submodule } = useParams();
  const patient = useMemo(
    () => admittedPatients.find((item) => item.id === id) ?? admittedPatients[0],
    [id]
  );

  const slugToKey: Record<string, string> = {
    "create-note": "note-create",
    "find-note": "note-finder",
    "consumables": "consumable-requisition",
    "vital-graph": "vital-sign-graph",
    "vital-chart": "vital-sign-chart",
    "services": "ipd-services",
    "documents": "documents",
    "intake-output": "intake-output",
    "transfer-mortuary": "transfer-mortuary",
    "bill-print": "bill-print",
    "allergy": "allergy",
    "med-return": "med-return",
    "view-requisition": "view-requisition",
    "sample-collection": "sample-collection",
    "investigation": "investigation",
    "blood-request": "blood-request",
    "pre-op-checklist": "pre-op-checklist",
    "room-shift": "room-shift",
    "discharge": "discharge",
    "prescribed-medicine": "prescribed-medicine",
    "mar": "mar",
    "procedures": "procedures",
    "final-diagnosis": "final-diagnosis",
    "doctor-visit": "doctor-visit",
    "blood-transfusion": "blood-transfusion",
    "blood-transfusion-record": "blood-transfusion-record",
    "billing": "billing",
    "neurological-exam": "neurological-exam",
  };

  const key = (submodule && (slugToKey[submodule] ?? submodule)) ?? "notes";
  const meta = submoduleMeta[key] ?? {
    title: key.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
    description: "Use this screen to manage the selected IPD task for the patient.",
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-heading font-bold text-foreground">{meta.title}</h2>
          <p className="text-sm text-muted-foreground">{meta.description}</p>
        </div>
      </div>
      {renderSubmoduleBody(key, patient)}
    </div>
  );
}
