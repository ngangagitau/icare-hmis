import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const leaves = [
  { id: "LV-001", employee: "Dr. Kamau", type: "Annual", from: "2024-03-15", to: "2024-03-22", days: 6, status: "Approved" },
  { id: "LV-002", employee: "Nurse Wanjiku", type: "Sick", from: "2024-03-10", to: "2024-03-11", days: 2, status: "Approved" },
  { id: "LV-003", employee: "Tech Otieno", type: "Annual", from: "2024-03-20", to: "2024-03-29", days: 8, status: "Pending" },
  { id: "LV-004", employee: "Cashier Jane", type: "Maternity", from: "2024-04-01", to: "2024-06-30", days: 90, status: "Pending" },
];

const statusColor: Record<string, string> = { Approved: "bg-success/10 text-success", Pending: "bg-warning/10 text-warning", Rejected: "bg-destructive/10 text-destructive" };

export default function LeaveManagement() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><div><h1 className="text-2xl font-heading font-bold text-foreground">Leave Management</h1><p className="text-muted-foreground text-sm">Manage staff leave requests and approvals</p></div><Button>Apply for Leave</Button></div>
      <Card><CardContent className="pt-6">
        <Table>
          <TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Employee</TableHead><TableHead>Type</TableHead><TableHead>From</TableHead><TableHead>To</TableHead><TableHead>Days</TableHead><TableHead>Status</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
          <TableBody>{leaves.map(l => (
            <TableRow key={l.id}><TableCell className="font-mono">{l.id}</TableCell><TableCell className="font-medium">{l.employee}</TableCell><TableCell>{l.type}</TableCell><TableCell>{l.from}</TableCell><TableCell>{l.to}</TableCell><TableCell>{l.days}</TableCell><TableCell><Badge className={statusColor[l.status]}>{l.status}</Badge></TableCell><TableCell>{l.status === "Pending" && <><Button size="sm" className="mr-1">Approve</Button><Button size="sm" variant="outline">Reject</Button></>}</TableCell></TableRow>
          ))}</TableBody>
        </Table>
      </CardContent></Card>
    </div>
  );
}
