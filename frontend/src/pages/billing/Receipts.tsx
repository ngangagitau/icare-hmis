import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Printer, Search, RefreshCw, Receipt as ReceiptIcon, FileText } from "lucide-react";
import { useReceipts } from "@/hooks/useBilling";
import type { ReceiptItem } from "@/lib/billingService";

export default function Receipts() {
  const [search, setSearch] = useState("");
  const { data: receipts = [], isLoading, refetch } = useReceipts();

  const [activeReceipt, setActiveReceipt] = useState<ReceiptItem | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printFormat, setPrintFormat] = useState<"thermal" | "standard">("thermal");

  const filtered = receipts.filter(
    (r: ReceiptItem) =>
      `${r.receiptNumber} ${r.patientName} ${r.patientDisplayId} ${r.invoiceNumber} ${r.reference}`
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  const triggerPrint = () => {
    const el = document.getElementById("receipt-modal-print-target");
    if (!el) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`
      <html>
        <head>
          <title>Receipt - ${activeReceipt?.receiptNumber}</title>
          <style>
            body { font-family: monospace, sans-serif; font-size: 13px; color: #000; margin: 24px; }
            .box { max-width: 320px; margin: 0 auto; }
            .header { text-align: center; border-bottom: 1px dashed #000; padding-bottom: 8px; margin-bottom: 10px; }
            .title { font-size: 15px; font-weight: bold; }
            .row { display: flex; justify-content: space-between; margin: 4px 0; font-size: 12px; }
            .bold { font-weight: bold; }
            .amount { font-size: 14px; font-weight: bold; border-top: 1px dashed #000; border-bottom: 1px dashed #000; padding: 6px 0; margin: 8px 0; }
            .footer { text-align: center; font-size: 11px; margin-top: 12px; }
          </style>
        </head>
        <body>
          ${el.innerHTML}
        </body>
      </html>
    `);
    w.document.close();
    w.focus();
    w.print();
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Payment Receipts</h1>
          <p className="text-xs text-muted-foreground">View, reprint and audit official hospital payment vouchers</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-1.5 text-xs h-9">
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </Button>
      </div>

      <Card className="border-border shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="relative flex-1 w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search receipts by number, patient, invoice or reference..."
                className="pl-9 text-xs h-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <span className="text-xs text-muted-foreground font-mono">
              Total {filtered.length} receipt records
            </span>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="border border-border rounded-xl overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="text-xs font-semibold">Receipt No</TableHead>
                  <TableHead className="text-xs font-semibold">Date / Time</TableHead>
                  <TableHead className="text-xs font-semibold">Patient</TableHead>
                  <TableHead className="text-xs font-semibold">Invoice Ref</TableHead>
                  <TableHead className="text-xs font-semibold">Payment Mode</TableHead>
                  <TableHead className="text-xs font-semibold">Transaction Code</TableHead>
                  <TableHead className="text-xs font-semibold text-right">Amount (KES)</TableHead>
                  <TableHead className="text-xs font-semibold">Cashier</TableHead>
                  <TableHead className="text-xs font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-xs">
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      Loading receipts...
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      No payment receipts found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((r: ReceiptItem) => (
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
                        KES {Number(r.amount || 0).toLocaleString("en-KE", { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{r.cashier}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-[11px] gap-1 px-2.5"
                          onClick={() => {
                            setActiveReceipt(r);
                            setIsPrintModalOpen(true);
                          }}
                        >
                          <Printer className="h-3 w-3" /> View / Print
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Print Preview Modal */}
      <Dialog open={isPrintModalOpen} onOpenChange={setIsPrintModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between text-base">
              <span>Receipt Preview</span>
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant={printFormat === "thermal" ? "default" : "outline"}
                  className="h-7 text-xs px-2"
                  onClick={() => setPrintFormat("thermal")}
                >
                  80mm Slip
                </Button>
                <Button
                  size="sm"
                  variant={printFormat === "standard" ? "default" : "outline"}
                  className="h-7 text-xs px-2"
                  onClick={() => setPrintFormat("standard")}
                >
                  A4 View
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div id="receipt-modal-print-target" className="p-4 bg-white text-black rounded-lg border font-mono text-xs space-y-2">
            <div className="text-center pb-2 border-b border-dashed border-gray-400">
              <p className="font-bold text-sm tracking-wider uppercase">ICARE SPECIALIST HOSPITAL</p>
              <p className="text-[10px] text-gray-600">Official Patient Receipt</p>
              <p className="text-[10px] text-gray-600">PO BOX 40100 - Nairobi | Tel: +254 700 000 000</p>
            </div>

            <div className="space-y-1 text-[11px] py-1 border-b border-dashed border-gray-400">
              <div className="flex justify-between">
                <span>Receipt Number:</span>
                <span className="font-bold">{activeReceipt?.receiptNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Invoice Ref:</span>
                <span>{activeReceipt?.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Date & Time:</span>
                <span>{activeReceipt?.date ? new Date(activeReceipt.date).toLocaleString("en-KE") : new Date().toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Patient Name:</span>
                <span className="font-bold">{activeReceipt?.patientName}</span>
              </div>
              <div className="flex justify-between">
                <span>Patient ID:</span>
                <span>{activeReceipt?.patientDisplayId}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment Mode:</span>
                <span className="font-semibold">{activeReceipt?.method}</span>
              </div>
              <div className="flex justify-between">
                <span>Reference:</span>
                <span>{activeReceipt?.reference || "Cash Drawer"}</span>
              </div>
            </div>

            <div className="py-2 border-b border-dashed border-gray-400">
              <div className="flex justify-between font-bold text-sm">
                <span>AMOUNT PAID:</span>
                <span>KES {Number(activeReceipt?.amount || 0).toLocaleString("en-KE", { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            <div className="text-center pt-2 text-[10px] text-gray-500">
              <p>Cashier: {activeReceipt?.cashier || "Cash Desk 01"}</p>
              <p className="mt-1">Thank you for your visit. Quick recovery!</p>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsPrintModalOpen(false)}>
              Close
            </Button>
            <Button onClick={triggerPrint} className="gap-2">
              <Printer className="h-4 w-4" /> Print Document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
