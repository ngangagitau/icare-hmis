import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const SurgeryBooking = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold text-foreground">Surgery Booking</h1>
      <p className="text-muted-foreground text-sm">Schedule a surgical procedure</p>
    </div>
    <Card>
      <CardHeader><CardTitle>Surgery Details</CardTitle></CardHeader>
      <CardContent>
        <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={(e) => { e.preventDefault(); toast.success("Surgery booked successfully"); }}>
          <div className="space-y-2"><Label>Patient Name / ID</Label><Input placeholder="Search patient..." /></div>
          <div className="space-y-2"><Label>Procedure</Label><Input placeholder="e.g., Appendectomy" /></div>
          <div className="space-y-2"><Label>ICD-10 Code</Label><Input placeholder="e.g., K35.80" /></div>
          <div className="space-y-2"><Label>Surgery Type</Label>
            <Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>{["Elective", "Emergency", "Day Case"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2"><Label>Surgeon</Label>
            <Select><SelectTrigger><SelectValue placeholder="Select surgeon" /></SelectTrigger>
              <SelectContent>{["Dr. Kipchoge", "Dr. Muthoni", "Dr. Kamau"].map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2"><Label>Anaesthetist</Label>
            <Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>{["Dr. Otieno", "Dr. Wanjiku"].map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2"><Label>Preferred Date</Label><Input type="date" /></div>
          <div className="space-y-2"><Label>Estimated Duration</Label><Input placeholder="e.g., 2 hours" /></div>
          <div className="space-y-2"><Label>Operation Theatre</Label>
            <Select><SelectTrigger><SelectValue placeholder="Select OT" /></SelectTrigger>
              <SelectContent>{["OT-1 (General)", "OT-2 (Obstetric)", "OT-3 (Orthopedic)", "OT-4 (Minor)"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2"><Label>Anaesthesia Type</Label>
            <Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>{["General", "Spinal", "Epidural", "Local", "Regional Block"].map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2 space-y-2"><Label>Special Requirements</Label><Textarea placeholder="Blood products, special instruments, ICU standby..." /></div>
          <div className="md:col-span-2 space-y-2"><Label>Pre-Op Diagnosis</Label><Textarea placeholder="Clinical diagnosis and indication for surgery..." /></div>
          <div className="md:col-span-2 flex gap-3">
            <Button type="submit">Book Surgery</Button>
            <Button type="button" variant="outline">Save as Draft</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  </div>
);

export default SurgeryBooking;
