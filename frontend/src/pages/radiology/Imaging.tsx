import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const exams = [
  { id: "RAD-001", patient: "Samuel Kipchoge", exam: "Chest X-Ray PA", modality: "X-Ray", technician: "Tech Mwende", status: "Imaging", time: "11:00 AM" },
  { id: "RAD-002", patient: "Faith Wambui", exam: "Abdominal Ultrasound", modality: "Ultrasound", technician: "Tech Ochieng", status: "Completed", time: "10:30 AM" },
  { id: "RAD-003", patient: "James Kariuki", exam: "CT Head", modality: "CT Scan", technician: "", status: "Scheduled", time: "11:30 AM" },
];

const statusColor: Record<string, string> = { Imaging: "bg-primary/10 text-primary", Completed: "bg-success/10 text-success", Scheduled: "bg-warning/10 text-warning" };

export default function RadiologyImaging() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-heading font-bold text-foreground">Imaging</h1><p className="text-muted-foreground text-sm">Digital imaging workflow and modality management</p></div>
      <Card><CardContent className="pt-6">
        <Table>
          <TableHeader><TableRow><TableHead>Exam ID</TableHead><TableHead>Patient</TableHead><TableHead>Examination</TableHead><TableHead>Modality</TableHead><TableHead>Technician</TableHead><TableHead>Time</TableHead><TableHead>Status</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
          <TableBody>{exams.map(e => (
            <TableRow key={e.id}><TableCell className="font-mono">{e.id}</TableCell><TableCell className="font-medium">{e.patient}</TableCell><TableCell>{e.exam}</TableCell><TableCell>{e.modality}</TableCell><TableCell>{e.technician || "—"}</TableCell><TableCell>{e.time}</TableCell><TableCell><Badge className={statusColor[e.status]}>{e.status}</Badge></TableCell><TableCell><Button size="sm" variant="outline">View</Button></TableCell></TableRow>
          ))}</TableBody>
        </Table>
      </CardContent></Card>
    </div>
  );
}
