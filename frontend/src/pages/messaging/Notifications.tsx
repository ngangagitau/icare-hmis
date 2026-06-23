import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
const notifications = [
  { id: 1, title: "Low Stock Alert", message: "Amlodipine 5mg is critically low (45 units)", type: "warning", time: "5 min ago", read: false },
  { id: 2, title: "Lab Results Ready", message: "CBC results for John Mwangi are ready", type: "info", time: "12 min ago", read: false },
  { id: 3, title: "Payment Received", message: "M-Pesa payment of KES 2,720 confirmed", type: "success", time: "20 min ago", read: true },
  { id: 4, title: "Leave Request", message: "Tech Otieno has requested annual leave", type: "info", time: "1 hr ago", read: true },
  { id: 5, title: "Overdue Invoice", message: "SurgicalTools Ltd invoice is overdue by 5 days", type: "warning", time: "2 hrs ago", read: true },
];
const typeColor: Record<string, string> = { warning: "bg-warning/10 text-warning", info: "bg-primary/10 text-primary", success: "bg-success/10 text-success" };
export default function Notifications() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-heading font-bold text-foreground">Notifications</h1><p className="text-muted-foreground text-sm">System alerts and notifications</p></div>
      <div className="space-y-3">
        {notifications.map(n => (
          <Card key={n.id} className={!n.read ? "border-primary/30" : ""}><CardContent className="pt-4 pb-4 flex items-start gap-3">
            <div className="flex-1"><div className="flex items-center gap-2 mb-1"><span className="font-medium text-sm">{n.title}</span>{!n.read && <span className="h-2 w-2 rounded-full bg-primary" />}<Badge className={typeColor[n.type] + " ml-auto"}>{n.type}</Badge></div><p className="text-sm text-muted-foreground">{n.message}</p><p className="text-xs text-muted-foreground mt-1">{n.time}</p></div>
          </CardContent></Card>
        ))}
      </div>
    </div>
  );
}
