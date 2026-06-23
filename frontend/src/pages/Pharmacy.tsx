import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pill, Search, AlertTriangle, ShoppingCart, TrendingDown, Loader2 } from "lucide-react";
import { usePrescriptions, useUpdatePrescriptionStatus } from "@/hooks/usePrescriptions";
import { useToast } from "@/components/ui/use-toast";
import {
  useCreateOtcSale,
  useCreateStockMovement,
  useInventoryLite,
  useOtcSales,
  useStockMovements,
  useStockSummary,
} from "@/hooks/usePharmacyOps";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const statusStyle: Record<string, string> = {
  Ready: "bg-success/10 text-success border-success/20",
  Pending: "bg-warning/10 text-warning border-warning/20",
  Dispensed: "bg-muted text-muted-foreground",
};

const Pharmacy = () => {
  const [search, setSearch] = useState("");
  const { toast } = useToast();
  const { data: prescriptions = [], isLoading } = usePrescriptions();
  const statusMutation = useUpdatePrescriptionStatus();
  const { data: stockSummary } = useStockSummary();
  const { data: inventory = [] } = useInventoryLite();
  const { data: otcSales = [] } = useOtcSales();
  const { data: stockMovements = [] } = useStockMovements();
  const createOtcSaleMutation = useCreateOtcSale();
  const createStockMovementMutation = useCreateStockMovement();
  const [otcItemId, setOtcItemId] = useState("");
  const [otcQty, setOtcQty] = useState(1);
  const [otcPrice, setOtcPrice] = useState<number>(0);
  const [otcBasket, setOtcBasket] = useState<Array<{ inventoryId: string; itemName: string; quantity: number; unitPrice: number }>>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);
  const [stockItemId, setStockItemId] = useState("");
  const [movementType, setMovementType] = useState<"RECEIVE" | "ADJUSTMENT" | "ISSUE">("RECEIVE");
  const [direction, setDirection] = useState<"INCREASE" | "DECREASE">("INCREASE");
  const [movementQty, setMovementQty] = useState(1);
  const [movementCost, setMovementCost] = useState(0);
  const [movementReason, setMovementReason] = useState("");

  const filtered = useMemo(
    () =>
      prescriptions.filter((rx) =>
        `${rx.patientName} ${rx.patientDisplayId} ${rx.prescriptionNumber}`.toLowerCase().includes(search.toLowerCase())
      ),
    [prescriptions, search]
  );

  const pendingCount = prescriptions.filter((p) => p.status === "Pending").length;
  const lowStockCount = inventory.filter((i) => i.currentStock > 0 && i.currentStock <= i.reorderPoint).length;
  const outOfStockCount = inventory.filter((i) => i.currentStock <= 0).length;
  const basketSubtotal = otcBasket.reduce((acc, i) => acc + i.quantity * i.unitPrice, 0);
  const basketTotal = basketSubtotal - discount + tax;

  const setStatus = async (id: string, status: "Pending" | "Ready" | "Dispensed") => {
    try {
      await statusMutation.mutateAsync({ id, status });
      toast({ title: `Prescription ${status.toLowerCase()}` });
    } catch (_e) {
      toast({ title: "Update failed", description: "Could not update prescription status", variant: "destructive" });
    }
  };

  const addToBasket = () => {
    if (!otcItemId || otcQty <= 0 || otcPrice <= 0) return;
    const item = inventory.find((i) => i._id === otcItemId);
    if (!item) return;
    setOtcBasket((prev) => [...prev, { inventoryId: item._id, itemName: item.name, quantity: otcQty, unitPrice: otcPrice }]);
    setOtcItemId("");
    setOtcQty(1);
    setOtcPrice(0);
  };

  const createSale = async () => {
    if (otcBasket.length === 0) {
      toast({ title: "No items", description: "Add at least one OTC item", variant: "destructive" });
      return;
    }
    try {
      await createOtcSaleMutation.mutateAsync({
        customerName,
        customerPhone,
        paymentMethod,
        discount,
        tax,
        items: otcBasket.map((i) => ({ inventoryId: i.inventoryId, quantity: i.quantity, unitPrice: i.unitPrice })),
      });
      toast({ title: "OTC sale completed" });
      setOtcBasket([]);
      setCustomerName("");
      setCustomerPhone("");
      setDiscount(0);
      setTax(0);
    } catch (e: any) {
      toast({ title: "Sale failed", description: e?.message || "Could not create sale", variant: "destructive" });
    }
  };

  const submitMovement = async () => {
    if (!stockItemId || movementQty <= 0) return;
    try {
      await createStockMovementMutation.mutateAsync({
        inventoryId: stockItemId,
        movementType,
        quantity: movementQty,
        direction,
        unitCost: movementCost || undefined,
        reason: movementReason,
      });
      toast({ title: "Stock updated successfully" });
      setMovementQty(1);
      setMovementReason("");
    } catch (e: any) {
      toast({ title: "Stock update failed", description: e?.message || "Could not save movement", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold">Pharmacy</h1>
          <p className="text-sm text-muted-foreground mt-1">Dispense prescriptions & manage stock</p>
        </div>
        <Button variant="outline" className="gap-2"><ShoppingCart className="h-4 w-4" /> OTC Sale</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="shadow-card border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-primary">
              <Pill className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-heading font-bold">{pendingCount}</p>
              <p className="text-xs text-muted-foreground">Pending Prescriptions</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-warning">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-heading font-bold">{stockSummary?.lowStockItems ?? lowStockCount}</p>
              <p className="text-xs text-muted-foreground">Low Stock Alerts</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-destructive">
              <TrendingDown className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-heading font-bold">{stockSummary?.outOfStockItems ?? outOfStockCount}</p>
              <p className="text-xs text-muted-foreground">Near Expiry Items</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="prescriptions">
        <TabsList>
          <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
          <TabsTrigger value="otc">OTC Sales</TabsTrigger>
          <TabsTrigger value="stock">Stock Control</TabsTrigger>
        </TabsList>

        <TabsContent value="prescriptions">
          <Card className="shadow-card border-border">
            <CardContent className="pt-4 space-y-3">
              <div className="relative mb-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search patient or prescription..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              {isLoading && (
                <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
              )}
              {!isLoading && filtered.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-6">No prescriptions found</p>
              )}
              {filtered.map(rx => (
                <div key={rx._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border border-border gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium">{rx.patientName}</p>
                      <span className="text-xs text-muted-foreground">{rx.patientDisplayId}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {rx.prescriptionNumber} · {rx.items.map((i) => `${i.drug} (${i.dosage}, ${i.duration})`).join(", ")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={`text-[11px] ${statusStyle[rx.status]}`}>{rx.status}</Badge>
                    {rx.status === "Ready" && (
                      <Button size="sm" className="h-7 text-xs" onClick={() => setStatus(rx._id, "Dispensed")} disabled={statusMutation.isPending}>
                        Dispense
                      </Button>
                    )}
                    {rx.status === "Pending" && (
                      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setStatus(rx._id, "Ready")} disabled={statusMutation.isPending}>
                        Prepare
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="otc">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="shadow-card border-border">
              <CardHeader><CardTitle className="text-base">Create OTC Sale</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <Input placeholder="Customer name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
                <Input placeholder="Customer phone" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger><SelectValue placeholder="Payment method" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Card">Card</SelectItem>
                    <SelectItem value="Mobile Money">Mobile Money</SelectItem>
                    <SelectItem value="Insurance">Insurance</SelectItem>
                  </SelectContent>
                </Select>
                <div className="grid grid-cols-3 gap-2">
                  <Select value={otcItemId} onValueChange={(v) => { setOtcItemId(v); const item = inventory.find((i) => i._id === v); if (item) setOtcPrice(item.unitCost || 0); }}>
                    <SelectTrigger><SelectValue placeholder="Item" /></SelectTrigger>
                    <SelectContent>
                      {inventory.map((i) => <SelectItem key={i._id} value={i._id}>{i.name} ({i.currentStock})</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Input type="number" min={1} value={otcQty} onChange={(e) => setOtcQty(Number(e.target.value))} placeholder="Qty" />
                  <Input type="number" min={0} value={otcPrice} onChange={(e) => setOtcPrice(Number(e.target.value))} placeholder="Price" />
                </div>
                <Button variant="outline" onClick={addToBasket}>Add Item</Button>
                <div className="space-y-2">
                  {otcBasket.map((i, idx) => (
                    <div key={`${i.inventoryId}-${idx}`} className="text-sm border rounded p-2 flex justify-between">
                      <span>{i.itemName} x{i.quantity}</span><span>{(i.quantity * i.unitPrice).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input type="number" placeholder="Discount" value={discount} onChange={(e) => setDiscount(Number(e.target.value))} />
                  <Input type="number" placeholder="Tax" value={tax} onChange={(e) => setTax(Number(e.target.value))} />
                </div>
                <div className="text-sm font-medium">Total: {basketTotal.toFixed(2)}</div>
                <Button onClick={createSale} disabled={createOtcSaleMutation.isPending} className="w-full">
                  {createOtcSaleMutation.isPending ? "Processing..." : "Complete Sale"}
                </Button>
              </CardContent>
            </Card>
            <Card className="shadow-card border-border">
              <CardHeader><CardTitle className="text-base">Recent OTC Sales</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {otcSales.slice(0, 10).map((s) => (
                  <div key={s._id} className="border rounded p-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{s.saleNumber}</span>
                      <span>{s.totalAmount.toFixed(2)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{s.customerName || "Walk-in"} · {s.paymentMethod}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="stock">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="shadow-card border-border">
              <CardHeader><CardTitle className="text-base">Stock Movement</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <Select value={stockItemId} onValueChange={setStockItemId}>
                  <SelectTrigger><SelectValue placeholder="Select item" /></SelectTrigger>
                  <SelectContent>
                    {inventory.map((i) => <SelectItem key={i._id} value={i._id}>{i.name} ({i.currentStock})</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={movementType} onValueChange={(v) => setMovementType(v as "RECEIVE" | "ADJUSTMENT" | "ISSUE")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RECEIVE">Receive Stock</SelectItem>
                    <SelectItem value="ADJUSTMENT">Adjustment</SelectItem>
                    <SelectItem value="ISSUE">Issue/Write-off</SelectItem>
                  </SelectContent>
                </Select>
                {movementType === "ADJUSTMENT" && (
                  <Select value={direction} onValueChange={(v) => setDirection(v as "INCREASE" | "DECREASE")}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INCREASE">Increase</SelectItem>
                      <SelectItem value="DECREASE">Decrease</SelectItem>
                    </SelectContent>
                  </Select>
                )}
                <div className="grid grid-cols-2 gap-2">
                  <Input type="number" min={1} placeholder="Quantity" value={movementQty} onChange={(e) => setMovementQty(Number(e.target.value))} />
                  <Input type="number" min={0} placeholder="Unit cost" value={movementCost} onChange={(e) => setMovementCost(Number(e.target.value))} />
                </div>
                <Input placeholder="Reason / notes" value={movementReason} onChange={(e) => setMovementReason(e.target.value)} />
                <Button onClick={submitMovement} disabled={createStockMovementMutation.isPending}>
                  {createStockMovementMutation.isPending ? "Saving..." : "Save Movement"}
                </Button>
              </CardContent>
            </Card>
            <Card className="shadow-card border-border">
              <CardHeader><CardTitle className="text-base">Recent Stock Movements</CardTitle></CardHeader>
              <CardContent className="space-y-2 max-h-[420px] overflow-auto">
                {stockMovements.slice(0, 20).map((m) => (
                  <div key={m.id} className="border rounded p-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{m.item_name}</span>
                      <Badge variant="outline">{m.movement_type}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Qty: {m.quantity} · {m.balance_before} → {m.balance_after}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Pharmacy;
