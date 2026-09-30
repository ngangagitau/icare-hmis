import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, ArrowLeft, Receipt, CheckCircle2, Search, User, ShieldCheck } from "lucide-react";
import { usePatients } from "@/hooks/usePatients";
import { useCreateBill } from "@/hooks/useBilling";
import type { BillingItem } from "@/lib/billingService";
import { toast } from "sonner";

const COMMON_SERVICES: Array<{ desc: string; cat: BillingItem["category"]; rate: number }> = [
  { desc: "General Outpatient Consultation", cat: "Consultation", rate: 1500 },
  { desc: "Specialist Physician Consultation", cat: "Consultation", rate: 3000 },
  { desc: "Emergency Room Triage & Assessment", cat: "Procedure", rate: 2500 },
  { desc: "Complete Blood Count (CBC)", cat: "Laboratory", rate: 1200 },
  { desc: "Urinalysis (Routine)", cat: "Laboratory", rate: 600 },
  { desc: "Fasting Blood Sugar Test", cat: "Laboratory", rate: 500 },
  { desc: "Chest X-Ray PA View", cat: "Radiology", rate: 2500 },
  { desc: "Abdominal Ultrasound", cat: "Radiology", rate: 4500 },
  { desc: "General Ward Bed (Per Day)", cat: "Ward", rate: 3500 },
  { desc: "Nursing Care & Vitals Monitoring", cat: "Nursing", rate: 1000 },
  { desc: "IV Cannulation & Fluid Administration", cat: "Procedure", rate: 800 },
];

