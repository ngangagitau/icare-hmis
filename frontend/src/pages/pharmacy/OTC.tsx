import { useState, useMemo, Fragment } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  Plus,
  ShoppingBag,
  Search,
  CalendarDays,
  Filter,
  Eye,
  Receipt,
  ShoppingCart,
  CreditCard,
  User,
  Trash2,
  Calendar as CalendarIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useInventoryLite, useOtcSales, useCreateOtcSale } from "@/hooks/usePharmacyOps";
import type { OtcSale } from "@/lib/pharmacyOpsService";

// ── helpers ──────────────────────────────────────────────────────────────────

function formatKES(v: number) {
  return `KES ${v.toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const todayStr = () => new Date().toISOString().split("T")[0];

const PAYMENT_METHODS = ["Cash", "Card", "Mobile Money", "Insurance"] as const;

// ── skeleton ─────────────────────────────────────────────────────────────────

function LoadingStatCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {[0, 1, 2].map((i) => (
        <Card key={i}>
          <CardContent className="pt-6 flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-lg flex-shrink-0" />
            <div className="space-y-2">
              <Skeleton className="h-7 w-16" />
              <Skeleton className="h-3 w-28" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function LoadingTable({ rows = 6 }: { rows?: number }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {["Sale ID", "Date", "Customer", "Items", "Total", "Payment", "Actions"].map((h) => (
            <TableHead key={h}>
              <Skeleton className="h-4 w-full" />
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: rows }).map((_, i) => (
          <TableRow key={i}>
            {Array.from({ length: 7 }).map((_, j) => (
              <TableCell key={j}>
                <Skeleton className="h-4 w-full" />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

// ── component ────────────────────────────────────────────────────────────────

export default function OTCSales() {
  const { data: inventory = [], isLoading: invLoading } = useInventoryLite();
  const { data: allSales = [], isLoading: salesLoading } = useOtcSales();
  const createSaleMutation = useCreateOtcSale();

  // ── basket ─────────────────────────────────────────────────────────────────
  const [basket, setBasket] = useState<
    Array<{
      id: string;
      inventoryId: string;
      itemName: string;
      quantity: number;
      unitPrice: number;
    }>
  >([]);
  const [basketItemId, setBasketItemId] = useState("");
  const [basketQty, setBasketQty] = useState(1);
  const [basketUnitPrice, setBasketUnitPrice] = useState(0);

  const addToBasket = () => {
    if (!basketItemId || basketQty < 1) {
      toast.error("Validation error", { description: "Select an item and set quantity ≥ 1." });
      return;
    }
    const item = inventory.find((i) => i._id === basketItemId);
    if (!item) return;
    const already = basket.findIndex((b) => b.inventoryId === basketItemId);
    if (already >= 0) {
      setBasket((prev) => prev.map((b, i) => (i === already ? { ...b, quantity: b.quantity + basketQty } : b)));
    } else {
      setBasket((prev) => [
        ...prev,
        { id: basketItemId, inventoryId: basketItemId, itemName: item.name, quantity: basketQty, unitPrice: basketUnitPrice || item.unitCost },
      ]);
    }
    setBasketItemId("");
    setBasketQty(1);
    setBasketUnitPrice(0);
  };

  const removeFromBasket = (idx: number) => setBasket((prev) => prev.filter((_, i) => i !== idx));

  const clearBasket = () => setBasket([]);

  const basketSubtotal = useMemo(
    () => basket.reduce((s, li) => s + li.quantity * li.unitPrice, 0),
    [basket]
  );

  // ── dialogs ────────────────────────────────────────────────────────────────
  const [newSaleOpen, setNewSaleOpen] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [activeSale, setActiveSale] = useState<OtcSale | null>(null);

  // ── filters ────────────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");

  // ── customer / sale fields ─────────────────────────────────────────────────
  const [customerName, setCustomerName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);

  const basketTotal = basketSubtotal - discount + tax;

  // ── derived: filtered sales list ───────────────────────────────────────────
  const filteredSales = useMemo(() => {
    let list = [...allSales];
    if (paymentFilter) list = list.filter((s) => s.paymentMethod === paymentFilter);
    if (fromDate) list = list.filter((s) => s.saleDate >= `${fromDate}T00:00:00`);
    if (toDate) list = list.filter((s) => s.saleDate <= `${toDate}T23:59:59`);
    if (search)
      list = list.filter(
        (s) =>
          s.saleNumber.toLowerCase().includes(search.toLowerCase()) ||
          (s.customerName ?? "").toLowerCase().includes(search.toLowerCase())
      );
    return list;
  }, [allSales, search, fromDate, toDate, paymentFilter]);

  // ── derived: KPI ───────────────────────────────────────────────────────────
  const todayStr2 = todayStr();
  const todaySales = useMemo(() => allSales.filter((s) => s.saleDate.startsWith(todayStr2)), [allSales, todayStr2]);
  const todayRevenue = useMemo(() => todaySales.reduce((s, x) => s + x.totalAmount, 0), [todaySales]);
  const todayItems = useMemo(() => todaySales.reduce((s, x) => s + x.items.length, 0), [todaySales]);

  // ── create sale ────────────────────────────────────────────────────────────
  const handleCreateSale = async () => {
    if (basket.length === 0) {
      toast.error("Empty basket", { description: "Add at least one item before completing the sale." });
      return;
    }
    if (!customerName.trim()) {
      toast.error("Missing customer", { description: "Enter the customer name." });
      return;
    }
    try {
      const result = await createSaleMutation.mutateAsync({
        customerName: customerName.trim(),
        paymentMethod,
        discount,
        tax,
        items: basket.map((li) => ({ inventoryId: li.inventoryId, quantity: li.quantity, unitPrice: li.unitPrice })),
      });
      toast.success("Sale completed", { description: `Receipt #${result.saleNumber} issued. Stock updated automatically.` });
      clearBasket();
      setCustomerName("");
      setPaymentMethod("Cash");
      setDiscount(0);
      setTax(0);
      setNewSaleOpen(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred. Please try again.";
      toast.error("Sale failed", { description: message });
    }
  };

  // ── open receipt ───────────────────────────────────────────────────────────
  const openReceipt = (sale: OtcSale) => {
    setActiveSale(sale);
    setReceiptOpen(true);
  };

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 animate-fade-in">
        {/* ── header ──────────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">OTC Sales</h1>
            <p className="text-muted-foreground text-sm">Process over-the-counter pharmacy sales and view transaction history</p>
          </div>
          <Dialog open={newSaleOpen} onOpenChange={setNewSaleOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                        <Plus className="h-4 w-4" strokeWidth={1.75} />
                New Sale
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-primary" strokeWidth={1.75} />
                  New OTC Sale
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                {/* customer fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="flex items-center gap-1.5 text-xs">
                      <User className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.75} />
                      Customer name *
                    </Label>
                    <Input
                      placeholder="Walk-in customer or name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="flex items-center gap-1.5 text-xs">
                      <CreditCard className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.75} />
                      Payment method *
                    </Label>
                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        {PAYMENT_METHODS.map((m) => (
                          <SelectItem key={m} value={m}>
                            {m}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* add-item row */}
                <div className="rounded-lg border border-border bg-muted/30 px-3 py-3 space-y-3">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Add line item</p>
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-end">
                    <div className="sm:col-span-6 space-y-1.5">
                      <Label className="text-xs">Item</Label>
                      <Select
                        value={basketItemId}
                        onValueChange={(v) => {
                          setBasketItemId(v);
                          const item = inventory.find((i) => i._id === v);
                          if (item) setBasketUnitPrice(item.unitCost);
                        }}
                        disabled={invLoading}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder={invLoading ? "Loading…" : "Select item"} />
                        </SelectTrigger>
                        <SelectContent>
                          {inventory
                            .filter((i) => i.currentStock > 0)
                            .map((i) => (
                              <SelectItem key={i._id} value={i._id}>
                                {i.name}
                                <span className="ml-1.5 text-muted-foreground">({i.currentStock} in stock)</span>
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="sm:col-span-2 space-y-1.5">
                      <Label className="text-xs">Qty</Label>
                      <Input
                        type="number"
                        min={1}
                        value={basketQty}
                        onChange={(e) => setBasketQty(Math.max(1, Number(e.target.value)))}
                        className="h-9"
                      />
                    </div>
                    <div className="sm:col-span-2 space-y-1.5">
                      <Label className="text-xs">Unit price (KES)</Label>
                      <Input
                        type="number"
                        min={0}
                        step={0.01}
                        value={basketUnitPrice}
                        onChange={(e) => setBasketUnitPrice(Number(e.target.value))}
                        className="h-9"
                        placeholder="0.00"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Button variant="secondary" className="w-full h-9 gap-1.5" onClick={addToBasket}>
                        <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
                        Add
                      </Button>
                    </div>
                  </div>
                </div>

                {/* basket */}
                {basket.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Basket — {basket.length} line{basket.length !== 1 ? "s" : ""}
                    </p>
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/60">
                            <TableHead className="text-xs h-8">Item</TableHead>
                            <TableHead className="text-xs h-8 text-center w-16">Qty</TableHead>
                            <TableHead className="text-xs h-8 text-right w-28">Unit price</TableHead>
                            <TableHead className="text-xs h-8 text-right w-28">Line total</TableHead>
                            <TableHead className="w-10" />
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {basket.map((li, idx) => (
                            <TableRow key={`${li.inventoryId}-${idx}`} className="group">
                              <TableCell className="text-sm font-medium py-2">{li.itemName}</TableCell>
                              <TableCell className="text-center text-sm py-2">{li.quantity}</TableCell>
                              <TableCell className="text-sm text-right py-2">{formatKES(li.unitPrice)}</TableCell>
                              <TableCell className="text-sm text-right font-medium py-2">{formatKES(li.quantity * li.unitPrice)}</TableCell>
                              <TableCell className="py-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-muted-foreground hover:text-destructive group-hover:text-destructive/70 transition-colors"
                                  onClick={() => removeFromBasket(idx)}
                                >
                                  <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}

                {/* discount / tax / total */}
                {basket.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Discount (KES)</Label>
                      <Input
                        type="number"
                        min={0}
                        value={discount}
                        onChange={(e) => setDiscount(Math.max(0, Number(e.target.value)))}
                        className="h-9"
                        placeholder="0.00"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Tax (KES)</Label>
                      <Input
                        type="number"
                        min={0}
                        value={tax}
                        onChange={(e) => setTax(Number(e.target.value))}
                        className="h-9"
                        placeholder="0.00"
                      />
                    </div>
                    <div className="flex items-center justify-between rounded-lg border border-primary/30 bg-primary/5 px-4 py-2.5">
                      <span className="text-sm font-medium">Total</span>
                      <span className="text-lg font-bold text-primary">{formatKES(basketTotal)}</span>
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter className="gap-2 mt-2">
                <Button variant="outline" onClick={() => setNewSaleOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateSale}
                  disabled={createSaleMutation.isPending || basket.length === 0}
                  className="gap-2"
                >
                  {createSaleMutation.isPending ? (
                    <>
                      <span className="h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Processing…
                    </>
                  ) : (
                    <>
                      <Receipt className="h-4 w-4" strokeWidth={1.75} />
                      Create Sale — {formatKES(basketTotal || 0)}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* ── KPI stat cards ────────────────────────────────────────────────────── */}
        {salesLoading ? (
          <LoadingStatCards />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="group shadow-card border-border hover:shadow-lg transition-shadow">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:text-primary transition-colors">
                  <ShoppingBag className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <div>
                  <p className="text-2xl font-heading font-bold tracking-tight">{todaySales.length}</p>
                  <p className="text-xs text-muted-foreground">Today's Sales</p>
                </div>
              </CardContent>
            </Card>

            <Card className="group shadow-card border-border hover:shadow-lg transition-shadow">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center text-success group-hover:text-success transition-colors">
                  <CreditCard className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <div>
                  <p className="text-2xl font-heading font-bold tracking-tight">{formatKES(todayRevenue)}</p>
                  <p className="text-xs text-muted-foreground">Revenue</p>
                </div>
              </CardContent>
            </Card>

            <Card className="group shadow-card border-border hover:shadow-lg transition-shadow">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center text-warning group-hover:text-warning transition-colors">
                  <Receipt className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <div>
                  <p className="text-2xl font-heading font-bold tracking-tight">{todayItems}</p>
                  <p className="text-xs text-muted-foreground">Items Sold</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ── filter bar ───────────────────────────────────────────────────────── */}
        <Card className="shadow-card border-border">
          <CardContent className="pt-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by receipt # or customer name…"
                  className="pl-9 h-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="h-9 w-auto" placeholder="From" />
              <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="h-9 w-auto" placeholder="To" />

              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger className="h-9 w-auto min-w-[160px]">
                  <SelectValue placeholder="All payment methods" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All methods</SelectItem>
                  {PAYMENT_METHODS.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* ── sales table ───────────────────────────────────────────────────────── */}
        <Card className="shadow-card border-border overflow-hidden">
          <CardHeader>
            <CardTitle className="text-base">OTC Sales</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {salesLoading ? (
              <div className="px-4 pt-4">
                <LoadingTable />
              </div>
            ) : filteredSales.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center mb-4">
                  <ShoppingBag className="h-7 w-7 text-muted-foreground" strokeWidth={1.75} />
                </div>
                <p className="text-base font-medium text-foreground">No OTC sales found</p>
                <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                  {search || fromDate || toDate || paymentFilter
                    ? "Try adjusting the filters above."
                    : "Complete your first sale to see it listed here."}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-muted/60">
                  <TableRow>
                    <TableHead className="text-xs font-semibold uppercase tracking-wide h-10">Receipt #</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wide h-10">Date &amp; Time</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wide h-10">Customer</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wide h-10">Items</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wide h-10 text-right">Total (KES)</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wide h-10">Payment</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wide h-10 w-24" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSales.map((s) => {
                    const dateObj = new Date(s.saleDate);
                    const dateStr = dateObj.toLocaleDateString("en-KE", { day: "2-digit", month: "short", year: "numeric" });
                    const timeStr = dateObj.toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" });
                    return (
                      <TableRow key={s._id} className="group hover:bg-accent/40 transition-colors">
                        <TableCell className="font-mono text-xs font-semibold tracking-tight py-3">{s.saleNumber}</TableCell>
                        <TableCell className="text-sm py-3">
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <CalendarIcon className="h-3.5 w-3.5" strokeWidth={1.75} />
                            <span>
                              {dateStr} · {timeStr}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm font-medium py-3">
                          {s.customerName ?? <span className="text-muted-foreground italic">Walk-in</span>}
                        </TableCell>
                        <TableCell className="py-3">
                          <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                            {s.items.length} item{s.items.length !== 1 ? "s" : ""}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm font-semibold text-right py-3">{formatKES(s.totalAmount)}</TableCell>
                        <TableCell className="py-3">
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[11px] font-medium",
                              s.paymentMethod === "Cash"
                                ? "bg-success/10 text-success border-success/20"
                                : s.paymentMethod === "Mobile Money"
                                ? "bg-primary/10 text-primary border-primary/20"
                                : s.paymentMethod === "Card"
                                ? "bg-warning/10 text-warning border-warning/20"
                                : "bg-muted text-muted-foreground border-border"
                            )}
                          >
                            {s.paymentMethod}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1.5 h-8 text-xs text-muted-foreground hover:text-primary"
                            onClick={() => openReceipt(s)}
                          >
                            <Eye className="h-3.5 w-3.5" strokeWidth={1.75} />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

      {/* ── receipt preview dialog ──────────────────────────────────────────────── */}
      <Dialog open={receiptOpen} onOpenChange={setReceiptOpen}>
        <DialogContent className="max-w-md sm:!max-w-[420px]">
          {activeSale && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-primary" strokeWidth={1.75} />
                  Receipt — {activeSale.saleNumber}
                </DialogTitle>
                <div className="text-xs text-muted-foreground pt-1 space-y-0.5">
                  <p>
                    {new Date(activeSale.saleDate).toLocaleString("en-KE", {
                      year: "numeric",
                      month: "long",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  <p>
                    {activeSale.customerName || "Walk-in"} customer
                    {activeSale.paymentMethod && ` · Paid via ${activeSale.paymentMethod}`}
                  </p>
                </div>
              </DialogHeader>

              <div className="border rounded-md bg-white dark:bg-black/5 px-4 py-5 text-sm font-mono select-all">
                <p className="text-center font-bold text-base mb-1">ICARE HEALTH MANAGEMENT</p>
                <p className="text-center text-xs text-muted-foreground mb-3">Over-the-Counter Pharmacy Sales</p>

                <div className="space-y-0.5 text-xs mb-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Receipt #:</span>
                    <span className="font-semibold">{activeSale.saleNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date:</span>
                    <span>{new Date(activeSale.saleDate).toLocaleDateString("en-KE", { year: "numeric", month: "short", day: "2-digit" })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Time:</span>
                    <span>{new Date(activeSale.saleDate).toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Customer:</span>
                    <span>{activeSale.customerName || "Walk-in"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment:</span>
                    <span className="font-medium">{activeSale.paymentMethod}</span>
                  </div>
                </div>

                <div className="border-t border-dashed pt-2 mb-2">
                  {activeSale.items.map((li, i) => (
                    <div key={i} className="flex justify-between text-xs">
                      <span>
                        {li.quantity} × {li.itemName}
                      </span>
                      <span>{formatKES(li.lineTotal)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-dashed pt-2 mt-2 space-y-0.5">
                  <div className="flex justify-between text-xs">
                    <span>Subtotal</span>
                    <span>{formatKES(activeSale.subtotal)}</span>
                  </div>
                  {activeSale.discount > 0 && (
                    <div className="flex justify-between text-xs text-success">
                      <span>Discount</span>
                      <span>-{formatKES(activeSale.discount)}</span>
                    </div>
                  )}
                  {activeSale.tax > 0 && (
                    <div className="flex justify-between text-xs">
                      <span>Tax</span>
                      <span>{formatKES(activeSale.tax)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-base pt-1 border-t mt-1">
                    <span>TOTAL</span>
                    <span>{formatKES(activeSale.totalAmount)}</span>
                  </div>
                </div>

                <p className="text-center text-muted-foreground text-[10px] mt-4">KRA PIN: A000000000M &nbsp;|&nbsp; Thank you for your visit!</p>
              </div>

              <DialogFooter className="gap-2 mt-1">
                <Button variant="outline" size="sm" className="gap-1.5" onClick={() => window.print()}>
                  <Receipt className="h-4 w-4" strokeWidth={1.75} />
                  Print Receipt
                </Button>
                <Button size="sm" onClick={() => setReceiptOpen(false)}>
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
