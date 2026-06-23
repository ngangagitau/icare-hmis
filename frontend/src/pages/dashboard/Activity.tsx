import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

const activities = [
  { time: "2 min ago", user: "Dr. Kamau", action: "Completed consultation", patient: "John Mwangi", type: "clinical" },
  { time: "5 min ago", user: "Nurse Wanjiku", action: "Recorded vitals", patient: "Mary Achieng", type: "nursing" },
  { time: "8 min ago", user: "Cashier Jane", action: "Processed payment KES 5,200", patient: "Peter Odhiambo", type: "billing" },
  { time: "12 min ago", user: "Lab Tech Otieno", action: "Published CBC results", patient: "Grace Njeri", type: "lab" },
  { time: "15 min ago", user: "Pharmacist Kimani", action: "Dispensed prescription", patient: "Samuel Kipchoge", type: "pharmacy" },
  { time: "20 min ago", user: "Dr. Ouma", action: "Ordered X-Ray chest", patient: "Faith Wambui", type: "clinical" },
  { time: "25 min ago", user: "Admin Lucy", action: "Registered new patient", patient: "David Mutua", type: "admin" },
  { time: "30 min ago", user: "Nurse Akinyi", action: "Administered medication", patient: "Rose Chebet", type: "nursing" },
  { time: "35 min ago", user: "Dr. Kamau", action: "Admitted to Ward B", patient: "James Kariuki", type: "clinical" },
  { time: "40 min ago", user: "Cashier Jane", action: "Generated invoice INV-2024-0891", patient: "Alice Muthoni", type: "billing" },
];

const typeColors: Record<string, string> = {
  clinical: "bg-primary/10 text-primary",
  nursing: "bg-destructive/10 text-destructive",
  billing: "bg-warning/10 text-warning",
  lab: "bg-accent text-accent-foreground",
  pharmacy: "bg-success/10 text-success",
  admin: "bg-muted text-muted-foreground",
};

export default function Activity() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Recent Activity</h1>
        <p className="text-muted-foreground text-sm">Real-time activity feed across all departments</p>
      </div>
      <Card>
        <CardHeader><CardTitle className="text-base">Activity Log</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activities.map((a, i) => (
              <div key={i} className="flex items-start gap-3 pb-4 border-b border-border last:border-0 last:pb-0">
                <div className="mt-0.5"><Clock className="h-4 w-4 text-muted-foreground" /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm"><span className="font-medium text-foreground">{a.user}</span>{" "}<span className="text-muted-foreground">{a.action}</span></p>
                  <p className="text-xs text-muted-foreground mt-0.5">Patient: {a.patient}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="secondary" className={typeColors[a.type]}>{a.type}</Badge>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{a.time}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
