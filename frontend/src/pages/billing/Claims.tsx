import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const claims = [
  { id: "CLM-001", patient: "Mary Achieng", provider: "AAR", amount: 15000, submitted: "2024-03-08", status: "Submitted" },
  { id: "CLM-002", patient: "Grace Njeri", provider: "Jubilee", amount: 22000, submitted: "2024-03-05", status: "Approved" },
  { id: "CLM-003", patient: "Faith Wambui", provider: "NHIF", amount: 8500, submitted: "2024-03-01", status: "Paid" },
  { id: "CLM-004", patient: "Rose Chebet", provider: "Madison", amount: 12000, submitted: "2024-02-28", status: "Rejected" },
  { id: "CLM-005", patient: "Alice Muthoni", provider: "SHA", amount: 6500, submitted: "2024-03-10", status: "Draft" },
];

const statusColor: Record<string, string> = { Draft: "bg-muted text-muted-foreground", Submitted: "bg-primary/10 text-primary", Approved: "bg-success/10 text-success", Paid: "bg-success/10 text-success", Rejected: "bg-destructive/10 text-destructive" };

export default function InsuranceClaims() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><div><h1 className="text-2xl font-heading font-bold text-foreground">Insurance Claims</h1><p className="text-muted-foreground text-sm">Manage SHA, NHIF, and private insurance claims</p></div><Button>New Claim</Button></div>
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader><TableRow><TableHead>Claim ID</TableHead><TableHead>Patient</TableHead><TableHead>Provider</TableHead><TableHead>Amount (KES)</TableHead><TableHead>Submitted</TableHead><TableHead>Status</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
            <TableBody>{claims.map(c => (
              <TableRow key={c.id}><TableCell className="font-mono">{c.id}</TableCell><TableCell className="font-medium">{c.patient}</TableCell><TableCell>{c.provider}</TableCell><TableCell>{c.amount.toLocaleString()}</TableCell><TableCell>{c.submitted}</TableCell><TableCell><Badge className={statusColor[c.status]}>{c.status}</Badge></TableCell><TableCell><Button size="sm" variant="outline">View</Button></TableCell></TableRow>
            ))}</TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
