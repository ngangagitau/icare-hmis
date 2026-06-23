import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const OTNotes = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold text-foreground">Operation Notes</h1>
      <p className="text-muted-foreground text-sm">Document surgical procedures and findings</p>
    </div>
    <Card>
      <CardHeader><CardTitle>Operative Notes</CardTitle></CardHeader>
      <CardContent>
        <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={(e) => { e.preventDefault(); toast.success("OT notes saved"); }}>
          <div className="space-y-2"><Label>Patient</Label><Input placeholder="Patient name" /></div>
          <div className="space-y-2"><Label>Date of Surgery</Label><Input type="date" /></div>
          <div className="space-y-2"><Label>Surgeon</Label><Input placeholder="Operating surgeon" /></div>
          <div className="space-y-2"><Label>Assistant(s)</Label><Input placeholder="Surgical assistants" /></div>
          <div className="space-y-2"><Label>Anaesthetist</Label><Input placeholder="Anaesthetist name" /></div>
          <div className="space-y-2"><Label>Anaesthesia Type</Label><Input placeholder="e.g., General" /></div>
          <div className="space-y-2"><Label>Start Time</Label><Input type="time" /></div>
          <div className="space-y-2"><Label>End Time</Label><Input type="time" /></div>
          <div className="md:col-span-2 space-y-2"><Label>Pre-Op Diagnosis</Label><Textarea placeholder="Pre-operative diagnosis..." /></div>
          <div className="md:col-span-2 space-y-2"><Label>Post-Op Diagnosis</Label><Textarea placeholder="Post-operative diagnosis..." /></div>
          <div className="md:col-span-2 space-y-2"><Label>Procedure Performed</Label><Textarea placeholder="Step-by-step description of the procedure..." rows={4} /></div>
          <div className="md:col-span-2 space-y-2"><Label>Findings</Label><Textarea placeholder="Intra-operative findings..." /></div>
          <div className="md:col-span-2 space-y-2"><Label>Specimens Sent</Label><Input placeholder="e.g., Appendix to histopathology" /></div>
          <div className="space-y-2"><Label>Estimated Blood Loss (ml)</Label><Input type="number" placeholder="50" /></div>
          <div className="space-y-2"><Label>Drain(s)</Label><Input placeholder="Type and site" /></div>
          <div className="md:col-span-2 space-y-2"><Label>Post-Op Instructions</Label><Textarea placeholder="Post-operative care instructions..." /></div>
          <div className="md:col-span-2 flex gap-3">
            <Button type="submit">Save Notes</Button>
            <Button type="button" variant="outline">Print</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  </div>
);

export default OTNotes;
