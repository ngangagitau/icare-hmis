import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Package, Search, ArrowDownUp, AlertTriangle, BarChart3, ClipboardList } from "lucide-react";

const stockItems = [
  { item: "Surgical Gloves (Box)", department: "Main Store", quantity: 450, reorder: 100, unit: "boxes", status: "In Stock" },
  { item: "Syringes 5ml", department: "Main Store", quantity: 2300, reorder: 500, unit: "pcs", status: "In Stock" },
  { item: "Gauze Bandage", department: "Nursing", quantity: 35, reorder: 50, unit: "rolls", status: "Low Stock" },
  { item: "IV Giving Sets", department: "Main Store", quantity: 12, reorder: 100, unit: "pcs", status: "Critical" },
  { item: "Cotton Wool 500g", department: "Pharmacy", quantity: 80, reorder: 30, unit: "packs", status: "In Stock" },
  { item: "Bed Sheets", department: "Housekeeping", quantity: 8, reorder: 20, unit: "pcs", status: "Low Stock" },
];

const movements = [
  { date: "2026-03-10", item: "Surgical Gloves", type: "Issue", from: "Main Store", to: "Theatre", qty: 20, by: "James Ouma" },
  { date: "2026-03-10", item: "Syringes 5ml", type: "Receipt", from: "Supplier", to: "Main Store", qty: 500, by: "Alice Wambui" },
  { date: "2026-03-09", item: "IV Giving Sets", type: "Issue", from: "Main Store", to: "ICU", qty: 15, by: "James Ouma" },
  { date: "2026-03-09", item: "Cotton Wool 500g", type: "Transfer", from: "Main Store", to: "Pharmacy", qty: 10, by: "Peter Njoroge" },
];

const statusStyle: Record<string, string> = {
  "In Stock": "bg-success/10 text-success border-success/20",
  "Low Stock": "bg-warning/10 text-warning border-warning/20",
  Critical: "bg-destructive/10 text-destructive border-destructive/20",
};

const typeStyle: Record<string, string> = {
  Issue: "bg-info/10 text-info border-info/20",
  Receipt: "bg-success/10 text-success border-success/20",
  Transfer: "bg-warning/10 text-warning border-warning/20",
};

const Inventory = () => (
  <div className="space-y-6 animate-fade-in">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-heading font-bold">Inventory Management</h1>
        <p className="text-sm text-muted-foreground mt-1">Real-time stock tracking, movements & stock takes</p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" className="gap-2"><ClipboardList className="h-4 w-4" /> Stock Take</Button>
        <Button className="gap-2"><ArrowDownUp className="h-4 w-4" /> New Movement</Button>
      </div>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
      {[
        { label: "Total Items", count: 1284, icon: Package, color: "text-primary" },
        { label: "Low Stock Items", count: 18, icon: AlertTriangle, color: "text-warning" },
        { label: "Movements Today", count: 34, icon: ArrowDownUp, color: "text-info" },
        { label: "Pending Stock Takes", count: 2, icon: BarChart3, color: "text-destructive" },
      ].map(s => (
        <Card key={s.label} className="shadow-card border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className={`h-10 w-10 rounded-lg bg-muted flex items-center justify-center ${s.color}`}>
              <s.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-heading font-bold">{s.count}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>

    <Tabs defaultValue="stock">
      <TabsList>
        <TabsTrigger value="stock">Current Stock</TabsTrigger>
        <TabsTrigger value="movements">Movements</TabsTrigger>
      </TabsList>

      <TabsContent value="stock">
        <Card className="shadow-card border-border">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <CardTitle className="text-base font-heading">Stock Levels</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search items..." className="pl-9 w-56" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="pb-3 font-medium text-muted-foreground">Item</th>
                  <th className="pb-3 font-medium text-muted-foreground">Department</th>
                  <th className="pb-3 font-medium text-muted-foreground text-center">Qty</th>
                  <th className="pb-3 font-medium text-muted-foreground text-center">Reorder</th>
                  <th className="pb-3 font-medium text-muted-foreground text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {stockItems.map(s => (
                  <tr key={s.item} className="border-b border-border last:border-0">
                    <td className="py-3 font-medium">{s.item}</td>
                    <td className="py-3 text-muted-foreground">{s.department}</td>
                    <td className={`py-3 text-center font-semibold ${s.status === "Critical" ? "text-destructive" : s.status === "Low Stock" ? "text-warning" : ""}`}>{s.quantity} {s.unit}</td>
                    <td className="py-3 text-center text-muted-foreground">{s.reorder}</td>
                    <td className="py-3 text-right">
                      <Badge variant="outline" className={`text-[11px] ${statusStyle[s.status]}`}>{s.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="movements">
        <Card className="shadow-card border-border">
          <CardContent className="pt-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="pb-3 font-medium text-muted-foreground">Date</th>
                  <th className="pb-3 font-medium text-muted-foreground">Item</th>
                  <th className="pb-3 font-medium text-muted-foreground">Type</th>
                  <th className="pb-3 font-medium text-muted-foreground">From → To</th>
                  <th className="pb-3 font-medium text-muted-foreground text-center">Qty</th>
                  <th className="pb-3 font-medium text-muted-foreground text-right">By</th>
                </tr>
              </thead>
              <tbody>
                {movements.map((m, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td className="py-3 text-muted-foreground">{m.date}</td>
                    <td className="py-3 font-medium">{m.item}</td>
                    <td className="py-3"><Badge variant="outline" className={`text-[11px] ${typeStyle[m.type]}`}>{m.type}</Badge></td>
                    <td className="py-3 text-muted-foreground">{m.from} → {m.to}</td>
                    <td className="py-3 text-center font-semibold">{m.qty}</td>
                    <td className="py-3 text-right text-muted-foreground">{m.by}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  </div>
);

export default Inventory;
