import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { ShoppingBag, FileText, Truck, AlertCircle, Search, Plus, Send, CheckCircle2 } from "lucide-react";

const purchaseOrders = [
  { id: "LPO-1045", supplier: "MedEquip Supplies Ltd", items: 12, total: "KES 245,000", status: "Pending Approval", date: "2026-03-08" },
  { id: "LPO-1044", supplier: "PharmaCare Distributors", items: 8, total: "KES 180,500", status: "Approved", date: "2026-03-07" },
  { id: "LPO-1043", supplier: "Kenya Medical Supplies", items: 15, total: "KES 520,000", status: "Delivered", date: "2026-03-05" },
  { id: "LPO-1042", supplier: "Lab Instruments EA", items: 5, total: "KES 89,000", status: "Sent to Supplier", date: "2026-03-04" },
];

const payables = [
  { supplier: "MedEquip Supplies Ltd", invoice: "INV-8891", amount: "KES 245,000", due: "2026-03-15", status: "Due Soon", aging: "5 days" },
  { supplier: "PharmaCare Distributors", invoice: "INV-8820", amount: "KES 320,000", due: "2026-03-01", status: "Overdue", aging: "9 days" },
  { supplier: "Lab Instruments EA", invoice: "INV-8790", amount: "KES 89,000", due: "2026-03-20", status: "Current", aging: "—" },
];

const statusStyle: Record<string, string> = {
  "Pending Approval": "bg-warning/10 text-warning border-warning/20",
  Approved: "bg-info/10 text-info border-info/20",
  Delivered: "bg-success/10 text-success border-success/20",
  "Sent to Supplier": "bg-primary/10 text-primary border-primary/20",
  Overdue: "bg-destructive/10 text-destructive border-destructive/20",
  "Due Soon": "bg-warning/10 text-warning border-warning/20",
  Current: "bg-success/10 text-success border-success/20",
};

const Procurement = () => (
  <div className="space-y-6 animate-fade-in">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-heading font-bold">Procurement & Accounts Payable</h1>
        <p className="text-sm text-muted-foreground mt-1">LPOs, supplier management & payment processing</p>
      </div>
      <Button className="gap-2"><Plus className="h-4 w-4" /> Create LPO</Button>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
      {[
        { label: "Open LPOs", count: 6, icon: FileText, color: "text-primary" },
        { label: "Pending Approval", count: 3, icon: AlertCircle, color: "text-warning" },
        { label: "Active Suppliers", count: 24, icon: Truck, color: "text-info" },
        { label: "Overdue Payments", count: 2, icon: ShoppingBag, color: "text-destructive" },
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

    <Tabs defaultValue="lpos">
      <TabsList>
        <TabsTrigger value="lpos">Purchase Orders</TabsTrigger>
        <TabsTrigger value="payables">Accounts Payable</TabsTrigger>
      </TabsList>

      <TabsContent value="lpos">
        <Card className="shadow-card border-border">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <CardTitle className="text-base font-heading">Purchase Orders (LPOs)</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search orders..." className="pl-9 w-56" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {purchaseOrders.map(po => (
              <div key={po.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border border-border gap-3">
                <div>
                  <p className="text-sm font-medium">{po.supplier}</p>
                  <p className="text-xs text-muted-foreground">{po.id} · {po.items} items · {po.date}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{po.total}</span>
                  <Badge variant="outline" className={`text-[11px] ${statusStyle[po.status]}`}>{po.status}</Badge>
                  {po.status === "Pending Approval" && <Button size="sm" className="h-7 text-xs gap-1"><CheckCircle2 className="h-3 w-3" /> Approve</Button>}
                  {po.status === "Approved" && <Button size="sm" variant="outline" className="h-7 text-xs gap-1"><Send className="h-3 w-3" /> Send</Button>}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="payables">
        <Card className="shadow-card border-border">
          <CardContent className="pt-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="pb-3 font-medium text-muted-foreground">Supplier</th>
                  <th className="pb-3 font-medium text-muted-foreground">Invoice</th>
                  <th className="pb-3 font-medium text-muted-foreground text-right">Amount</th>
                  <th className="pb-3 font-medium text-muted-foreground text-center">Due Date</th>
                  <th className="pb-3 font-medium text-muted-foreground text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {payables.map(p => (
                  <tr key={p.invoice} className="border-b border-border last:border-0">
                    <td className="py-3 font-medium">{p.supplier}</td>
                    <td className="py-3 text-muted-foreground">{p.invoice}</td>
                    <td className="py-3 text-right font-semibold">{p.amount}</td>
                    <td className="py-3 text-center text-muted-foreground">{p.due}</td>
                    <td className="py-3 text-right">
                      <Badge variant="outline" className={`text-[11px] ${statusStyle[p.status]}`}>{p.status}</Badge>
                    </td>
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

export default Procurement;
