import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const transfers = [
  { id: "T-001", patient: "John Mwangi", from: "OPD", to: "Laboratory", time: "10:30 AM", status: "Completed", reason: "Blood work required" },
  { id: "T-002", patient: "Mary Achieng", from: "Triage", to: "Doctor's Room 2", time: "10:45 AM", status: "In Transit", reason: "Consultation" },
  { id: "T-003", patient: "Peter Odhiambo", from: "OPD", to: "Radiology", time: "11:00 AM", status: "Pending", reason: "Chest X-Ray ordered" },
  { id: "T-004", patient: "Grace Njeri", from: "Doctor's Room 1", to: "Pharmacy", time: "11:15 AM", status: "Completed", reason: "Prescription pickup" },
];

const statusColor: Record<string, string> = { Completed: "bg-success/10 text-success", "In Transit": "bg-primary/10 text-primary", Pending: "bg-warning/10 text-warning" };

export default function Transfers() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Patient Transfers</h1>
          <p className="text-muted-foreground text-sm">Transfer patients between departments and service points</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsDialogOpen(true)}>New Transfer</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Transfer</DialogTitle>
            </DialogHeader>
            <form className="space-y-4">
              <div>
                <Label htmlFor="patient">Patient</Label>
                <Input id="patient" placeholder="Enter patient name" />
              </div>
              <div>
                <Label htmlFor="from">From</Label>
                <Input id="from" placeholder="Enter current department" />
              </div>
              <div>
                <Label htmlFor="to">To</Label>
                <Input id="to" placeholder="Enter target department" />
              </div>
              <div>
                <Label htmlFor="reason">Reason</Label>
                <Input id="reason" placeholder="Enter reason for transfer" />
              </div>
              <Button type="submit" onClick={() => setIsDialogOpen(false)}>Submit</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow><TableHead>Transfer ID</TableHead><TableHead>Patient</TableHead><TableHead>From</TableHead><TableHead>To</TableHead><TableHead>Time</TableHead><TableHead>Status</TableHead><TableHead>Reason</TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {transfers.map(t => (
                <TableRow key={t.id}>
                  <TableCell className="font-mono">{t.id}</TableCell>
                  <TableCell className="font-medium">{t.patient}</TableCell>
                  <TableCell>{t.from}</TableCell>
                  <TableCell>{t.to}</TableCell>
                  <TableCell>{t.time}</TableCell>
                  <TableCell><Badge className={statusColor[t.status]}>{t.status}</Badge></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{t.reason}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
