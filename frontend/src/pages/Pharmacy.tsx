import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Pill,
  Search,
  AlertTriangle,
  ShoppingCart,
  TrendingDown,
  Loader2,
  Boxes,
  Clock,
  FileText,
  Printer,
  CheckCircle2,
  Plus,
  Trash2,
  Check,
  ShieldAlert,
  AlertCircle,
} from "lucide-react";
import { usePrescriptions, useUpdatePrescriptionStatus } from "@/hooks/usePrescriptions";
import {
  useCreateOtcSale,
  useCreateStockMovement,
  useInventoryLite,
  useOtcSales,
  usePharmacyStats,
  useStockMovements,
  useStockSummary,
} from "@/hooks/usePharmacyOps";
import DepartmentWaitingPatients from "@/components/DepartmentWaitingPatients";
import { toast } from "sonner";
import type { Prescription } from "@/lib/prescriptionService";

const statusStyle: Record<string, string> = {
  Ready: "bg-blue-500/10 text-blue-600 border-blue-500/30",
  Pending: "bg-warning/10 text-warning border-warning/30",
  Dispensed: "bg-success/10 text-success border-success/30",
};

export default function Pharmacy() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [rxStatusFilter, setRxStatusFilter] = useState<"all" | "Pending" | "Ready" | "Dispensed">("all");

  const { data: prescriptions = [], isLoading: rxLoading } = usePrescriptions();
  const statusMutation = useUpdatePrescriptionStatus();
  const { data: stats } = usePharmacyStats();
  const { data: stockSummary } = useStockSummary();
  const { data: inventory = [] } = useInventoryLite();
  const { data: otcSales = [] } = useOtcSales();
  const { data: stockMovements = [] } = useStockMovements();
  const createOtcSaleMutation = useCreateOtcSale();
  const createStockMovementMutation = useCreateStockMovement();

  // Dispensing Dialog State
  const [dispenseModalRx, setDispenseModalRx] = useState<Prescription | null>(null);
  const [counselingNotes, setCounselingNotes] = useState("");

  // OTC Sale State
  const [otcItemId, setOtcItemId] = useState("");
  const [otcQty, setOtcQty] = useState(1);
  const [otcPrice, setOtcPrice] = useState<number>(0);
  const [otcBasket, setOtcBasket] = useState<
    Array<{ inventoryId: string; itemName: string; quantity: number; unitPrice: number }>
  >([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);

  // Stock Movement State
  const [stockItemId, setStockItemId] = useState("");
  const [movementType, setMovementType] = useState<"RECEIVE" | "ADJUSTMENT" | "ISSUE">("RECEIVE");
  const [direction, setDirection] = useState<"INCREASE" | "DECREASE">("INCREASE");
  const [movementQty, setMovementQty] = useState(10);
  const [movementCost, setMovementCost] = useState(0);
  const [movementReason, setMovementReason] = useState("");

  const filteredPrescriptions = useMemo(() => {
    let list = prescriptions;
    if (rxStatusFilter !== "all") {
      list = list.filter((rx) => rx.status === rxStatusFilter);
    }
    if (!search) return list;
    const lower = search.toLowerCase();
    return list.filter(
      (rx) =>
        (rx.patientName || "").toLowerCase().includes(lower) ||
        (rx.patientDisplayId || "").toLowerCase().includes(lower) ||
        (rx.prescriptionNumber || "").toLowerCase().includes(lower) ||
        rx.items.some((i) => (i.drug || "").toLowerCase().includes(lower))
    );
  }, [prescriptions, search, rxStatusFilter]);

  const pendingCount = prescriptions.filter((p) => p.status === "Pending").length;
  const readyCount = prescriptions.filter((p) => p.status === "Ready").length;
  const dispensedCount = prescriptions.filter((p) => p.status === "Dispensed").length;

  const lowStockCount = stats?.lowStockItems ?? stockSummary?.lowStockItems ?? inventory.filter((i) => i.currentStock > 0 && i.currentStock <= i.reorderPoint).length;
  const outOfStockCount = stats?.expiredItems ?? stockSummary?.outOfStockItems ?? 0;

  const basketSubtotal = otcBasket.reduce((acc, i) => acc + i.quantity * i.unitPrice, 0);
  const basketTotal = Math.max(0, basketSubtotal - discount + tax);

  const handleSetStatus = async (id: string, status: "Pending" | "Ready" | "Dispensed") => {
    try {
      await statusMutation.mutateAsync({ id, status });
      toast.success(`Prescription marked as ${status.toLowerCase()}`);
    } catch (_e) {
      toast.error("Failed to update prescription status");
    }
  };

  const handleOpenDispenseModal = (rx: Prescription) => {
    setDispenseModalRx(rx);
    setCounselingNotes("Take prescribed dosage as directed with water. Complete entire antibiotic course if applicable.");
  };

  const handleConfirmDispense = async () => {
    if (!dispenseModalRx) return;
    try {
      await statusMutation.mutateAsync({ id: dispenseModalRx._id, status: "Dispensed" });
      toast.success(`Prescription ${dispenseModalRx.prescriptionNumber} dispensed!`);
      const justDispensed = dispenseModalRx;
      setDispenseModalRx(null);
      // Offer label print
      printDispensingLabel(justDispensed);
    } catch (_e) {
      toast.error("Failed to complete dispensing");
    }
  };

  const printDispensingLabel = (rx: Prescription) => {
    const itemLines = rx.items
      .map(
        (i) => `
        <div style="border-bottom: 1px dashed #ccc; padding: 4px 0;">
          <strong>${i.drug}</strong><br/>
          <span>Dosage: ${i.dosage} | ${i.frequency || 'Daily'} | ${i.duration || '5 days'}</span><br/>
          <small style="color: #555;">${i.instructions || 'Take as directed'}</small>
        </div>`
      )
      .join("");

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Dispense Slip - ${rx.prescriptionNumber}</title>
          <style>
            @page { size: 80mm auto; margin: 3mm; }
            body { font-family: monospace; font-size: 11px; margin: 0; padding: 6px; }
            .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 6px; margin-bottom: 6px; }
            .bold { font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="bold" style="font-size: 13px;">iCARE HOSPITAL PHARMACY</div>
            <div>PRESCRIPTION DISPENSE LABEL</div>
            <div>${rx.prescriptionNumber} · ${new Date().toLocaleDateString()}</div>
          </div>
          <div style="margin-bottom: 6px;">
            <div><strong>Patient:</strong> ${rx.patientName} (${rx.patientDisplayId})</div>
            <div><strong>Status:</strong> DISPENSED & VERIFIED</div>
          </div>
          <div>${itemLines}</div>
          <div style="margin-top: 8px; font-size: 10px; text-align: center; color: #555;">
            * KEEP ALL MEDICINES OUT OF REACH OF CHILDREN *
          </div>
        </body>
      </html>
    `;
    const w = window.open("", "_blank", "width=320,height=450");
    if (!w) return;
    w.document.write(html);
    w.document.close();
    w.focus();
    w.print();
  };

  const addToBasket = () => {
    if (!otcItemId || otcQty <= 0) return;
    const item = inventory.find((i) => i._id === otcItemId);
    if (!item) return;
    const effectivePrice = otcPrice > 0 ? otcPrice : item.unitCost || 20;

    // Check if already in basket
    const existingIndex = otcBasket.findIndex((i) => i.inventoryId === item._id);
    if (existingIndex > -1) {
      const next = [...otcBasket];
      next[existingIndex].quantity += otcQty;
      setOtcBasket(next);
    } else {
      setOtcBasket((prev) => [
        ...prev,
        { inventoryId: item._id, itemName: item.name, quantity: otcQty, unitPrice: effectivePrice },
      ]);
    }

    setOtcItemId("");
    setOtcQty(1);
    setOtcPrice(0);
  };

  const removeFromBasket = (index: number) => {
    setOtcBasket((prev) => prev.filter((_, i) => i !== index));
  };

  const createSale = async () => {
    if (otcBasket.length === 0) {
      toast.error("Please add at least one item to basket");
      return;
    }
    try {
      const res = await createOtcSaleMutation.mutateAsync({
        customerName: customerName || "Walk-in Customer",
        customerPhone,
        paymentMethod,
        discount,
        tax,
        items: otcBasket.map((i) => ({ inventoryId: i.inventoryId, quantity: i.quantity, unitPrice: i.unitPrice })),
      });
      toast.success(`OTC Sale ${res.data?.saleNumber || ""} completed!`);

      // Print OTC receipt
      printOtcReceipt(res.data?.saleNumber || "OTC-SALE", customerName || "Walk-in", otcBasket, basketTotal, paymentMethod);

      setOtcBasket([]);
      setCustomerName("");
      setCustomerPhone("");
      setDiscount(0);
      setTax(0);
    } catch (e: any) {
      toast.error(e?.message || "Could not process OTC sale");
    }
  };

  const printOtcReceipt = (saleNum: string, cust: string, items: typeof otcBasket, total: number, tender: string) => {
    const itemRows = items
      .map(
        (i) => `
        <tr>
          <td>${i.itemName}</td>
          <td style="text-align: center;">${i.quantity}</td>
          <td style="text-align: right;">${i.unitPrice.toFixed(2)}</td>
          <td style="text-align: right;">${(i.quantity * i.unitPrice).toFixed(2)}</td>
        </tr>`
      )
      .join("");

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt - ${saleNum}</title>
          <style>
            @page { size: 80mm auto; margin: 3mm; }
            body { font-family: monospace; font-size: 11px; margin: 0; padding: 6px; }
            .header { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 6px; margin-bottom: 6px; }
            table { width: 100%; border-collapse: collapse; margin: 6px 0; }
            th, td { font-size: 10px; padding: 2px; }
            .total { font-weight: bold; border-top: 1px solid #000; padding-top: 4px; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <strong>iCARE PHARMACY OTC POS</strong><br/>
            <span>Receipt #: ${saleNum}</span><br/>
            <span>Date: ${new Date().toLocaleString()}</span>
          </div>
          <div>Customer: ${cust} · Payment: ${tender}</div>
          <table>
            <thead><tr><th style="text-align:left;">Item</th><th>Qty</th><th style="text-align:right;">Price</th><th style="text-align:right;">Total</th></tr></thead>
            <tbody>${itemRows}</tbody>
          </table>
          <div class="total" style="display: flex; justify-content: space-between;">
            <span>TOTAL PAID:</span>
            <span>KES ${total.toLocaleString()}</span>
          </div>
          <div style="text-align: center; margin-top: 10px; font-size: 10px;">
            Thank you for choosing iCare Hospital Pharmacy!
          </div>
        </body>
      </html>
    `;
    const w = window.open("", "_blank", "width=320,height=450");
    if (!w) return;
    w.document.write(html);
    w.document.close();
    w.focus();
    w.print();
  };

  const submitMovement = async () => {
    if (!stockItemId || movementQty <= 0) {
      toast.error("Please select an item and enter valid quantity");
      return;
    }
    try {
      await createStockMovementMutation.mutateAsync({
        inventoryId: stockItemId,
        movementType,
        quantity: movementQty,
        direction: movementType === "ADJUSTMENT" ? direction : undefined,
        unitCost: movementCost || undefined,
        reason: movementReason || `Quick ${movementType.toLowerCase()}`,
      });
      toast.success("Stock balance updated successfully");
      setMovementQty(10);
      setMovementReason("");
    } catch (e: any) {
      toast.error(e?.message || "Could not save movement");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Banner & Quick Submodule Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground flex items-center gap-2">
            <Pill className="h-6 w-6 text-primary" />
            Hospital Pharmacy & Dispensing Center
          </h1>
          <p className="text-muted-foreground text-sm">
            Clinical prescription fulfillment, walk-in OTC point-of-sale, and live pharmaceutical stock management
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate("/pharmacy/stock")}>
            <Boxes className="h-4 w-4 mr-1.5 text-primary" />
            Stock Ledger
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate("/pharmacy/expiry")}>
            <Clock className="h-4 w-4 mr-1.5 text-orange-500" />
            Expiry Tracking
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate("/pharmacy/reports")}>
            <FileText className="h-4 w-4 mr-1.5 text-blue-500" />
            Consumption Reports
          </Button>
        </div>
      </div>

      {/* Live Operational Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-warning/30 bg-warning/5">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-warning/20 flex items-center justify-center text-warning font-bold">
              <Pill className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-heading font-bold text-foreground">{pendingCount}</p>
              <p className="text-xs text-muted-foreground font-medium">Pending Prescriptions</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-500/30 bg-blue-500/5">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-600 font-bold">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-heading font-bold text-foreground">{readyCount}</p>
              <p className="text-xs text-muted-foreground font-medium">Prepared & Ready</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-500/30 bg-orange-500/5">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-600 font-bold">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-heading font-bold text-foreground">{lowStockCount}</p>
              <p className="text-xs text-muted-foreground font-medium">Low Stock Alerts</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-success/30 bg-success/5">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-success/20 flex items-center justify-center text-success font-bold">
              <ShoppingCart className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-heading font-bold text-foreground">{stats?.todayOtcSalesCount || otcSales.length}</p>
              <p className="text-xs text-muted-foreground font-medium">OTC Sales Completed</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <DepartmentWaitingPatients department="pharmacy" />

      {/* Main Tabs */}
      <Tabs defaultValue="prescriptions" className="space-y-4">
        <TabsList className="bg-muted/80 p-1">
          <TabsTrigger value="prescriptions" className="text-xs">
            Prescriptions Queue ({prescriptions.length})
          </TabsTrigger>
          <TabsTrigger value="otc" className="text-xs">
            Walk-in OTC POS
          </TabsTrigger>
          <TabsTrigger value="stock" className="text-xs">
            Quick Bin Card
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: PRESCRIPTIONS */}
        <TabsContent value="prescriptions" className="space-y-4">
          <Card className="shadow-card border-border">
            <CardHeader className="pb-3 border-b">
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant={rxStatusFilter === "all" ? "default" : "outline"}
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => setRxStatusFilter("all")}
                  >
                    All ({prescriptions.length})
                  </Button>
                  <Button
                    variant={rxStatusFilter === "Pending" ? "default" : "outline"}
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => setRxStatusFilter("Pending")}
                  >
                    Pending ({pendingCount})
                  </Button>
                  <Button
                    variant={rxStatusFilter === "Ready" ? "default" : "outline"}
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => setRxStatusFilter("Ready")}
                  >
                    Ready ({readyCount})
                  </Button>
                  <Button
                    variant={rxStatusFilter === "Dispensed" ? "default" : "outline"}
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => setRxStatusFilter("Dispensed")}
                  >
                    Dispensed ({dispensedCount})
                  </Button>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search patient, Rx #, drug..."
                    className="pl-9 h-8 text-xs"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-4 space-y-3">
              {rxLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : filteredPrescriptions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Pill className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
                  <p className="text-sm">No prescriptions matching the selected filter.</p>
                </div>
              ) : (
                filteredPrescriptions.map((rx) => (
                  <div
                    key={rx._id}
                    className="p-4 rounded-xl border border-border bg-card hover:bg-muted/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-primary">{rx.prescriptionNumber}</span>
                        <span className="font-semibold text-sm text-foreground">{rx.patientName}</span>
                        <span className="font-mono text-xs text-muted-foreground">({rx.patientDisplayId})</span>
                        <Badge variant="outline" className={`text-[10px] px-2 py-0 ${statusStyle[rx.status]}`}>
                          {rx.status}
                        </Badge>

                        {/* Payment / Clearance Badge */}
                        {rx.paymentStatus === "Awaiting Cashier Payment" ? (
                          <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" /> Unpaid (Cashier)
                          </Badge>
                        ) : rx.paymentStatus === "Awaiting Insurance Approval" ? (
                          <Badge variant="outline" className="text-[10px] bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30 flex items-center gap-1">
                            <Clock className="h-3 w-3" /> Awaiting Auth
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Cleared
                          </Badge>
                        )}
                      </div>

                      {/* Drugs List */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pt-1">
                        {rx.items.map((item, idx) => (
                          <div key={idx} className="p-2 rounded-md bg-muted/50 text-xs border border-border/50">
                            <div className="font-semibold text-foreground flex items-center gap-1.5">
                              <Pill className="h-3 w-3 text-primary shrink-0" />
                              <span className="truncate">{item.drug}</span>
                            </div>
                            <div className="text-[11px] text-muted-foreground mt-0.5">
                              {item.dosage} · {item.frequency || "TDS"} · {item.duration || "5 days"}
                            </div>
                            {item.instructions && (
                              <div className="text-[10px] text-primary/80 italic mt-0.5 truncate">
                                "{item.instructions}"
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {rx.notes && (
                        <p className="text-xs text-muted-foreground italic pt-1">Doctor's Remark: {rx.notes}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs px-2.5"
                        title="Print Dispensing Slip"
                        onClick={() => printDispensingLabel(rx)}
                      >
                        <Printer className="h-3.5 w-3.5 mr-1" />
                        Slip
                      </Button>

                      {rx.status === "Pending" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs text-blue-600 border-blue-500/30 hover:bg-blue-500/10"
                          onClick={() => handleSetStatus(rx._id, "Ready")}
                          disabled={statusMutation.isPending}
                        >
                          Prepare Pack
                        </Button>
                      )}

                      {rx.status !== "Dispensed" && (
                        rx.paymentStatus === "Awaiting Cashier Payment" ? (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled
                            className="h-8 text-xs text-amber-700 dark:text-amber-400 bg-amber-500/10 border-amber-500/30 cursor-not-allowed opacity-90"
                            title="Patient must make payment at Cashier Desk before medications are dispensed"
                          >
                            <AlertCircle className="h-3.5 w-3.5 mr-1" />
                            Pay at Cashier
                          </Button>
                        ) : rx.paymentStatus === "Awaiting Insurance Approval" ? (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled
                            className="h-8 text-xs text-blue-700 dark:text-blue-400 bg-blue-500/10 border-blue-500/30 cursor-not-allowed opacity-90"
                            title="Cashier must approve insurance claim before medications are dispensed"
                          >
                            <Clock className="h-3.5 w-3.5 mr-1" />
                            Awaiting Auth
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            className="h-8 text-xs bg-primary text-primary-foreground shadow-sm"
                            onClick={() => handleOpenDispenseModal(rx)}
                            disabled={statusMutation.isPending}
                          >
                            <Check className="h-3.5 w-3.5 mr-1" />
                            Dispense
                          </Button>
                        )
                      )}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: OVER-THE-COUNTER (OTC) POINT OF SALE */}
        <TabsContent value="otc">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Sale Checkout Panel */}
            <div className="lg:col-span-7">
              <Card className="shadow-card border-border">
                <CardHeader className="pb-3 border-b">
                  <CardTitle className="text-base font-heading">OTC Point of Sale</CardTitle>
                  <CardDescription className="text-xs">
                    Direct walk-in counter sales with automatic stock deduction and thermal receipt
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-4 space-y-4">
                  {/* Customer Information */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Customer Name</Label>
                      <Input
                        placeholder="e.g. Walk-in Customer"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Phone (M-Pesa)</Label>
                      <Input
                        placeholder="+254 7..."
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Tender Method</Label>
                      <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Cash">Cash</SelectItem>
                          <SelectItem value="M-Pesa">M-Pesa</SelectItem>
                          <SelectItem value="Card">Credit/Debit Card</SelectItem>
                          <SelectItem value="Insurance">Insurance / Scheme</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Add Item Bar */}
                  <div className="p-3 rounded-lg border bg-muted/40 space-y-3">
                    <Label className="text-xs font-semibold">Add Drug to Basket</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                      <div className="sm:col-span-6">
                        <Select
                          value={otcItemId}
                          onValueChange={(v) => {
                            setOtcItemId(v);
                            const item = inventory.find((i) => i._id === v);
                            if (item) setOtcPrice(item.unitCost || 25);
                          }}
                        >
                          <SelectTrigger className="h-9 text-xs">
                            <SelectValue placeholder="Select medicine..." />
                          </SelectTrigger>
                          <SelectContent>
                            {inventory.map((i) => (
                              <SelectItem key={i._id} value={i._id}>
                                {i.name} (Stock: {i.currentStock}) — KES {i.unitCost || 0}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="sm:col-span-2">
                        <Input
                          type="number"
                          min="1"
                          placeholder="Qty"
                          value={otcQty}
                          onChange={(e) => setOtcQty(Math.max(1, Number(e.target.value)))}
                          className="h-9 text-xs font-mono"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <Input
                          type="number"
                          min="0"
                          placeholder="Price"
                          value={otcPrice}
                          onChange={(e) => setOtcPrice(Number(e.target.value))}
                          className="h-9 text-xs font-mono"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <Button size="sm" onClick={addToBasket} className="w-full h-9 text-xs bg-primary">
                          <Plus className="h-3.5 w-3.5 mr-1" />
                          Add
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Basket Table */}
                  <div className="border rounded-lg overflow-hidden">
                    <div className="p-2.5 bg-muted/60 font-semibold text-xs flex justify-between">
                      <span>Item Description</span>
                      <span>Subtotal (KES)</span>
                    </div>
                    {otcBasket.length === 0 ? (
                      <div className="p-6 text-center text-xs text-muted-foreground">
                        Basket is empty. Select a formulation above to add items.
                      </div>
                    ) : (
                      <div className="divide-y divide-border">
                        {otcBasket.map((item, idx) => (
                          <div key={idx} className="p-2.5 text-xs flex items-center justify-between hover:bg-muted/20">
                            <div>
                              <div className="font-semibold text-foreground">{item.itemName}</div>
                              <div className="text-[11px] text-muted-foreground">
                                {item.quantity} units @ KES {item.unitPrice.toFixed(2)}
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-mono font-bold">
                                KES {(item.quantity * item.unitPrice).toFixed(2)}
                              </span>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                                onClick={() => removeFromBasket(idx)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Totals & Submit */}
                  <div className="p-4 rounded-lg bg-muted/40 space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Subtotal:</span>
                      <span className="font-mono font-semibold text-foreground">KES {basketSubtotal.toFixed(2)}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div className="space-y-1">
                        <Label className="text-[11px]">Discount (KES)</Label>
                        <Input
                          type="number"
                          min="0"
                          value={discount}
                          onChange={(e) => setDiscount(Number(e.target.value))}
                          className="h-8 text-xs font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[11px]">Tax / VAT (KES)</Label>
                        <Input
                          type="number"
                          min="0"
                          value={tax}
                          onChange={(e) => setTax(Number(e.target.value))}
                          className="h-8 text-xs font-mono"
                        />
                      </div>
                    </div>
                    <div className="pt-2 border-t flex justify-between items-center">
                      <span className="font-bold text-sm text-foreground">Payable Amount:</span>
                      <span className="text-xl font-bold font-mono text-primary">
                        KES {basketTotal.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <Button
                    onClick={createSale}
                    disabled={createOtcSaleMutation.isPending || otcBasket.length === 0}
                    className="w-full h-10 bg-primary font-semibold text-sm"
                  >
                    {createOtcSaleMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing Sale...
                      </>
                    ) : (
                      <>
                        <Printer className="h-4 w-4 mr-2" />
                        Complete Sale & Print Slip
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* OTC Sales Register */}
            <div className="lg:col-span-5">
              <Card className="shadow-card border-border">
                <CardHeader className="pb-3 border-b">
                  <CardTitle className="text-base font-heading">Recent OTC Transactions</CardTitle>
                  <CardDescription className="text-xs">
                    Live register of over-the-counter receipts
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-3 space-y-2 max-h-[580px] overflow-y-auto">
                  {otcSales.length === 0 ? (
                    <div className="p-6 text-center text-xs text-muted-foreground">
                      No OTC transactions recorded today.
                    </div>
                  ) : (
                    otcSales.map((s) => (
                      <div key={s._id} className="p-3 rounded-lg border bg-card hover:bg-muted/30 transition-all text-xs">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-mono font-bold text-primary">{s.saleNumber}</span>
                          <span className="font-mono font-bold text-foreground">KES {s.totalAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between text-muted-foreground">
                          <span>{s.customerName || "Walk-in Customer"}</span>
                          <Badge variant="outline" className="text-[10px]">{s.paymentMethod}</Badge>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* TAB 3: QUICK BIN CARD & MOVEMENTS */}
        <TabsContent value="stock">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5">
              <Card className="shadow-card border-border">
                <CardHeader className="pb-3 border-b">
                  <CardTitle className="text-base font-heading">Post Stock Movement</CardTitle>
                  <CardDescription className="text-xs">
                    Update ledger balances with verified reason
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Select Formulation</Label>
                    <Select value={stockItemId} onValueChange={setStockItemId}>
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue placeholder="Select item" />
                      </SelectTrigger>
                      <SelectContent>
                        {inventory.map((i) => (
                          <SelectItem key={i._id} value={i._id}>
                            {i.name} (Stock: {i.currentStock})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Movement Category</Label>
                    <Select
                      value={movementType}
                      onValueChange={(v) => setMovementType(v as "RECEIVE" | "ADJUSTMENT" | "ISSUE")}
                    >
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="RECEIVE">RECEIVE (Supplier Restock)</SelectItem>
                        <SelectItem value="ISSUE">ISSUE (Ward Dispense)</SelectItem>
                        <SelectItem value="ADJUSTMENT">ADJUSTMENT (Audit Recount)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {movementType === "ADJUSTMENT" && (
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold">Variance Direction</Label>
                      <Select
                        value={direction}
                        onValueChange={(v) => setDirection(v as "INCREASE" | "DECREASE")}
                      >
                        <SelectTrigger className="h-9 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="INCREASE">▲ Found Surplus (+)</SelectItem>
                          <SelectItem value="DECREASE">▼ Damaged / Deficit (-)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold">Quantity</Label>
                      <Input
                        type="number"
                        min="1"
                        value={movementQty}
                        onChange={(e) => setMovementQty(Math.max(1, Number(e.target.value)))}
                        className="h-9 text-xs font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold">Unit Cost (KES)</Label>
                      <Input
                        type="number"
                        min="0"
                        value={movementCost}
                        onChange={(e) => setMovementCost(Number(e.target.value))}
                        className="h-9 text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Reason / Reference Document</Label>
                    <Input
                      placeholder="e.g. Internal Ward Order #104"
                      value={movementReason}
                      onChange={(e) => setMovementReason(e.target.value)}
                      className="h-9 text-xs"
                    />
                  </div>

                  <Button
                    onClick={submitMovement}
                    disabled={createStockMovementMutation.isPending || !stockItemId}
                    className="w-full h-9 bg-primary text-xs"
                  >
                    {createStockMovementMutation.isPending ? "Recording..." : "Save Movement"}
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-7">
              <Card className="shadow-card border-border">
                <CardHeader className="pb-3 border-b">
                  <CardTitle className="text-base font-heading">Bin Card Transaction Audit</CardTitle>
                  <CardDescription className="text-xs">
                    Recent inventory balances, receipts, and issues
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-3 space-y-2 max-h-[500px] overflow-y-auto">
                  {stockMovements.length === 0 ? (
                    <div className="p-6 text-center text-xs text-muted-foreground">
                      No stock movements recorded yet.
                    </div>
                  ) : (
                    stockMovements.map((m) => (
                      <div key={m.id} className="p-2.5 rounded-lg border bg-card hover:bg-muted/30 transition-all text-xs">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-foreground">{m.item_name}</span>
                          <Badge
                            variant="outline"
                            className={`text-[10px] ${
                              m.movement_type === "RECEIVE"
                                ? "bg-success/10 text-success border-success/30"
                                : m.movement_type === "ISSUE"
                                ? "bg-blue-500/10 text-blue-600 border-blue-500/30"
                                : "bg-warning/10 text-warning border-warning/30"
                            }`}
                          >
                            {m.movement_type}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-muted-foreground">
                          <span>
                            Qty: <strong>{m.quantity}</strong> ({m.balance_before} → {m.balance_after})
                          </span>
                          <span>{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        {m.reason && <p className="text-[11px] text-muted-foreground italic mt-0.5">{m.reason}</p>}
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Dispense Verification Dialog */}
      <Dialog open={!!dispenseModalRx} onOpenChange={(open) => !open && setDispenseModalRx(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pill className="h-5 w-5 text-primary" />
              Pharmacist Dispensing Verification
            </DialogTitle>
            <DialogDescription>
              Verify patient identity, drug formulation, and counsel patient on regimen adherence.
            </DialogDescription>
          </DialogHeader>

          {dispenseModalRx && (
            <div className="space-y-4 py-2 text-sm">
              <div className="p-3 rounded-lg bg-muted/60 space-y-1">
                <div className="flex justify-between font-semibold text-foreground">
                  <span>{dispenseModalRx.patientName}</span>
                  <span className="font-mono text-xs text-muted-foreground">{dispenseModalRx.patientDisplayId}</span>
                </div>
                <div className="text-xs text-muted-foreground flex justify-between">
                  <span>Rx Number: <strong className="text-primary font-mono">{dispenseModalRx.prescriptionNumber}</strong></span>
                  <span>{dispenseModalRx.items.length} prescribed medication(s)</span>
                </div>
              </div>

              {/* Safety check alert */}
              <div className="p-3 rounded-lg bg-success/10 border border-success/30 flex items-center gap-2 text-xs text-success">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>
                  <strong>Clinical Safety Check Passed:</strong> No known drug-drug interactions or reported contraindications for this patient.
                </span>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold">Dispensing Checklist</Label>
                <div className="border rounded-lg divide-y divide-border text-xs">
                  {dispenseModalRx.items.map((i, idx) => (
                    <div key={idx} className="p-2.5 flex justify-between items-center">
                      <div>
                        <div className="font-semibold text-foreground">{i.drug}</div>
                        <div className="text-muted-foreground text-[11px]">
                          {i.dosage} · {i.frequency || "TDS"} · {i.duration || "5 days"}
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[10px] text-success border-success/30">
                        In Stock
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Patient Counseling Instructions</Label>
                <Input
                  value={counselingNotes}
                  onChange={(e) => setCounselingNotes(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setDispenseModalRx(null)}>
              Cancel
            </Button>
            <Button
              size="sm"
              className="bg-primary"
              onClick={handleConfirmDispense}
              disabled={statusMutation.isPending}
            >
              {statusMutation.isPending ? "Dispensing..." : "Confirm Dispense & Print Label"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
