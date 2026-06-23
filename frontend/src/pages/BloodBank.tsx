import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Droplets } from "lucide-react";

const inventory = [
  { group: "A+", wholeBlood: 12, packedRBC: 8, platelets: 5, ffp: 6, status: "Adequate" },
  { group: "A-", wholeBlood: 3, packedRBC: 2, platelets: 1, ffp: 2, status: "Low" },
  { group: "B+", wholeBlood: 10, packedRBC: 7, platelets: 4, ffp: 5, status: "Adequate" },
  { group: "B-", wholeBlood: 2, packedRBC: 1, platelets: 0, ffp: 1, status: "Critical" },
  { group: "AB+", wholeBlood: 6, packedRBC: 4, platelets: 3, ffp: 3, status: "Adequate" },
  { group: "AB-", wholeBlood: 1, packedRBC: 1, platelets: 0, ffp: 1, status: "Critical" },
  { group: "O+", wholeBlood: 15, packedRBC: 10, platelets: 6, ffp: 8, status: "Adequate" },
  { group: "O-", wholeBlood: 4, packedRBC: 3, platelets: 1, ffp: 2, status: "Low" },
];

const statusColor: Record<string, string> = { Adequate: "bg-green-100 text-green-800", Low: "bg-yellow-100 text-yellow-800", Critical: "bg-red-100 text-red-800" };

const BloodBank = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold text-foreground">Blood Inventory</h1>
      <p className="text-muted-foreground text-sm">Blood bank stock levels by group and component</p>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[
        { label: "Total Units", value: "134" },
        { label: "Donations Today", value: "5" },
        { label: "Units Issued", value: "3" },
        { label: "Expiring Soon", value: "8" },
      ].map(s => (
        <Card key={s.label}><CardContent className="p-4 flex items-center gap-3">
          <Droplets className="h-8 w-8 text-red-500" /><div><p className="text-2xl font-bold">{s.value}</p><p className="text-xs text-muted-foreground">{s.label}</p></div>
        </CardContent></Card>
      ))}
    </div>
    <Card>
      <CardHeader><CardTitle>Stock by Blood Group</CardTitle></CardHeader>
      <CardContent>
        <table className="w-full text-sm">
          <thead><tr className="border-b text-left text-muted-foreground">
            <th className="pb-2 pr-4">Group</th><th className="pb-2 pr-4">Whole Blood</th><th className="pb-2 pr-4">Packed RBC</th>
            <th className="pb-2 pr-4">Platelets</th><th className="pb-2 pr-4">FFP</th><th className="pb-2">Status</th>
          </tr></thead>
          <tbody>{inventory.map(b => (
            <tr key={b.group} className="border-b last:border-0">
              <td className="py-3 pr-4 font-bold text-lg">{b.group}</td>
              <td className="py-3 pr-4">{b.wholeBlood}</td><td className="py-3 pr-4">{b.packedRBC}</td>
              <td className="py-3 pr-4">{b.platelets}</td><td className="py-3 pr-4">{b.ffp}</td>
              <td className="py-3"><Badge className={statusColor[b.status]}>{b.status}</Badge></td>
            </tr>
          ))}</tbody>
        </table>
      </CardContent>
    </Card>
  </div>
);

export default BloodBank;
