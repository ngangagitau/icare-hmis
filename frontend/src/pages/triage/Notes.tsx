import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const existing = [
  { patient: "John Mwangi", note: "Patient presents with mild dehydration. IV fluids started. Monitor I/O.", nurse: "Nurse Wanjiku", time: "10:30 AM" },
  { patient: "Mary Achieng", note: "Post-operative wound dressing changed. Wound clean, no signs of infection.", nurse: "Nurse Akinyi", time: "11:00 AM" },
];

export default function CareNotes() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-heading font-bold text-foreground">Care Notes</h1><p className="text-muted-foreground text-sm">Document care procedures and observations</p></div>
      <Card>
        <CardHeader><CardTitle className="text-base">New Care Note</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2"><Label>Patient</Label>
            <Select><SelectTrigger><SelectValue placeholder="Select patient" /></SelectTrigger>
              <SelectContent><SelectItem value="P-10001">John Mwangi</SelectItem><SelectItem value="P-10002">Mary Achieng</SelectItem></SelectContent></Select>
          </div>
          <div className="space-y-2"><Label>Care Notes</Label><Textarea placeholder="Document observations, procedures, and care given..." rows={5} /></div>
          <Button onClick={() => toast.success("Care note saved!")}>Save Note</Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-base">Recent Notes</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {existing.map((n, i) => (
            <div key={i} className="border border-border rounded-lg p-4">
              <div className="flex justify-between mb-2"><span className="font-medium text-sm">{n.patient}</span><span className="text-xs text-muted-foreground">{n.time}</span></div>
              <p className="text-sm text-muted-foreground">{n.note}</p>
              <p className="text-xs text-muted-foreground mt-2">— {n.nurse}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
