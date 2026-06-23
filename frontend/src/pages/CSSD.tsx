import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const queue = [
  { id: "CS-001", set: "General Surgery Set A", from: "OT-1", items: 24, status: "Washing", started: "08:30" },
  { id: "CS-002", set: "Obstetric Kit B", from: "OT-2", items: 18, status: "Sterilizing", started: "09:00" },
  { id: "CS-003", set: "Minor Procedure Set", from: "A&E", items: 12, status: "Packing", started: "09:45" },
  { id: "CS-004", set: "Dental Kit C", from: "Dental", items: 15, status: "Ready", started: "07:00" },
];

const statusColor: Record<string, string> = {
  Washing: "bg-blue-100 text-blue-800", Sterilizing: "bg-orange-100 text-orange-800",
  Packing: "bg-yellow-100 text-yellow-800", Ready: "bg-green-100 text-green-800",
};

const CSSD = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold text-foreground">Sterilization Queue</h1>
      <p className="text-muted-foreground text-sm">Central Sterile Supply Department - Processing Queue</p>
    </div>
    <Card>
      <CardContent className="pt-6">
        <table className="w-full text-sm">
          <thead><tr className="border-b text-left text-muted-foreground">
            <th className="pb-2 pr-4">ID</th><th className="pb-2 pr-4">Instrument Set</th><th className="pb-2 pr-4">Source</th>
            <th className="pb-2 pr-4">Items</th><th className="pb-2 pr-4">Started</th><th className="pb-2">Status</th>
          </tr></thead>
          <tbody>{queue.map(q => (
            <tr key={q.id} className="border-b last:border-0">
              <td className="py-3 pr-4 font-mono">{q.id}</td><td className="py-3 pr-4 font-medium">{q.set}</td>
              <td className="py-3 pr-4">{q.from}</td><td className="py-3 pr-4">{q.items}</td>
              <td className="py-3 pr-4 font-mono">{q.started}</td>
              <td className="py-3"><Badge className={statusColor[q.status]}>{q.status}</Badge></td>
            </tr>
          ))}</tbody>
        </table>
      </CardContent>
    </Card>
  </div>
);

export default CSSD;
