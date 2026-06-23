import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const lpos = [
  { id: "LPO-001", supplier: "MediSupply Ltd", items: 12, total: 125000, date: "2024-03-08", status: "Approved", approver: "Admin Lucy" },
  { id: "LPO-002", supplier: "PharmaCo East", items: 8, total: 85000, date: "2024-03-09", status: "Pending Approval", approver: "" },
  { id: "LPO-003", supplier: "LabEquip Kenya", items: 3, total: 450000, date: "2024-03-10", status: "Draft", approver: "" },
];

const statusColor: Record<string, string> = { Approved: "bg-success/10 text-success", "Pending Approval": "bg-warning/10 text-warning", Draft: "bg-muted text-muted-foreground" };

export default function LPOManagement() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><div><h1 className="text-2xl font-heading font-bold text-foreground">LPO Management</h1><p className="text-muted-foreground text-sm">Create and manage Local Purchase Orders with approval workflows</p></div><Button>Create LPO</Button></div>
      <Card><CardContent className="pt-6">
        <Table>
          <TableHeader><TableRow><TableHead>LPO No</TableHead><TableHead>Supplier</TableHead><TableHead>Items</TableHead><TableHead>Total (KES)</TableHead><TableHead>Date</TableHead><TableHead>Status</TableHead><TableHead>Approver</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
          <TableBody>{lpos.map(l => (
            <TableRow key={l.id}><TableCell className="font-mono">{l.id}</TableCell><TableCell className="font-medium">{l.supplier}</TableCell><TableCell>{l.items}</TableCell><TableCell>{l.total.toLocaleString()}</TableCell><TableCell>{l.date}</TableCell><TableCell><Badge className={statusColor[l.status]}>{l.status}</Badge></TableCell><TableCell>{l.approver || "—"}</TableCell><TableCell><Button size="sm" variant="outline">View</Button></TableCell></TableRow>
          ))}</TableBody>
        </Table>
      </CardContent></Card>
    </div>
  );
}
