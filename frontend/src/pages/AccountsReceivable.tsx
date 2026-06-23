import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Receipt, Search, FileText, Send, DollarSign, Clock, AlertCircle } from "lucide-react";

const invoices = [
  { id: "INV-5021", client: "SHA - National", type: "Insurance", amount: "KES 1,245,000", outstanding: "KES 890,000", date: "2026-02-28", status: "Partially Paid" },
  { id: "INV-5020", client: "AAR Insurance", type: "Insurance", amount: "KES 680,000", outstanding: "KES 680,000", date: "2026-03-01", status: "Submitted" },
  { id: "INV-5019", client: "Safaricom Ltd", type: "Corporate", amount: "KES 320,000", outstanding: "KES 0", date: "2026-02-15", status: "Paid" },
  { id: "INV-5018", client: "Jubilee Insurance", type: "Insurance", amount: "KES 455,000", outstanding: "KES 455,000", date: "2026-02-20", status: "Overdue" },
];

const statusStyle: Record<string, string> = {
  "Partially Paid": "bg-warning/10 text-warning border-warning/20",
  Submitted: "bg-info/10 text-info border-info/20",
  Paid: "bg-success/10 text-success border-success/20",
  Overdue: "bg-destructive/10 text-destructive border-destructive/20",
};

const AccountsReceivable = () => (
  <div className="space-y-6 animate-fade-in">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-heading font-bold">Accounts Receivable</h1>
        <p className="text-sm text-muted-foreground mt-1">Insurance claims, corporate invoices & payment tracking</p>
      </div>
      <Button className="gap-2"><FileText className="h-4 w-4" /> Generate Invoice</Button>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
      {[
        { label: "Total Receivable", count: "KES 2.7M", icon: DollarSign, color: "text-primary" },
        { label: "Pending Claims", count: 14, icon: Clock, color: "text-warning" },
        { label: "Submitted", count: 8, icon: Send, color: "text-info" },
        { label: "Overdue (>30d)", count: 3, icon: AlertCircle, color: "text-destructive" },
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

    <Card className="shadow-card border-border">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <CardTitle className="text-base font-heading">Invoices & Claims</CardTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search invoices..." className="pl-9 w-56" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="pb-3 font-medium text-muted-foreground">Invoice</th>
              <th className="pb-3 font-medium text-muted-foreground">Client</th>
              <th className="pb-3 font-medium text-muted-foreground">Type</th>
              <th className="pb-3 font-medium text-muted-foreground text-right">Amount</th>
              <th className="pb-3 font-medium text-muted-foreground text-right">Outstanding</th>
              <th className="pb-3 font-medium text-muted-foreground text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map(inv => (
              <tr key={inv.id} className="border-b border-border last:border-0">
                <td className="py-3 font-medium">{inv.id}</td>
                <td className="py-3">{inv.client}</td>
                <td className="py-3 text-muted-foreground">{inv.type}</td>
                <td className="py-3 text-right font-semibold">{inv.amount}</td>
                <td className="py-3 text-right text-muted-foreground">{inv.outstanding}</td>
                <td className="py-3 text-right">
                  <Badge variant="outline" className={`text-[11px] ${statusStyle[inv.status]}`}>{inv.status}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  </div>
);

export default AccountsReceivable;
