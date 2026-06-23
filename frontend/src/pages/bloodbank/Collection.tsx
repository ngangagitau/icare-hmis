import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const collections = [
  { id: "BC-001", donor: "John Mwangi", group: "O+", volume: "450ml", date: "2026-03-13", status: "Screening", technicianName: "Nancy Auma" },
  { id: "BC-002", donor: "Sarah Njoki", group: "A+", volume: "450ml", date: "2026-03-13", status: "Collected", technicianName: "James Otieno" },
  { id: "BC-003", donor: "David Kamau", group: "B+", volume: "450ml", date: "2026-03-13", status: "Processing", technicianName: "Nancy Auma" },
];

const BloodCollection = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold text-foreground">Blood Collection</h1>
      <p className="text-muted-foreground text-sm">Track blood donation and collection process</p>
    </div>
    <Card>
      <CardContent className="pt-6">
        <table className="w-full text-sm">
          <thead><tr className="border-b text-left text-muted-foreground">
            <th className="pb-2 pr-4">Collection ID</th><th className="pb-2 pr-4">Donor</th><th className="pb-2 pr-4">Group</th>
            <th className="pb-2 pr-4">Volume</th><th className="pb-2 pr-4">Date</th><th className="pb-2 pr-4">Technician</th><th className="pb-2">Status</th>
          </tr></thead>
          <tbody>{collections.map(c => (
            <tr key={c.id} className="border-b last:border-0">
              <td className="py-3 pr-4 font-mono">{c.id}</td><td className="py-3 pr-4 font-medium">{c.donor}</td>
              <td className="py-3 pr-4 font-bold">{c.group}</td><td className="py-3 pr-4">{c.volume}</td>
              <td className="py-3 pr-4">{c.date}</td><td className="py-3 pr-4">{c.technicianName}</td>
              <td className="py-3"><Badge variant="secondary">{c.status}</Badge></td>
            </tr>
          ))}</tbody>
        </table>
      </CardContent>
    </Card>
  </div>
);

export default BloodCollection;
