import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
const broadcasts = [
  { id: 1, subject: "System Maintenance Notice", message: "Scheduled downtime on Saturday 2AM-5AM.", sender: "Admin", date: "2024-03-09", recipients: "All Staff" },
  { id: 2, subject: "New COVID Protocol", message: "Updated masking guidelines effective immediately.", sender: "Admin", date: "2024-03-07", recipients: "Clinical Staff" },
];
export default function Broadcasts() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><div><h1 className="text-2xl font-heading font-bold text-foreground">Broadcasts</h1><p className="text-muted-foreground text-sm">System-wide message broadcasting</p></div><Button>New Broadcast</Button></div>
      {broadcasts.map(b => (
        <Card key={b.id}><CardContent className="pt-6"><div className="flex justify-between mb-2"><span className="font-semibold">{b.subject}</span><span className="text-xs text-muted-foreground">{b.date}</span></div><p className="text-sm text-muted-foreground">{b.message}</p><p className="text-xs text-muted-foreground mt-2">To: {b.recipients} — From: {b.sender}</p></CardContent></Card>
      ))}
    </div>
  );
}
