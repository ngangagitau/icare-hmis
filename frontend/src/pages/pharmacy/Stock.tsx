import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Boxes,
  Search,
  Plus,
  ArrowUpDown,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  Loader2,
  PackagePlus,
  RefreshCw,
} from "lucide-react";
import { useCreateStockMovement, useInventoryLite, useStockSummary } from "@/hooks/usePharmacyOps";
import { toast } from "sonner";

export default function PharmacyStock() {
  const { data: inventory = [], isLoading, refetch } = useInventoryLite();
  const { data: summary } = useStockSummary();
  const createMovement = useCreateStockMovement();

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockStatusFilter, setStockStatusFilter] = useState("all");

  // Stock Adjustment Modal
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState("");
  const [movementType, setMovementType] = useState<"RECEIVE" | "ADJUSTMENT" | "ISSUE">("RECEIVE");
  const [direction, setDirection] = useState<"INCREASE" | "DECREASE">("INCREASE");
  const [quantity, setQuantity] = useState(1);
  const [unitCost, setUnitCost] = useState(0);
  const [reason, setReason] = useState("");

  const categories = useMemo(() => {
    const set = new Set<string>();
    inventory.forEach((i: any) => {
      if (i.category) set.add(i.category);
    });
    return Array.from(set);
  }, [inventory]);

  const filteredStock = useMemo(() => {
    return inventory.filter((item: any) => {
      const matchesSearch =
        (item.name || "").toLowerCase().includes(search.toLowerCase()) ||
        (item.itemId || "").toLowerCase().includes(search.toLowerCase()) ||
        (item.code || "").toLowerCase().includes(search.toLowerCase());

      const matchesCat = categoryFilter === "all" || item.category === categoryFilter;

      let matchesStatus = true;
      if (stockStatusFilter === "low") {
        matchesStatus = item.currentStock > 0 && item.currentStock <= item.reorderPoint;
      } else if (stockStatusFilter === "out") {
        matchesStatus = item.currentStock <= 0;
      } else if (stockStatusFilter === "ok") {
        matchesStatus = item.currentStock > item.reorderPoint;
      }

      return matchesSearch && matchesCat && matchesStatus;
    });
  }, [inventory, search, categoryFilter, stockStatusFilter]);

  const lowStockCount = inventory.filter((i) => i.currentStock > 0 && i.currentStock <= i.reorderPoint).length;
  const outOfStockCount = inventory.filter((i) => i.currentStock <= 0).length;
  const healthyCount = inventory.filter((i) => i.currentStock > i.reorderPoint).length;

  const handleOpenAdjust = (defaultId?: string) => {
    if (defaultId) {
      setSelectedItem(defaultId);
      const found = inventory.find((i) => i._id === defaultId);
      if (found) setUnitCost(found.unitCost || 0);
    } else {
      setSelectedItem(inventory[0]?._id || "");
      if (inventory[0]) setUnitCost(inventory[0].unitCost || 0);
    }
    setMovementType("RECEIVE");
    setDirection("INCREASE");
    setQuantity(10);
    setReason("");
    setAdjustOpen(true);
  };

  const handleSaveMovement = async () => {
    if (!selectedItem || quantity <= 0) {
      toast.error("Please enter a valid item and quantity");
      return;
    }
    try {
      await createMovement.mutateAsync({
        inventoryId: selectedItem,
        movementType,
        quantity,
        direction: movementType === "ADJUSTMENT" ? direction : undefined,
        unitCost: unitCost || undefined,
        reason: reason || `Manual pharmacy ${movementType.toLowerCase()}`,
      });
      toast.success("Inventory balance updated successfully");
      setAdjustOpen(false);
      refetch();
    } catch (err: any) {
      toast.error(err?.message || "Failed to update stock");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground flex items-center gap-2">
            <Boxes className="h-6 w-6 text-primary" />
            Pharmacy Stock Control & Inventory Ledger
          </h1>
          <p className="text-muted-foreground text-sm">
            Live drug stock levels, reorder minimum thresholds, and bin card transaction history
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-1.5" />
            Refresh
          </Button>
          <Button size="sm" className="bg-primary" onClick={() => handleOpenAdjust()}>
            <Plus className="h-4 w-4 mr-1.5" />
            Stock Adjustment
          </Button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
              <Boxes className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-heading font-bold text-foreground">{inventory.length}</p>
              <p className="text-xs text-muted-foreground font-medium">Total Formulations</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-success/30 bg-success/5">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-success/20 flex items-center justify-center text-success">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-heading font-bold text-foreground">{healthyCount}</p>
              <p className="text-xs text-muted-foreground font-medium">Adequate Stock</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-warning/30 bg-warning/5">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-warning/20 flex items-center justify-center text-warning font-bold">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-heading font-bold text-foreground">{lowStockCount}</p>
              <p className="text-xs text-muted-foreground font-medium">Reorder Warning</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-destructive/20 flex items-center justify-center text-destructive">
              <TrendingDown className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-heading font-bold text-foreground">{outOfStockCount}</p>
              <p className="text-xs text-muted-foreground font-medium">Stockouts / Depleted</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Stock Table */}
      <Card className="shadow-card border-border">
        <CardHeader className="pb-3 border-b">
          <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant={stockStatusFilter === "all" ? "default" : "outline"}
                size="sm"
                className="h-8 text-xs"
                onClick={() => setStockStatusFilter("all")}
              >
                All Items ({inventory.length})
              </Button>
              <Button
                variant={stockStatusFilter === "low" ? "default" : "outline"}
                size="sm"
                className="h-8 text-xs"
                onClick={() => setStockStatusFilter("low")}
              >
                Low Stock ({lowStockCount})
              </Button>
              <Button
                variant={stockStatusFilter === "out" ? "default" : "outline"}
                size="sm"
                className="h-8 text-xs"
                onClick={() => setStockStatusFilter("out")}
              >
                Stockouts ({outOfStockCount})
              </Button>
              {categories.length > 0 && (
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="h-8 text-xs w-36">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search drug name or code..."
                className="pl-9 h-8 text-xs"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="text-xs">Loading live inventory...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="text-xs font-semibold uppercase tracking-wide h-10">Item Code</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wide h-10">Drug Name & Strength</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wide h-10">Category</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wide h-10 text-right">In Stock</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wide h-10 text-right">Min Threshold</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wide h-10 text-right">Unit Price</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wide h-10 text-center">Status</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wide h-10 text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStock.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                        <Boxes className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
                        No inventory items matching your filter.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredStock.map((item: any) => {
                      const isOut = item.currentStock <= 0;
                      const isLow = item.currentStock > 0 && item.currentStock <= item.reorderPoint;
                      const status = isOut ? "Out of Stock" : isLow ? "Low Stock" : "Sufficient";

                      return (
                        <TableRow key={item._id} className="hover:bg-accent/40 transition-colors">
                          <TableCell className="font-mono text-xs font-bold text-primary py-3">
                            {item.itemId || item.code || "MED"}
                          </TableCell>
                          <TableCell className="py-3">
                            <div className="font-semibold text-sm text-foreground">{item.name}</div>
                            {item.type && <span className="text-[11px] text-muted-foreground">{item.type}</span>}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground py-3">
                            {item.category || "Medication"}
                          </TableCell>
                          <TableCell className="text-right font-mono font-bold text-sm py-3">
                            <span className={isOut ? "text-destructive" : isLow ? "text-warning" : "text-foreground"}>
                              {Number(item.currentStock).toLocaleString()}
                            </span>
                          </TableCell>
                          <TableCell className="text-right font-mono text-xs text-muted-foreground py-3">
                            {item.reorderPoint || 100}
                          </TableCell>
                          <TableCell className="text-right font-mono text-xs text-foreground py-3">
                            KES {Number(item.unitCost || 0).toLocaleString()}
                          </TableCell>
                          <TableCell className="py-3 text-center">
                            <Badge
                              variant="outline"
                              className={`text-[10px] px-2 py-0.5 font-bold ${
                                isOut
                                  ? "bg-destructive/15 text-destructive border-destructive/30"
                                  : isLow
                                  ? "bg-warning/15 text-warning border-warning/30"
                                  : "bg-success/15 text-success border-success/30"
                              }`}
                            >
                              {status}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-3 text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs px-2"
                              onClick={() => handleOpenAdjust(item._id)}
                            >
                              <PackagePlus className="h-3.5 w-3.5 mr-1 text-primary" />
                              Adjust
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stock Adjustment Dialog */}
      <Dialog open={adjustOpen} onOpenChange={setAdjustOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PackagePlus className="h-5 w-5 text-primary" />
              Inventory Stock Adjustment
            </DialogTitle>
            <DialogDescription>
              Record deliveries, ward dispatches, or cycle count discrepancies with full audit trail.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-sm">
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Select Drug / Formulation</Label>
              <Select
                value={selectedItem}
                onValueChange={(id) => {
                  setSelectedItem(id);
                  const found = inventory.find((i) => i._id === id);
                  if (found) setUnitCost(found.unitCost || 0);
                }}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Choose inventory item" />
                </SelectTrigger>
                <SelectContent>
                  {inventory.map((i) => (
                    <SelectItem key={i._id} value={i._id}>
                      {i.name} (Current: {i.currentStock})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Movement Type</Label>
                <Select
                  value={movementType}
                  onValueChange={(val: any) => setMovementType(val)}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RECEIVE">RECEIVE (Supplier Restock)</SelectItem>
                    <SelectItem value="ISSUE">ISSUE (Ward/Dept Dispense)</SelectItem>
                    <SelectItem value="ADJUSTMENT">ADJUSTMENT (Audit Correction)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {movementType === "ADJUSTMENT" ? (
                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Variance Direction</Label>
                  <Select
                    value={direction}
                    onValueChange={(val: any) => setDirection(val)}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INCREASE">▲ Found Extra (+)</SelectItem>
                      <SelectItem value="DECREASE">▼ Damaged / Missing (-)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Unit Cost (KES)</Label>
                  <Input
                    type="number"
                    value={unitCost}
                    onChange={(e) => setUnitCost(Number(e.target.value))}
                    className="h-9 font-mono"
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold">Quantity</Label>
              <Input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                className="h-9 font-mono"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold">Reason / Reference Note</Label>
              <Input
                placeholder="e.g. GRN-4891 Delivery or Ward 3 Emergency stock"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setAdjustOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              className="bg-primary"
              onClick={handleSaveMovement}
              disabled={createMovement.isPending}
            >
              {createMovement.isPending ? "Updating Balance..." : "Save Stock Movement"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
