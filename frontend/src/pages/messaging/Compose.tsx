import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
export default function Compose() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-heading font-bold text-foreground">Compose Message</h1><p className="text-muted-foreground text-sm">Send a direct message to staff</p></div>
      <Card><CardContent className="pt-6 space-y-4">
        <div className="space-y-2"><Label>To</Label><Select><SelectTrigger><SelectValue placeholder="Select recipient" /></SelectTrigger><SelectContent><SelectItem value="dr1">Dr. Kamau</SelectItem><SelectItem value="dr2">Dr. Ouma</SelectItem><SelectItem value="n1">Nurse Wanjiku</SelectItem></SelectContent></Select></div>
        <div className="space-y-2"><Label>Subject</Label><Input placeholder="Message subject" /></div>
        <div className="space-y-2"><Label>Message</Label><Textarea placeholder="Type your message..." rows={6} /></div>
        <Button onClick={() => toast.success("Message sent!")}>Send Message</Button>
      </CardContent></Card>
    </div>
  );
}
