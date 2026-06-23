import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const transfers = [
  { id: "IT-001", patient: "James Kariuki", from: "Ward A", to: "ICU", reason: "Condition deteriorated", doctor: "Dr. Kamau", status: "Completed" },
  { id: "IT-002", patient: "Faith Wambui", from: "ICU", to: "Ward B", reason: "Condition improved", doctor: "Dr. Ouma", status: "Pending" },
];

export default function InpatientTransfers() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><div><h1 className="text-2xl font-heading font-bold text-foreground">Ward Transfers</h1><p className="text-muted-foreground text-sm">Transfer in-patients between wards</p></div><Button>New Transfer</Button></div>
      <Card><CardContent className="pt-6">
        <Table>
          <TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Patient</TableHead><TableHead>From</TableHead><TableHead>To</TableHead><TableHead>Reason</TableHead><TableHead>Doctor</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
          <TableBody>{transfers.map(t => (
            <TableRow key={t.id}><TableCell className="font-mono">{t.id}</TableCell><TableCell className="font-medium">{t.patient}</TableCell><TableCell>{t.from}</TableCell><TableCell>{t.to}</TableCell><TableCell className="text-sm">{t.reason}</TableCell><TableCell>{t.doctor}</TableCell><TableCell><Badge variant={t.status === "Completed" ? "default" : "secondary"}>{t.status}</Badge></TableCell></TableRow>
          ))}</TableBody>
        </Table>
      </CardContent></Card>
    </div>
  );
}
