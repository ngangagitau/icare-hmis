import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { FlaskConical, Clock, CheckCircle2, AlertCircle, Search, Printer } from "lucide-react";

const labRequests = [
  { id: "LAB-2045", patient: "Jane Wanjiku", pid: "P-10234", tests: ["CBC", "Blood Sugar"], status: "Pending", payment: "Cleared", time: "5 min ago" },
  { id: "LAB-2044", patient: "Samuel Otieno", pid: "P-10236", tests: ["Urinalysis", "LFTs"], status: "In Progress", payment: "Cleared", time: "15 min ago" },
  { id: "LAB-2043", patient: "Grace Muthoni", pid: "P-10230", tests: ["Lipid Profile", "RFTs", "CBC"], status: "Completed", payment: "Insurance", time: "1 hr ago" },
  { id: "LAB-2042", patient: "John Kamau", pid: "P-10231", tests: ["Blood Sugar"], status: "Pending", payment: "Unpaid", time: "20 min ago" },
];

const statusStyle: Record<string, string> = {
  Pending: "bg-warning/10 text-warning border-warning/20",
  "In Progress": "bg-info/10 text-info border-info/20",
  Completed: "bg-success/10 text-success border-success/20",
};

const Laboratory = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-heading font-bold">Laboratory</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage lab requests, results & reporting</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { label: "Pending", count: 8, icon: Clock, color: "text-warning" },
          { label: "In Progress", count: 5, icon: FlaskConical, color: "text-info" },
          { label: "Completed Today", count: 34, icon: CheckCircle2, color: "text-success" },
          { label: "Awaiting Payment", count: 3, icon: AlertCircle, color: "text-destructive" },
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
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <CardTitle className="text-base font-heading">Lab Requests</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search..." className="pl-9 w-56" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {labRequests.map(r => (
              <div key={r.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border border-border gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary shrink-0">
                    {r.patient.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{r.patient} <span className="text-muted-foreground">({r.pid})</span></p>
                    <p className="text-xs text-muted-foreground">{r.id} · {r.tests.join(", ")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-12 sm:ml-0">
                  <Badge variant="outline" className={`text-[11px] ${statusStyle[r.status]}`}>{r.status}</Badge>
                  {r.payment === "Unpaid" && (
                    <Badge variant="outline" className="text-[11px] bg-destructive/10 text-destructive border-destructive/20">Unpaid</Badge>
                  )}
                  {r.status === "Completed" && (
                    <Button size="sm" variant="outline" className="h-7 gap-1 text-xs"><Printer className="h-3 w-3" /> Print</Button>
                  )}
                  {r.status === "Pending" && r.payment !== "Unpaid" && (
                    <Button size="sm" className="h-7 text-xs">Enter Results</Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Laboratory;
