import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const instruments = [
  { name: "General Surgery Set A", items: 24, lastSterilized: "2026-03-13 10:00", cycles: 145, condition: "Good" },
  { name: "General Surgery Set B", items: 24, lastSterilized: "2026-03-12 14:00", cycles: 132, condition: "Good" },
  { name: "Obstetric Kit A", items: 18, lastSterilized: "2026-03-13 08:00", cycles: 98, condition: "Good" },
  { name: "Orthopedic Set", items: 32, lastSterilized: "2026-03-12 16:00", cycles: 67, condition: "Needs Inspection" },
  { name: "Minor Procedure Set", items: 12, lastSterilized: "2026-03-13 09:45", cycles: 210, condition: "Replace Soon" },
];

const InstrumentTracking = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold text-foreground">Instrument Tracking</h1>
      <p className="text-muted-foreground text-sm">Track instrument sets and sterilization history</p>
    </div>
    <Card>
      <CardContent className="pt-6">
        <table className="w-full text-sm">
          <thead><tr className="border-b text-left text-muted-foreground">
            <th className="pb-2 pr-4">Set Name</th><th className="pb-2 pr-4">Items</th><th className="pb-2 pr-4">Last Sterilized</th>
            <th className="pb-2 pr-4">Total Cycles</th><th className="pb-2">Condition</th>
          </tr></thead>
          <tbody>{instruments.map(i => (
            <tr key={i.name} className="border-b last:border-0">
              <td className="py-3 pr-4 font-medium">{i.name}</td><td className="py-3 pr-4">{i.items}</td>
              <td className="py-3 pr-4">{i.lastSterilized}</td><td className="py-3 pr-4">{i.cycles}</td>
              <td className="py-3"><Badge variant={i.condition === "Good" ? "default" : "destructive"}>{i.condition}</Badge></td>
            </tr>
          ))}</tbody>
        </table>
      </CardContent>
    </Card>
  </div>
);

export default InstrumentTracking;
