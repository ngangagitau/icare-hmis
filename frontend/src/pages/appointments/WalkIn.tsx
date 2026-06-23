import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const WalkIn = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold text-foreground">Walk-in Registration</h1>
      <p className="text-muted-foreground text-sm">Quick registration for walk-in patients</p>
    </div>
    <Card>
      <CardHeader><CardTitle>Patient Details</CardTitle></CardHeader>
      <CardContent>
        <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={(e) => { e.preventDefault(); toast.success("Walk-in patient registered & queued"); }}>
          <div className="space-y-2"><Label>First Name</Label><Input placeholder="First name" /></div>
          <div className="space-y-2"><Label>Last Name</Label><Input placeholder="Last name" /></div>
          <div className="space-y-2"><Label>ID / Passport Number</Label><Input placeholder="National ID or Passport" /></div>
          <div className="space-y-2"><Label>Phone</Label><Input placeholder="+254 7XX XXX XXX" /></div>
          <div className="space-y-2"><Label>Date of Birth</Label><Input type="date" /></div>
          <div className="space-y-2">
            <Label>Gender</Label>
            <Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem></SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Department</Label>
            <Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>{["General", "Pediatrics", "Emergency", "Dental"].map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Priority</Label>
            <Select><SelectTrigger><SelectValue placeholder="Normal" /></SelectTrigger>
              <SelectContent><SelectItem value="normal">Normal</SelectItem><SelectItem value="urgent">Urgent</SelectItem><SelectItem value="emergency">Emergency</SelectItem></SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2 flex gap-3">
            <Button type="submit">Register & Queue</Button>
            <Button type="button" variant="outline">Print Token</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  </div>
);

export default WalkIn;
