import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const resuscitationBays = [
  { bay: "Bay 1", patient: "John Ouma", condition: "Acute MI", status: "Active", team: "Dr. Ochieng, Nurse Auma", started: "07:48" },
  { bay: "Bay 2", patient: "—", condition: "—", status: "Available", team: "—", started: "—" },
  { bay: "Bay 3", patient: "Agnes Wambui", condition: "Head Trauma", status: "Active", team: "Dr. Kipchoge, Nurse Kamau", started: "09:20" },
  { bay: "Bay 4", patient: "—", condition: "—", status: "Available", team: "—", started: "—" },
];

const Resuscitation = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold text-foreground">Resuscitation</h1>
      <p className="text-muted-foreground text-sm">Critical care resuscitation bay management</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {resuscitationBays.map(b => (
        <Card key={b.bay} className={b.status === "Active" ? "border-red-400" : ""}>
          <CardHeader className="pb-2">
            <CardTitle className="flex justify-between items-center text-base">
              {b.bay}
              <Badge className={b.status === "Active" ? "bg-red-600 text-white" : "bg-green-100 text-green-800"}>{b.status}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-1">
            <p><span className="text-muted-foreground">Patient:</span> {b.patient}</p>
            <p><span className="text-muted-foreground">Condition:</span> {b.condition}</p>
            <p><span className="text-muted-foreground">Team:</span> {b.team}</p>
            <p><span className="text-muted-foreground">Started:</span> {b.started}</p>
            {b.status === "Active" && (
              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="destructive" onClick={() => toast.info("Code Blue activated")}>Code Blue</Button>
                <Button size="sm" variant="outline" onClick={() => toast.success("Patient stabilized")}>Stabilized</Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

export default Resuscitation;
