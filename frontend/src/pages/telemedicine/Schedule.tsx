import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const ScheduleSession = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold text-foreground">Schedule Session</h1>
      <p className="text-muted-foreground text-sm">Book a telemedicine consultation</p>
    </div>
    <Card>
      <CardHeader><CardTitle>Session Details</CardTitle></CardHeader>
      <CardContent>
        <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={(e) => { e.preventDefault(); toast.success("Telemedicine session scheduled"); }}>
          <div className="space-y-2"><Label>Patient</Label><Input placeholder="Search patient..." /></div>
          <div className="space-y-2"><Label>Phone / Email</Label><Input placeholder="Contact for session link" /></div>
          <div className="space-y-2"><Label>Doctor</Label>
            <Select><SelectTrigger><SelectValue placeholder="Select doctor" /></SelectTrigger>
              <SelectContent>{["Dr. Ochieng", "Dr. Njeri", "Dr. Wambui"].map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2"><Label>Date</Label><Input type="date" /></div>
          <div className="space-y-2"><Label>Time</Label><Input type="time" /></div>
          <div className="space-y-2"><Label>Duration</Label>
            <Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>{["15 min", "30 min", "45 min", "60 min"].map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2 space-y-2"><Label>Reason for Consultation</Label><Textarea placeholder="Brief description..." /></div>
          <div className="md:col-span-2 flex gap-3">
            <Button type="submit">Schedule & Send Link</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  </div>
);

export default ScheduleSession;
