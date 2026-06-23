import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const cycles = [
  { id: "CY-045", autoclave: "Autoclave 1", type: "Steam 134°C", startTime: "08:30", endTime: "09:00", load: "Surgery Set A, Minor Set", indicator: "Pass", operator: "James Otieno" },
  { id: "CY-046", autoclave: "Autoclave 2", type: "Steam 121°C", startTime: "09:15", endTime: "09:50", load: "Obstetric Kit B", indicator: "Pass", operator: "Nancy Auma" },
  { id: "CY-047", autoclave: "Autoclave 1", type: "Steam 134°C", startTime: "10:00", endTime: "—", load: "Dental Kit C, Orthopedic Set", indicator: "Running", operator: "James Otieno" },
];

const CycleMonitoring = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold text-foreground">Cycle Monitoring</h1>
      <p className="text-muted-foreground text-sm">Autoclave cycle tracking and biological indicators</p>
    </div>
    <Card>
      <CardContent className="pt-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left text-muted-foreground">
              <th className="pb-2 pr-4">Cycle ID</th><th className="pb-2 pr-4">Autoclave</th><th className="pb-2 pr-4">Type</th>
              <th className="pb-2 pr-4">Start</th><th className="pb-2 pr-4">End</th><th className="pb-2 pr-4">Load</th>
              <th className="pb-2 pr-4">Indicator</th><th className="pb-2">Operator</th>
            </tr></thead>
            <tbody>{cycles.map(c => (
              <tr key={c.id} className="border-b last:border-0">
                <td className="py-3 pr-4 font-mono">{c.id}</td><td className="py-3 pr-4">{c.autoclave}</td>
                <td className="py-3 pr-4">{c.type}</td><td className="py-3 pr-4 font-mono">{c.startTime}</td>
                <td className="py-3 pr-4 font-mono">{c.endTime}</td><td className="py-3 pr-4">{c.load}</td>
                <td className="py-3 pr-4"><Badge variant={c.indicator === "Pass" ? "default" : "secondary"}>{c.indicator}</Badge></td>
                <td className="py-3">{c.operator}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  </div>
);

export default CycleMonitoring;
