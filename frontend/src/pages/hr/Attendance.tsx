import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const records = [
  { employee: "Dr. Kamau", date: "2024-03-10", clockIn: "07:45 AM", clockOut: "05:30 PM", hours: "9.75", status: "Present" },
  { employee: "Nurse Wanjiku", date: "2024-03-10", clockIn: "—", clockOut: "—", hours: "0", status: "On Leave" },
  { employee: "Tech Otieno", date: "2024-03-10", clockIn: "08:00 AM", clockOut: "04:00 PM", hours: "8.0", status: "Present" },
  { employee: "Cashier Jane", date: "2024-03-10", clockIn: "08:15 AM", clockOut: "", hours: "—", status: "Checked In" },
  { employee: "Dr. Ouma", date: "2024-03-10", clockIn: "—", clockOut: "—", hours: "0", status: "Absent" },
];

const statusColor: Record<string, string> = { Present: "bg-success/10 text-success", "On Leave": "bg-primary/10 text-primary", "Checked In": "bg-warning/10 text-warning", Absent: "bg-destructive/10 text-destructive" };

export default function Attendance() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-heading font-bold text-foreground">Attendance</h1><p className="text-muted-foreground text-sm">Daily staff attendance tracking</p></div>
      <div className="grid grid-cols-4 gap-4">
        <Card><CardContent className="pt-6 text-center"><p className="text-2xl font-bold text-success">32</p><p className="text-sm text-muted-foreground">Present</p></CardContent></Card>
        <Card><CardContent className="pt-6 text-center"><p className="text-2xl font-bold text-destructive">3</p><p className="text-sm text-muted-foreground">Absent</p></CardContent></Card>
        <Card><CardContent className="pt-6 text-center"><p className="text-2xl font-bold text-primary">5</p><p className="text-sm text-muted-foreground">On Leave</p></CardContent></Card>
        <Card><CardContent className="pt-6 text-center"><p className="text-2xl font-bold text-warning">2</p><p className="text-sm text-muted-foreground">Late</p></CardContent></Card>
      </div>
      <Card><CardContent className="pt-6">
        <Table>
          <TableHeader><TableRow><TableHead>Employee</TableHead><TableHead>Date</TableHead><TableHead>Clock In</TableHead><TableHead>Clock Out</TableHead><TableHead>Hours</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
          <TableBody>{records.map((r, i) => (
            <TableRow key={i}><TableCell className="font-medium">{r.employee}</TableCell><TableCell>{r.date}</TableCell><TableCell>{r.clockIn}</TableCell><TableCell>{r.clockOut || "—"}</TableCell><TableCell>{r.hours}</TableCell><TableCell><Badge className={statusColor[r.status]}>{r.status}</Badge></TableCell></TableRow>
          ))}</TableBody>
        </Table>
      </CardContent></Card>
    </div>
  );
}
