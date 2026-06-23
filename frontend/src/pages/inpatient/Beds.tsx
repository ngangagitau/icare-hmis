import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const wards = [
  { name: "Ward A (General)", beds: [
    { id: "A-01", status: "Occupied", patient: "James Kariuki" },
    { id: "A-02", status: "Available", patient: "" },
    { id: "A-03", status: "Occupied", patient: "Rose Chebet" },
    { id: "A-04", status: "Maintenance", patient: "" },
    { id: "A-05", status: "Available", patient: "" },
    { id: "A-06", status: "Occupied", patient: "David Mutua" },
  ]},
  { name: "Ward B (Surgical)", beds: [
    { id: "B-01", status: "Occupied", patient: "Alice Muthoni" },
    { id: "B-02", status: "Occupied", patient: "Peter Odhiambo" },
    { id: "B-03", status: "Available", patient: "" },
    { id: "B-04", status: "Available", patient: "" },
  ]},
  { name: "ICU", beds: [
    { id: "ICU-01", status: "Occupied", patient: "Samuel Kipchoge" },
    { id: "ICU-02", status: "Available", patient: "" },
    { id: "ICU-03", status: "Occupied", patient: "Faith Wambui" },
  ]},
];

const bedColor: Record<string, string> = { Occupied: "bg-destructive/10 border-destructive/30 text-destructive", Available: "bg-success/10 border-success/30 text-success", Maintenance: "bg-muted border-muted-foreground/20 text-muted-foreground" };

export default function BedManagement() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-heading font-bold text-foreground">Bed Management</h1><p className="text-muted-foreground text-sm">Visual ward and bed allocation overview</p></div>
      {wards.map(w => (
        <Card key={w.name}><CardHeader><CardTitle className="text-base">{w.name}</CardTitle></CardHeader><CardContent>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {w.beds.map(b => (
              <div key={b.id} className={`rounded-lg border-2 p-3 text-center ${bedColor[b.status]}`}>
                <p className="font-mono text-sm font-bold">{b.id}</p>
                <p className="text-xs mt-1">{b.patient || b.status}</p>
              </div>
            ))}
          </div>
        </CardContent></Card>
      ))}
    </div>
  );
}
