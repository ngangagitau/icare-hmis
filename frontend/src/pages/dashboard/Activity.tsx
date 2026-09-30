import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity as ActivityIcon, BellRing, BriefcaseMedical, Clock3, FileText, Stethoscope } from "lucide-react";

const activities = [
  { time: "2 min ago", user: "Dr. Kamau", action: "Completed cardiology consultation", patient: "John Mwangi", type: "clinical" },
  { time: "5 min ago", user: "Nurse Wanjiku", action: "Recorded vitals and triage notes", patient: "Mary Achieng", type: "nursing" },
  { time: "8 min ago", user: "Cashier Jane", action: "Processed payment for admission", patient: "Peter Odhiambo", type: "billing" },
  { time: "12 min ago", user: "Lab Tech Otieno", action: "Published CBC results", patient: "Grace Njeri", type: "lab" },
  { time: "15 min ago", user: "Pharmacist Kimani", action: "Dispensed prescription", patient: "Samuel Kipchoge", type: "pharmacy" },
  { time: "20 min ago", user: "Dr. Ouma", action: "Ordered chest X-ray review", patient: "Faith Wambui", type: "clinical" },
  { time: "25 min ago", user: "Admin Lucy", action: "Registered new patient record", patient: "David Mutua", type: "admin" },
  { time: "30 min ago", user: "Nurse Akinyi", action: "Administered medication", patient: "Rose Chebet", type: "nursing" },
  { time: "35 min ago", user: "Dr. Kamau", action: "Admitted patient to Ward B", patient: "James Kariuki", type: "clinical" },
  { time: "40 min ago", user: "Cashier Jane", action: "Generated invoice INV-2024-0891", patient: "Alice Muthoni", type: "billing" },
];

const typeColors: Record<string, string> = {
  clinical: "bg-primary/10 text-primary border-primary/20",
  nursing: "bg-warning/10 text-warning border-warning/20",
  billing: "bg-success/10 text-success border-success/20",
  lab: "bg-info/10 text-info border-info/20",
  pharmacy: "bg-violet-100 text-violet-700 border-violet-200",
  admin: "bg-muted text-foreground border-border",
};

const typeIcons: Record<string, typeof ActivityIcon> = {
  clinical: Stethoscope,
  nursing: BellRing,
  billing: BriefcaseMedical,
  lab: FileText,
  pharmacy: ActivityIcon,
  admin: Clock3,
};

export default function Activity() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Operations feed</p>
          <h1 className="text-3xl font-heading font-bold text-foreground">Recent Activity</h1>
        </div>

        <Badge variant="outline" className="w-fit border-primary/20 bg-primary/5 text-primary">
          Live system feed
        </Badge>
      </div>

      <Card className="border-border shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-heading">Activity log</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activities.map((item, index) => {
              const Icon = typeIcons[item.type] ?? Clock3;

              return (
                <div
                  key={`${item.user}-${item.time}-${index}`}
                  className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-3 transition-colors hover:bg-muted/50"
                >
                  <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg bg-background shadow-sm">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-foreground">
                      <span className="font-semibold">{item.user}</span>{" "}
                      <span className="text-muted-foreground">{item.action}</span>
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">Patient: {item.patient}</p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <Badge variant="outline" className={typeColors[item.type] || "bg-muted text-foreground border-border"}>
                      {item.type}
                    </Badge>
                    <span className="whitespace-nowrap text-xs text-muted-foreground">{item.time}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
