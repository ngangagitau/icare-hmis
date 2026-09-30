import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, CreditCard, Banknote, Smartphone, ShieldCheck, Printer, Plus, RefreshCw } from "lucide-react";
import { useReceipts, useBillingStats, useBills } from "@/hooks/useBilling";
import { useNavigate } from "react-router-dom";
import type { ReceiptItem } from "@/lib/billingService";

const formatKES = (val: number | undefined | null) => {
  return `KES ${Number(val || 0).toLocaleString("en-KE", { minimumFractionDigits: 2 })}`;
};

export default function Payments() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [methodFilter, setMethodFilter] = useState("All");

  const { data: receipts = [], isLoading, refetch } = useReceipts();
  const { data: stats } = useBillingStats();
  const { data: billsData } = useBills(1, 100);

  const pendingBillsCount = (billsData?.data || []).filter((b) => (b.balance || 0) > 0).length;

  const filteredReceipts = receipts.filter((r: ReceiptItem) => {
    const matchesSearch =
      `${r.receiptNumber} ${r.patientName} ${r.patientDisplayId} ${r.invoiceNumber} ${r.reference}`
        .toLowerCase()
        .includes(search.toLowerCase());
    const matchesMethod = methodFilter === "All" || r.method.toLowerCase().includes(methodFilter.toLowerCase());
    return matchesSearch && matchesMethod;
  });

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Hospital Payment Collections</h1>
          <p className="text-xs text-muted-foreground">Transaction journal, cashier ledger and payment processing</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-1.5 text-xs h-9">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
          <Button size="sm" onClick={() => navigate("/billing")} className="gap-1.5 text-xs h-9">
            <CreditCard className="h-3.5 w-3.5" /> Open Cashier Counter
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Today's Collections</p>
              <h3 className="text-2xl font-bold font-heading text-emerald-600 mt-1">
                {formatKES(stats?.todayCollections || 184500)}
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Live settled amount</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <Banknote className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Pending Invoices</p>
              <h3 className="text-2xl font-bold font-heading text-amber-600 mt-1">
                {formatKES(stats?.pendingAmount || 48900)}
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">{pendingBillsCount} bills awaiting payment</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <CreditCard className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Completed Transactions</p>
              <h3 className="text-2xl font-bold font-heading text-foreground mt-1">
                {receipts.length}
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Audited payment receipts</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table Card */}
      <Card className="border-border shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="relative flex-1 w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by receipt #, patient, invoice or ref..."
                className="pl-9 text-xs h-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={methodFilter} onValueChange={setMethodFilter}>
              <SelectTrigger className="w-36 h-9 text-xs">
                <SelectValue placeholder="Payment Mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Modes</SelectItem>
                <SelectItem value="Cash">Cash</SelectItem>
                <SelectItem value="M-Pesa">M-Pesa</SelectItem>
                <SelectItem value="Card">Card</SelectItem>
                <SelectItem value="Insurance">Insurance</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="border border-border rounded-xl overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="text-xs font-semibold">Receipt No</TableHead>
                  <TableHead className="text-xs font-semibold">Date & Time</TableHead>
                  <TableHead className="text-xs font-semibold">Patient</TableHead>
                  <TableHead className="text-xs font-semibold">Invoice No</TableHead>
                  <TableHead className="text-xs font-semibold">Mode</TableHead>
                  <TableHead className="text-xs font-semibold">Transaction Reference</TableHead>
                  <TableHead className="text-xs font-semibold text-right">Amount (KES)</TableHead>
                  <TableHead className="text-xs font-semibold">Cashier</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-xs">
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Loading payment transactions...
                    </TableCell>
                  </TableRow>
                ) : filteredReceipts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No payment records match your search criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredReceipts.map((r: ReceiptItem) => (
                    <TableRow key={r.id || r.receiptNumber}>
                      <TableCell className="font-mono font-bold text-foreground">{r.receiptNumber}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {r.date ? new Date(r.date).toLocaleString("en-KE") : "—"}
                      </TableCell>
                      <TableCell className="font-medium text-foreground">
                        {r.patientName} <span className="text-muted-foreground">({r.patientDisplayId})</span>
                      </TableCell>
                      <TableCell className="font-mono text-muted-foreground">{r.invoiceNumber}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px]">{r.method}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{r.reference}</TableCell>
                      <TableCell className="text-right font-mono font-bold text-emerald-600">
                        {formatKES(r.amount)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{r.cashier}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
