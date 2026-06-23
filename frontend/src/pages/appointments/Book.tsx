import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const BookAppointment = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold text-foreground">Book Appointment</h1>
      <p className="text-muted-foreground text-sm">Schedule a new patient appointment</p>
    </div>
    <Card>
      <CardHeader><CardTitle>Appointment Details</CardTitle></CardHeader>
      <CardContent>
        <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={(e) => { e.preventDefault(); toast.success("Appointment booked successfully"); }}>
          <div className="space-y-2">
            <Label>Patient Name / ID</Label>
            <Input placeholder="Search patient..." />
          </div>
          <div className="space-y-2">
            <Label>Phone Number</Label>
            <Input placeholder="+254 7XX XXX XXX" />
          </div>
          <div className="space-y-2">
            <Label>Department</Label>
            <Select><SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
              <SelectContent>
                {["General", "Pediatrics", "Internal Medicine", "Surgery", "Obstetrics & Gynecology", "ENT", "Ophthalmology", "Dermatology", "Orthopedics", "Cardiology", "Neurology", "Dental"].map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Doctor</Label>
            <Select><SelectTrigger><SelectValue placeholder="Select doctor" /></SelectTrigger>
              <SelectContent>
                {["Dr. Ochieng", "Dr. Njeri", "Dr. Wambui", "Dr. Kipchoge", "Dr. Muthoni"].map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Appointment Date</Label>
            <Input type="date" />
          </div>
          <div className="space-y-2">
            <Label>Preferred Time</Label>
            <Input type="time" />
          </div>
          <div className="space-y-2">
            <Label>Visit Type</Label>
            <Select><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
              <SelectContent>
                {["New Visit", "Follow-up", "Consultation", "Lab Review", "Referral"].map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Payment Mode</Label>
            <Select><SelectTrigger><SelectValue placeholder="Select mode" /></SelectTrigger>
              <SelectContent>
                {["Cash", "M-Pesa", "Insurance - SHA", "Insurance - AAR", "Insurance - Jubilee", "Corporate"].map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2 space-y-2">
            <Label>Reason for Visit</Label>
            <Textarea placeholder="Brief description of complaint or reason..." />
          </div>
          <div className="md:col-span-2 flex gap-3">
            <Button type="submit">Book Appointment</Button>
            <Button type="button" variant="outline">Book & Print Ticket</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  </div>
);

export default BookAppointment;
