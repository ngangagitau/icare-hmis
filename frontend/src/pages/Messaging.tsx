import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Send, Plus, Users, Bell } from "lucide-react";

const messages = [
  { from: "Dr. Jane Mwangi", to: "All Staff", subject: "Staff Meeting - Friday 2PM", time: "10 min ago", read: false, type: "Broadcast" },
  { from: "Alice Wambui", to: "You", subject: "ICU Patient Update - Bed 3", time: "25 min ago", read: false, type: "Direct" },
  { from: "James Ouma", to: "You", subject: "Pharmacy stock query - Amoxicillin", time: "1 hr ago", read: true, type: "Direct" },
  { from: "System", to: "All Staff", subject: "Scheduled maintenance tonight 10PM-12AM", time: "2 hrs ago", read: true, type: "System" },
  { from: "Sarah Akinyi", to: "Department Heads", subject: "Monthly KPI Report Due", time: "3 hrs ago", read: true, type: "Broadcast" },
];

const notifications = [
  { message: "Lab results ready for P-10234 (Jane Wanjiku)", time: "5 min ago", type: "Lab" },
  { message: "New admission: Peter Odhiambo to General Ward A", time: "15 min ago", type: "Admission" },
  { message: "Low stock alert: IV Giving Sets (12 remaining)", time: "30 min ago", type: "Inventory" },
  { message: "Payment received: KES 15,000 from M-Pesa", time: "45 min ago", type: "Billing" },
  { message: "Prescription RX-3021 ready for dispensing", time: "1 hr ago", type: "Pharmacy" },
];

const typeStyle: Record<string, string> = {
  Broadcast: "bg-info/10 text-info border-info/20",
  Direct: "bg-primary/10 text-primary border-primary/20",
  System: "bg-muted text-muted-foreground",
};

const Messaging = () => (
  <div className="space-y-6 animate-fade-in">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-heading font-bold">Messaging & Notifications</h1>
        <p className="text-sm text-muted-foreground mt-1">Internal communication & system alerts</p>
      </div>
      <Button className="gap-2"><Plus className="h-4 w-4" /> New Message</Button>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {[
        { label: "Unread Messages", count: 2, icon: MessageSquare, color: "text-primary" },
        { label: "Broadcasts Today", count: 3, icon: Users, color: "text-info" },
        { label: "System Alerts", count: 5, icon: Bell, color: "text-warning" },
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

    <Tabs defaultValue="inbox">
      <TabsList>
        <TabsTrigger value="inbox">Inbox</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
      </TabsList>

      <TabsContent value="inbox">
        <Card className="shadow-card border-border">
          <CardContent className="pt-4 space-y-2">
            {messages.map((m, i) => (
              <div key={i} className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border gap-3 ${!m.read ? "bg-primary/5 border-primary/20" : "border-border"}`}>
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary shrink-0">
                    {m.from === "System" ? "SYS" : m.from.split(" ").slice(-2).map(n => n[0]).join("")}
                  </div>
                  <div>
                    <p className={`text-sm ${!m.read ? "font-semibold" : "font-medium"}`}>{m.subject}</p>
                    <p className="text-xs text-muted-foreground">From: {m.from} · To: {m.to}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-12 sm:ml-0">
                  <Badge variant="outline" className={`text-[11px] ${typeStyle[m.type]}`}>{m.type}</Badge>
                  <span className="text-xs text-muted-foreground">{m.time}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="notifications">
        <Card className="shadow-card border-border">
          <CardContent className="pt-4 space-y-2">
            {notifications.map((n, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
                  <p className="text-sm">{n.message}</p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{n.time}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  </div>
);

export default Messaging;
