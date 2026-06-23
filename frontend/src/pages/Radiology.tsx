import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScanLine, Clock, CheckCircle2, Printer } from "lucide-react";

const requests = [
  { id: "RAD-501", patient: "Jane Wanjiku", pid: "P-10234", exam: "Chest X-Ray", status: "Pending", payment: "Cleared" },
  { id: "RAD-500", patient: "John Kamau", pid: "P-10231", exam: "Abdominal Ultrasound", status: "In Progress", payment: "Cash - Unpaid" },
  { id: "RAD-499", patient: "Grace Muthoni", pid: "P-10230", exam: "CT Scan - Abdomen", status: "Completed", payment: "Insurance" },
];

const statusStyle: Record<string, string> = {
  Pending: "bg-warning/10 text-warning border-warning/20",
  "In Progress": "bg-info/10 text-info border-info/20",
  Completed: "bg-success/10 text-success border-success/20",
};

const Radiology = () => (
  <div className="space-y-6 animate-fade-in">
    <div>
      <h1 className="text-2xl font-heading font-bold">Radiology</h1>
      <p className="text-sm text-muted-foreground mt-1">Imaging requests, results & reporting</p>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {[
        { label: "Pending", count: 6, icon: Clock, color: "text-warning" },
        { label: "In Progress", count: 2, icon: ScanLine, color: "text-info" },
        { label: "Completed Today", count: 14, icon: CheckCircle2, color: "text-success" },
      ].map(s => (
        <Card key={s.label} className="shadow-card border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className={`h-10 w-10 rounded-lg bg-muted flex items-center justify-center ${s.color}`}>
              <s.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-heading font-bold">{s.count}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>

    <Card className="shadow-card border-border">
      <CardContent className="pt-4 space-y-3">
        {requests.map(r => (
          <div key={r.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border border-border gap-3">
            <div>
              <p className="text-sm font-medium">{r.patient} <span className="text-muted-foreground">({r.pid})</span></p>
              <p className="text-xs text-muted-foreground">{r.id} · {r.exam}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={`text-[11px] ${statusStyle[r.status]}`}>{r.status}</Badge>
              {r.status === "Completed" && (
                <Button size="sm" variant="outline" className="h-7 gap-1 text-xs"><Printer className="h-3 w-3" /> Print</Button>
              )}
              {r.status === "Pending" && <Button size="sm" className="h-7 text-xs">Start Exam</Button>}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  </div>
);

export default Radiology;
