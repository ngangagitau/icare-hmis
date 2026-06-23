import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { BookOpen, Search, Landmark, ArrowLeftRight, FileSpreadsheet, TrendingUp } from "lucide-react";

const ledgerEntries = [
  { date: "2026-03-10", ref: "JV-2034", description: "Patient Revenue - OPD", debit: "284,500", credit: "—", account: "4100 - Revenue", balance: "2,845,000" },
  { date: "2026-03-10", ref: "PV-1892", description: "Supplier Payment - PharmaCare", debit: "—", credit: "180,500", account: "2100 - AP", balance: "1,420,000" },
  { date: "2026-03-09", ref: "JV-2033", description: "Insurance Claim - AAR", debit: "680,000", credit: "—", account: "1300 - AR", balance: "3,200,000" },
  { date: "2026-03-09", ref: "BP-445", description: "Bank Deposit - M-Pesa Collections", debit: "520,000", credit: "—", account: "1100 - Bank", balance: "4,500,000" },
  { date: "2026-03-08", ref: "JV-2032", description: "Salary Accrual - March", debit: "—", credit: "1,200,000", account: "5200 - Salaries", balance: "3,600,000" },
];

const bankAccounts = [
  { name: "KCB Main Account", number: "****4521", balance: "KES 4,520,000", currency: "KES", status: "Reconciled" },
  { name: "Equity Payroll Account", number: "****7832", balance: "KES 1,200,000", currency: "KES", status: "Pending" },
  { name: "M-Pesa Paybill", number: "123456", balance: "KES 340,000", currency: "KES", status: "Reconciled" },
];

const GeneralLedger = () => (
  <div className="space-y-6 animate-fade-in">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-heading font-bold">General Ledger & Banking</h1>
        <p className="text-sm text-muted-foreground mt-1">Chart of accounts, journals & bank reconciliation</p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" className="gap-2"><FileSpreadsheet className="h-4 w-4" /> Trial Balance</Button>
        <Button className="gap-2"><BookOpen className="h-4 w-4" /> Journal Entry</Button>
      </div>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
      {[
        { label: "Total Assets", count: "KES 12.4M", icon: TrendingUp, color: "text-success" },
        { label: "Total Liabilities", count: "KES 4.8M", icon: BookOpen, color: "text-warning" },
        { label: "Bank Balance", count: "KES 6.06M", icon: Landmark, color: "text-primary" },
        { label: "Unreconciled", count: 5, icon: ArrowLeftRight, color: "text-destructive" },
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

    <Tabs defaultValue="ledger">
      <TabsList>
        <TabsTrigger value="ledger">General Ledger</TabsTrigger>
        <TabsTrigger value="banking">Banking</TabsTrigger>
      </TabsList>

      <TabsContent value="ledger">
        <Card className="shadow-card border-border">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <CardTitle className="text-base font-heading">Journal Entries</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search entries..." className="pl-9 w-56" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="pb-3 font-medium text-muted-foreground">Date</th>
                  <th className="pb-3 font-medium text-muted-foreground">Ref</th>
                  <th className="pb-3 font-medium text-muted-foreground">Description</th>
                  <th className="pb-3 font-medium text-muted-foreground text-right">Debit</th>
                  <th className="pb-3 font-medium text-muted-foreground text-right">Credit</th>
                  <th className="pb-3 font-medium text-muted-foreground text-right">Balance</th>
                </tr>
              </thead>
              <tbody>
                {ledgerEntries.map((e, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td className="py-3 text-muted-foreground">{e.date}</td>
                    <td className="py-3 font-medium">{e.ref}</td>
                    <td className="py-3">{e.description}</td>
                    <td className="py-3 text-right font-semibold">{e.debit}</td>
                    <td className="py-3 text-right font-semibold">{e.credit}</td>
                    <td className="py-3 text-right text-muted-foreground">{e.balance}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="banking">
        <Card className="shadow-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-heading">Bank Accounts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {bankAccounts.map(b => (
              <div key={b.number} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border border-border gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Landmark className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{b.name}</p>
                    <p className="text-xs text-muted-foreground">{b.number} · {b.currency}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 ml-12 sm:ml-0">
                  <span className="text-sm font-bold">{b.balance}</span>
                  <Badge variant="outline" className={`text-[11px] ${b.status === "Reconciled" ? "bg-success/10 text-success border-success/20" : "bg-warning/10 text-warning border-warning/20"}`}>{b.status}</Badge>
                  <Button size="sm" variant="outline" className="h-7 text-xs">Reconcile</Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  </div>
);

export default GeneralLedger;