export default function NewInvoice() {
  const navigate = useNavigate();
  const { data: patientsData } = usePatients(1, 100);
  const createBillMutation = useCreateBill();

  const patients = patientsData?.data || [];

  const [patientId, setPatientId] = useState("");
  const [paymentMode, setPaymentMode] = useState("Cash");
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().slice(0, 10));
  const [discount, setDiscount] = useState<number>(0);
  const [tax, setTax] = useState<number>(0);
  const [notes, setNotes] = useState("");

  const [items, setItems] = useState<BillingItem[]>([
    { description: "General Outpatient Consultation", category: "Consultation", quantity: 1, unitPrice: 1500, amount: 1500 },
  ]);

  const [customDesc, setCustomDesc] = useState("");
  const [customCat, setCustomCat] = useState<BillingItem["category"]>("Consultation");
  const [customQty, setCustomQty] = useState(1);
  const [customRate, setCustomRate] = useState(0);

  const selectedPatient = patients.find((p) => p.id === patientId || p.patientId === patientId);

  const addItem = (desc: string, cat: BillingItem["category"], rate: number, qty: number = 1) => {
    setItems((prev) => [...prev, { description: desc, category: cat, quantity: qty, unitPrice: rate, amount: qty * rate }]);
  };

  const removeItem = (idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const subtotal = items.reduce((acc, it) => acc + (it.amount || it.quantity * it.unitPrice), 0);
  const totalAmount = Math.max(subtotal - discount + tax, 0);

  const handleSubmit = async () => {
    if (!patientId) {
      toast.error("Please select a patient");
      return;
    }
    if (!items.length) {
      toast.error("Please add at least one billable item");
      return;
    }

    try {
      await createBillMutation.mutateAsync({
        patientId,
        paymentMethod: paymentMode,
        invoiceDate,
        items,
        totalAmount,
        total: totalAmount,
        notes,
      });

      toast.success("Invoice generated successfully!");
      navigate("/billing");
    } catch (err: any) {
      toast.error("Invoice generation failed", { description: err.message });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate("/billing")} className="gap-1 text-xs">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Billing
          </Button>
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">New Patient Invoice</h1>
            <p className="text-xs text-muted-foreground">Generate departmental invoice with itemized charges</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Invoice Details & Patient Picker (1 col) */}
        <div className="space-y-4">
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Patient & Scheme Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Select Patient</Label>
                <Select value={patientId} onValueChange={setPatientId}>
                  <SelectTrigger className="text-xs h-9">
                    <SelectValue placeholder="Choose registered patient..." />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((p) => (
                      <SelectItem key={p.id} value={p.id || ""}>
                        {p.firstName} {p.lastName} ({p.patientId})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedPatient && (
                <div className="p-3 rounded-lg border border-border bg-muted/30 text-xs space-y-1">
                  <div className="flex justify-between font-semibold">
                    <span>{selectedPatient.firstName} {selectedPatient.lastName}</span>
                    <Badge variant="outline">{selectedPatient.patientId}</Badge>
                  </div>
                  <p className="text-muted-foreground">Phone: {selectedPatient.phone || "No phone"}</p>
                  {selectedPatient.insurance && (
                    <div className="flex items-center gap-1.5 text-indigo-600 font-medium pt-1">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      <span>
                        {typeof selectedPatient.insurance === "object"
                          ? `${selectedPatient.insurance.provider} (${selectedPatient.insurance.memberNumber || "Active"})`
                          : "Insured"}
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Payment Mode</Label>
                <Select value={paymentMode} onValueChange={setPaymentMode}>
                  <SelectTrigger className="text-xs h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="M-Pesa">M-Pesa Mobile Money</SelectItem>
                    <SelectItem value="Credit Card">Credit / Debit Card</SelectItem>
                    <SelectItem value="SHA">Social Health Authority (SHA)</SelectItem>
                    <SelectItem value="Insurance">Private Insurance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Invoice Date</Label>
                <Input
                  type="date"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  className="text-xs h-9"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Clinical / Billing Remarks</Label>
                <Input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. OPD Follow-up, Routine Labs"
                  className="text-xs h-9"
                />
              </div>
            </CardContent>
          </Card>

          {/* Quick Service Catalog Presets */}
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Quick Service Presets
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5 max-h-[250px] overflow-y-auto pt-0 text-xs">
              {COMMON_SERVICES.map((srv, i) => (
                <div
                  key={i}
                  onClick={() => addItem(srv.desc, srv.cat, srv.rate)}
                  className="flex items-center justify-between p-2 rounded-md hover:bg-muted cursor-pointer transition-colors border border-transparent hover:border-border"
                >
                  <div>
                    <p className="font-medium text-foreground">{srv.desc}</p>
                    <Badge variant="secondary" className="text-[10px] mt-0.5">{srv.cat}</Badge>
                  </div>
                  <span className="font-mono font-semibold text-primary">KES {srv.rate.toLocaleString()}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Line Items Table & Invoice Totalizer (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Invoice Line Items</CardTitle>
                <CardDescription className="text-xs">Add departmental services and medical items</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Custom Item Adder */}
              <div className="grid grid-cols-12 gap-2 p-3 bg-muted/30 border border-border rounded-xl">
                <div className="col-span-5 space-y-1">
                  <Label className="text-[11px]">Description</Label>
                  <Input
                    placeholder="Enter procedure, drug or test"
                    value={customDesc}
                    onChange={(e) => setCustomDesc(e.target.value)}
                    className="text-xs h-8"
                  />
                </div>
                <div className="col-span-3 space-y-1">
                  <Label className="text-[11px]">Category</Label>
                  <Select value={customCat} onValueChange={(v: any) => setCustomCat(v)}>
                    <SelectTrigger className="text-xs h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Consultation">Consultation</SelectItem>
                      <SelectItem value="Laboratory">Laboratory</SelectItem>
                      <SelectItem value="Radiology">Radiology</SelectItem>
                      <SelectItem value="Pharmacy">Pharmacy</SelectItem>
                      <SelectItem value="Procedure">Procedure</SelectItem>
                      <SelectItem value="Ward">Ward</SelectItem>
                      <SelectItem value="Nursing">Nursing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2 space-y-1">
                  <Label className="text-[11px]">Qty</Label>
                  <Input
                    type="number"
                    min={1}
                    value={customQty}
                    onChange={(e) => setCustomQty(Number(e.target.value))}
                    className="text-xs h-8 font-mono"
                  />
                </div>
                <div className="col-span-2 space-y-1">
                  <Label className="text-[11px]">Rate (KES)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={customRate || ""}
                    onChange={(e) => setCustomRate(Number(e.target.value))}
                    className="text-xs h-8 font-mono"
                  />
                </div>
                <div className="col-span-12 flex justify-end mt-1">
                  <Button
                    size="sm"
                    className="h-8 text-xs gap-1.5"
                    onClick={() => {
                      if (!customDesc || customRate <= 0) {
                        toast.error("Please enter a description and rate");
                        return;
                      }
                      addItem(customDesc, customCat, customRate, customQty);
                      setCustomDesc("");
                      setCustomQty(1);
                      setCustomRate(0);
                    }}
                  >
                    <Plus className="h-3 w-3" /> Add Line Item
                  </Button>
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-border rounded-xl overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="text-xs font-semibold">Service / Description</TableHead>
                      <TableHead className="text-xs font-semibold">Category</TableHead>
                      <TableHead className="text-xs font-semibold text-center">Qty</TableHead>
                      <TableHead className="text-xs font-semibold text-right">Unit Rate (KES)</TableHead>
                      <TableHead className="text-xs font-semibold text-right">Total (KES)</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="text-xs">
                    {items.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                          No items added yet. Click a preset on the left or add a service above.
                        </TableCell>
                      </TableRow>
                    ) : (
                      items.map((it, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-medium text-foreground">{it.description}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="text-[10px]">{it.category}</Badge>
                          </TableCell>
                          <TableCell className="text-center font-mono">{it.quantity}</TableCell>
                          <TableCell className="text-right font-mono text-muted-foreground">
                            {it.unitPrice.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right font-mono font-bold text-foreground">
                            {(it.amount || it.quantity * it.unitPrice).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-center">
                            <button
                              onClick={() => removeItem(idx)}
                              className="text-rose-500 hover:text-rose-700 p-1"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Bill Totals Summary */}
              <div className="p-4 bg-muted/30 border border-border rounded-xl space-y-2 max-w-sm ml-auto text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal:</span>
                  <span className="font-mono font-semibold text-foreground">KES {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>Discount (KES):</span>
                  <Input
                    type="number"
                    value={discount || ""}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                    className="w-24 h-7 text-xs font-mono text-right"
                    placeholder="0"
                  />
                </div>
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>Tax (KES):</span>
                  <Input
                    type="number"
                    value={tax || ""}
                    onChange={(e) => setTax(Number(e.target.value))}
                    className="w-24 h-7 text-xs font-mono text-right"
                    placeholder="0"
                  />
                </div>
                <div className="flex justify-between pt-2 border-t border-border font-bold text-sm text-foreground">
                  <span>Total Amount Due:</span>
                  <span className="text-primary font-mono text-base">KES {totalAmount.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={() => navigate("/billing")}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={createBillMutation.isPending}
                  className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <CheckCircle2 className="h-4 w-4" /> Save & Issue Invoice
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
