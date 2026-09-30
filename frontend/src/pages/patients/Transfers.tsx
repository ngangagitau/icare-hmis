import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowRightLeft, CheckCircle2, Clock3, PlusCircle, Route } from "lucide-react";
import { PatientMetricCard, PatientPageHeader } from "@/components/patients/PatientPageChrome";

const transfers = [
  { id: "T-001", patient: "John Mwangi", from: "OPD", to: "Laboratory", time: "10:30 AM", status: "Completed", reason: "Blood work required" },
  { id: "T-002", patient: "Mary Achieng", from: "Triage", to: "Doctor's Room 2", time: "10:45 AM", status: "In Transit", reason: "Consultation" },
  { id: "T-003", patient: "Peter Odhiambo", from: "OPD", to: "Radiology", time: "11:00 AM", status: "Pending", reason: "Chest X-Ray ordered" },
  { id: "T-004", patient: "Grace Njeri", from: "Doctor's Room 1", to: "Pharmacy", time: "11:15 AM", status: "Completed", reason: "Prescription pickup" },
];

const statusColor: Record<string, string> = {
  Completed: "bg-success/10 text-success border-success/20",
  "In Transit": "bg-primary/10 text-primary border-primary/20",
  Pending: "bg-warning/10 text-warning border-warning/20",
};

export default function Transfers() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const summaryCards = [
    { label: "Transfers", value: String(transfers.length), note: "All current moves", icon: Route, tone: "cyan" as const },
    { label: "In transit", value: String(transfers.filter((t) => t.status === "In Transit").length), note: "Active transfer flow", icon: Clock3, tone: "amber" as const },
    { label: "Completed", value: String(transfers.filter((t) => t.status === "Completed").length), note: "Closed today", icon: CheckCircle2, tone: "emerald" as const },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PatientPageHeader
        eyebrow="Patient flow"
        title="Patient Transfers"
        description="Track patient movement between departments."
        icon={ArrowRightLeft}
      >
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsDialogOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Transfer
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New transfer</DialogTitle>
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
              <Button type="submit" onClick={() => setIsDialogOpen(false)}>
                Submit
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </PatientPageHeader>

      <div className="grid gap-4 md:grid-cols-3">
        {summaryCards.map((metric) => (
          <PatientMetricCard key={metric.label} {...metric} />
        ))}
      </div>

      <Card className="border-border shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-heading flex items-center gap-2">
            <ArrowRightLeft className="h-4 w-4 text-primary" />
            Transfer log
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <div className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm">
          <Table className="min-w-[820px]">
            <TableHeader className="bg-muted/50 [&_tr]:border-border/70">
              <TableRow className="hover:bg-transparent">
                <TableHead className="h-10 text-[11px] font-semibold uppercase text-muted-foreground">Transfer ID</TableHead>
                <TableHead className="h-10 text-[11px] font-semibold uppercase text-muted-foreground">Patient</TableHead>
                <TableHead className="h-10 text-[11px] font-semibold uppercase text-muted-foreground">From</TableHead>
                <TableHead className="h-10 text-[11px] font-semibold uppercase text-muted-foreground">To</TableHead>
                <TableHead className="h-10 text-[11px] font-semibold uppercase text-muted-foreground">Time</TableHead>
                <TableHead className="h-10 text-[11px] font-semibold uppercase text-muted-foreground">Status</TableHead>
                <TableHead className="h-10 text-[11px] font-semibold uppercase text-muted-foreground">Reason</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transfers.map((t) => (
                <TableRow key={t.id} className="border-border/60 transition-colors hover:bg-cyan-500/[0.04]">
                  <TableCell><span className="rounded-md bg-muted px-2 py-1 font-mono text-xs text-foreground">{t.id}</span></TableCell>
                  <TableCell className="font-semibold text-foreground">{t.patient}</TableCell>
                  <TableCell className="text-muted-foreground">{t.from}</TableCell>
                  <TableCell className="font-medium text-foreground">{t.to}</TableCell>
                  <TableCell className="tabular-nums text-muted-foreground">{t.time}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusColor[t.status] || "bg-muted text-foreground border-border"}>
                      {t.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{t.reason}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

