import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const traumaCases = [
  { id: "T-001", patient: "Tom Kiprono", mechanism: "RTA - Motorcycle", injuries: "Fracture tibia, lacerations", iss: 14, status: "In Surgery", time: "08:25" },
  { id: "T-002", patient: "Agnes Wambui", mechanism: "Fall from height", injuries: "Head injury, suspected spinal", iss: 22, status: "CT Scan", time: "09:15" },
  { id: "T-003", patient: "David Omondi", mechanism: "Assault - stab wound", injuries: "Penetrating abdominal wound", iss: 18, status: "Pre-Op", time: "10:00" },
];

const Trauma = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold text-foreground">Trauma Cases</h1>
      <p className="text-muted-foreground text-sm">Active trauma management and injury severity tracking</p>
    </div>
    <Card>
      <CardHeader><CardTitle>Active Trauma Cases</CardTitle></CardHeader>
      <CardContent>
        <table className="w-full text-sm">
          <thead><tr className="border-b text-left text-muted-foreground">
            <th className="pb-2 pr-4">Case ID</th><th className="pb-2 pr-4">Patient</th><th className="pb-2 pr-4">Mechanism</th>
            <th className="pb-2 pr-4">Injuries</th><th className="pb-2 pr-4">ISS</th><th className="pb-2 pr-4">Status</th><th className="pb-2">Time In</th>
          </tr></thead>
          <tbody>{traumaCases.map(c => (
            <tr key={c.id} className="border-b last:border-0">
              <td className="py-3 pr-4 font-mono">{c.id}</td><td className="py-3 pr-4 font-medium">{c.patient}</td>
              <td className="py-3 pr-4">{c.mechanism}</td><td className="py-3 pr-4">{c.injuries}</td>
              <td className="py-3 pr-4"><Badge variant={c.iss > 15 ? "destructive" : "secondary"}>{c.iss}</Badge></td>
              <td className="py-3 pr-4">{c.status}</td><td className="py-3 font-mono">{c.time}</td>
            </tr>
          ))}</tbody>
        </table>
      </CardContent>
    </Card>
  </div>
);

export default Trauma;
