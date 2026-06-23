import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const items = [
  { code: "PH-006", drug: "Insulin Regular 10ml", batch: "INS-2024-01", expiry: "2024-04-15", qty: 25, daysLeft: 36, status: "Expiring Soon" },
  { code: "PH-007", drug: "Diclofenac Gel 30g", batch: "DCL-2023-08", expiry: "2024-03-20", qty: 12, daysLeft: 10, status: "Critical" },
  { code: "PH-008", drug: "Cetrizine 10mg Tabs", batch: "CET-2024-03", expiry: "2025-06-30", qty: 500, daysLeft: 477, status: "OK" },
  { code: "PH-009", drug: "Vitamin C 1000mg", batch: "VIT-2023-12", expiry: "2024-05-31", qty: 200, daysLeft: 82, status: "Expiring Soon" },
  { code: "PH-010", drug: "Salbutamol Inhaler", batch: "SAL-2023-06", expiry: "2024-02-28", qty: 8, daysLeft: -11, status: "Expired" },
];

const statusColor: Record<string, string> = { OK: "bg-success/10 text-success", "Expiring Soon": "bg-warning/10 text-warning", Critical: "bg-destructive/10 text-destructive", Expired: "bg-destructive text-destructive-foreground" };

export default function ExpiryTracking() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-heading font-bold text-foreground">Expiry Tracking</h1><p className="text-muted-foreground text-sm">Track drug expiry dates and take timely action</p></div>
      <Card><CardContent className="pt-6">
        <Table>
          <TableHeader><TableRow><TableHead>Code</TableHead><TableHead>Drug</TableHead><TableHead>Batch</TableHead><TableHead>Expiry Date</TableHead><TableHead>Qty</TableHead><TableHead>Days Left</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
          <TableBody>{items.map(i => (
            <TableRow key={i.code}><TableCell className="font-mono">{i.code}</TableCell><TableCell className="font-medium">{i.drug}</TableCell><TableCell>{i.batch}</TableCell><TableCell>{i.expiry}</TableCell><TableCell>{i.qty}</TableCell><TableCell className={i.daysLeft < 0 ? "text-destructive font-bold" : ""}>{i.daysLeft}</TableCell><TableCell><Badge className={statusColor[i.status]}>{i.status}</Badge></TableCell></TableRow>
          ))}</TableBody>
        </Table>
      </CardContent></Card>
    </div>
  );
}
