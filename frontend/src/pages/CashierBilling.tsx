import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreditCard, Receipt, Search, Printer, CheckCircle2, Clock } from "lucide-react";

const pendingBills = [
  { id: "INV-5012", patient: "Jane Wanjiku", pid: "P-10234", amount: 4500, items: 3, scheme: "SHA", status: "Pending" },
  { id: "INV-5011", patient: "John Kamau", pid: "P-10231", amount: 2800, items: 2, scheme: "Cash", status: "Partial" },
  { id: "INV-5010", patient: "Grace Muthoni", pid: "P-10230", amount: 12500, items: 5, scheme: "Madison", status: "Pending" },
  { id: "INV-5009", patient: "Samuel Otieno", pid: "P-10236", amount: 6200, items: 4, scheme: "Cash", status: "Pending" },
];

const recentPayments = [
  { id: "RCT-8034", patient: "Mary Achieng", amount: 3500, method: "M-Pesa", time: "10 min ago" },
  { id: "RCT-8033", patient: "Peter Odhiambo", amount: 8200, method: "Cash", time: "25 min ago" },
  { id: "RCT-8032", patient: "David Kipchoge", amount: 15000, method: "Insurance", time: "1 hr ago" },
];

const CashierBilling = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold">Cashier & Billing</h1>
          <p className="text-sm text-muted-foreground mt-1">Process payments and manage invoices</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2"><Receipt className="h-4 w-4" /> New Invoice</Button>
          <Button className="gap-2"><CreditCard className="h-4 w-4" /> Receive Payment</Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="shadow-card border-border">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Today's Collections</p>
            <p className="text-2xl font-heading font-bold mt-1">KES 284,500</p>
            <p className="text-xs text-success mt-1">+8.2% vs yesterday</p>
          </CardContent>
        </Card>
        <Card className="shadow-card border-border">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Pending Bills</p>
            <p className="text-2xl font-heading font-bold mt-1">KES 26,000</p>
            <p className="text-xs text-warning mt-1">4 invoices</p>
          </CardContent>
        </Card>
        <Card className="shadow-card border-border">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Insurance Claims</p>
            <p className="text-2xl font-heading font-bold mt-1">KES 142,300</p>
            <p className="text-xs text-info mt-1">12 pending claims</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending" className="gap-1.5"><Clock className="h-3.5 w-3.5" /> Pending Bills</TabsTrigger>
          <TabsTrigger value="payments" className="gap-1.5"><CheckCircle2 className="h-3.5 w-3.5" /> Recent Payments</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card className="shadow-card border-border">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search invoices..." className="pl-9" />
                </div>
                <Select>
                  <SelectTrigger className="w-40"><SelectValue placeholder="All Schemes" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Schemes</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="sha">SHA</SelectItem>
                    <SelectItem value="insurance">Insurance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="pb-3 font-medium text-muted-foreground">Invoice</th>
                    <th className="pb-3 font-medium text-muted-foreground">Patient</th>
                    <th className="pb-3 font-medium text-muted-foreground hidden sm:table-cell">Scheme</th>
                    <th className="pb-3 font-medium text-muted-foreground text-right">Amount</th>
                    <th className="pb-3 font-medium text-muted-foreground text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingBills.map((b) => (
                    <tr key={b.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="py-3">
                        <p className="font-medium">{b.id}</p>
                        <p className="text-xs text-muted-foreground">{b.items} items</p>
                      </td>
                      <td className="py-3">
                        <p className="font-medium">{b.patient}</p>
                        <p className="text-xs text-muted-foreground">{b.pid}</p>
                      </td>
                      <td className="py-3 hidden sm:table-cell">
                        <Badge variant="outline" className="text-xs">{b.scheme}</Badge>
                      </td>
                      <td className="py-3 text-right font-medium">KES {b.amount.toLocaleString()}</td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button size="sm" variant="outline" className="h-7 text-xs"><Printer className="h-3 w-3" /></Button>
                          <Button size="sm" className="h-7 text-xs">Pay</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card className="shadow-card border-border">
            <CardContent className="pt-4">
              <div className="space-y-3">
                {recentPayments.map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-success/10 flex items-center justify-center">
                        <CheckCircle2 className="h-4 w-4 text-success" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{p.patient}</p>
                        <p className="text-xs text-muted-foreground">{p.id} · {p.method}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">KES {p.amount.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">{p.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CashierBilling;
