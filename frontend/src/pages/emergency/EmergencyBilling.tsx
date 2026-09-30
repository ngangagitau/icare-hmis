import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle, ChevronLeft, ChevronRight, Loader2, ReceiptText } from "lucide-react";
import { fetchEmergencyInvoices } from "@/lib/emergencyService";

const statusStyle: Record<string, string> = {
  Pending: "border-amber-200 bg-amber-50 text-amber-700",
  Partial: "border-blue-200 bg-blue-50 text-blue-700",
  Paid: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Overdue: "border-red-200 bg-red-50 text-red-700",
  Cancelled: "border-border bg-muted text-muted-foreground",
};

const currency = new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 });

const EmergencyBilling = () => {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useQuery({
    queryKey: ["emergency", "billing", page],
    queryFn: () => fetchEmergencyInvoices(page, 25),
  });
  const invoices = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase text-cyan-700">Emergency department</p>
        <h1 className="mt-1 flex items-center gap-2 text-2xl font-bold text-foreground"><ReceiptText className="h-6 w-6 text-cyan-700" />Emergency Billing</h1>
        <p className="mt-1 text-sm text-muted-foreground">Persisted billing records for patients with emergency cases.</p>
      </div>

      <div className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50/70 p-3 text-sm text-amber-900">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
        <p>Invoices are linked to patient records, not individual emergency visits. These totals are patient-level and may include services from other encounters.</p>
      </div>

      <Card className="overflow-hidden border-border/80 shadow-card">
        <CardHeader className="border-b border-border/60 bg-muted/30 py-4">
          <CardTitle className="flex items-center justify-between text-base">
            <span>Patient invoices</span>
            <span className="text-xs font-normal text-muted-foreground">{pagination?.totalInvoices ?? 0} records</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="min-w-[760px]">
              <TableHeader className="bg-muted/40">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-[11px] font-semibold uppercase">Invoice</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase">Patient</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase">Items</TableHead>
                  <TableHead className="text-right text-[11px] font-semibold uppercase">Amount due</TableHead>
                  <TableHead className="text-right text-[11px] font-semibold uppercase">Balance</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase">Payer</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice._id} className="border-border/60 hover:bg-cyan-500/[0.04]">
                    <TableCell>
                      <div className="font-mono text-xs font-semibold text-foreground">{invoice.invoiceNumber}</div>
                      <div className="mt-1 text-[11px] text-muted-foreground">
                        {invoice.invoiceDate ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(invoice.invoiceDate)) : "Date not recorded"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-foreground">{invoice.patientName}</div>
                      <div className="mt-1 text-[11px] text-muted-foreground">{invoice.patientNumber || "No patient ID"}</div>
                    </TableCell>
                    <TableCell className="max-w-[240px] text-xs text-muted-foreground">
                      {invoice.items.length ? invoice.items.map((item) => item.description).filter(Boolean).join(", ") : "No invoice items recorded"}
                    </TableCell>
                    <TableCell className="text-right font-medium tabular-nums">{currency.format(invoice.amountDue)}</TableCell>
                    <TableCell className="text-right tabular-nums">{currency.format(invoice.balance)}</TableCell>
                    <TableCell className="text-xs">{invoice.payer}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusStyle[invoice.paymentStatus] || "border-border bg-muted text-muted-foreground"}>{invoice.paymentStatus}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {isLoading && <TableRow><TableCell colSpan={7} className="py-12 text-center text-muted-foreground"><Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin" />Loading invoices...</TableCell></TableRow>}
                {isError && <TableRow><TableCell colSpan={7} className="py-12 text-center text-destructive">Unable to load invoices from the billing database.</TableCell></TableRow>}
                {!isLoading && !isError && invoices.length === 0 && <TableRow><TableCell colSpan={7} className="py-12 text-center text-muted-foreground">No invoices are recorded for patients with emergency cases.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </div>
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border px-4 py-3 text-xs text-muted-foreground">
              <span>Page {pagination.currentPage} of {pagination.totalPages}</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={!pagination.hasPrev} onClick={() => setPage((current) => current - 1)}><ChevronLeft className="mr-1 h-4 w-4" />Previous</Button>
                <Button variant="outline" size="sm" disabled={!pagination.hasNext} onClick={() => setPage((current) => current + 1)}>Next<ChevronRight className="ml-1 h-4 w-4" /></Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmergencyBilling;
