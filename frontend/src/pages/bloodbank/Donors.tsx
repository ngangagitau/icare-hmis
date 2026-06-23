import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const DonorRegistration = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold text-foreground">Donor Registration</h1>
      <p className="text-muted-foreground text-sm">Register blood donors and manage donation records</p>
    </div>
    <Card>
      <CardHeader><CardTitle>Donor Information</CardTitle></CardHeader>
      <CardContent>
        <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={(e) => { e.preventDefault(); toast.success("Donor registered successfully"); }}>
          <div className="space-y-2"><Label>Full Name</Label><Input placeholder="Donor full name" /></div>
          <div className="space-y-2"><Label>ID Number</Label><Input placeholder="National ID" /></div>
          <div className="space-y-2"><Label>Date of Birth</Label><Input type="date" /></div>
          <div className="space-y-2"><Label>Gender</Label>
            <Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem></SelectContent>
            </Select>
          </div>
          <div className="space-y-2"><Label>Phone</Label><Input placeholder="+254 7XX XXX XXX" /></div>
          <div className="space-y-2"><Label>Blood Group</Label>
            <Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>{["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2"><Label>Hemoglobin (g/dL)</Label><Input type="number" step="0.1" placeholder="13.5" /></div>
          <div className="space-y-2"><Label>Weight (kg)</Label><Input type="number" placeholder="65" /></div>
          <div className="space-y-2"><Label>Last Donation Date</Label><Input type="date" /></div>
          <div className="space-y-2"><Label>Donor Type</Label>
            <Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>{["Voluntary", "Replacement", "Autologous"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2 flex gap-3">
            <Button type="submit">Register Donor</Button>
            <Button type="button" variant="outline">Screen & Collect</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  </div>
);

export default DonorRegistration;
