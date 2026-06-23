import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

const procedures = [
  { id: 1, procedure: "Wound Dressing", patient: "John Mwangi", nurse: "Nurse Wanjiku", time: "10:30 AM", charge: 500, billed: true },
  { id: 2, procedure: "IV Cannulation", patient: "Mary Achieng", nurse: "Nurse Akinyi", time: "10:45 AM", charge: 800, billed: true },
  { id: 3, procedure: "Nebulization", patient: "Peter Odhiambo", nurse: "Nurse Wanjiku", time: "11:00 AM", charge: 600, billed: false },
  { id: 4, procedure: "Blood Glucose Test", patient: "Grace Njeri", nurse: "Nurse Akinyi", time: "11:15 AM", charge: 300, billed: false },
  { id: 5, procedure: "Catheterization", patient: "Samuel Kipchoge", nurse: "Nurse Wanjiku", time: "11:30 AM", charge: 1200, billed: true },
];

export default function NursingProcedures() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Nursing Procedures</h1>
          <p className="text-muted-foreground text-sm">Document and bill nursing procedures</p>
        </div>
        <Button>Record Procedure</Button>
      </div>
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow><TableHead>Procedure</TableHead><TableHead>Patient</TableHead><TableHead>Nurse</TableHead><TableHead>Time</TableHead><TableHead>Charge (KES)</TableHead><TableHead>Billed</TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {procedures.map(p => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.procedure}</TableCell>
                  <TableCell>{p.patient}</TableCell>
                  <TableCell>{p.nurse}</TableCell>
                  <TableCell>{p.time}</TableCell>
                  <TableCell>{p.charge.toLocaleString()}</TableCell>
                  <TableCell><Checkbox checked={p.billed} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
