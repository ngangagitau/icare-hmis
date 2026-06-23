import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const rates = [
  { service: "General Consultation", sha: "KES 1,500", aar: "KES 2,000", jubilee: "KES 1,800", hospital: "KES 2,500" },
  { service: "Specialist Consultation", sha: "KES 2,500", aar: "KES 3,500", jubilee: "KES 3,000", hospital: "KES 4,000" },
  { service: "Normal Delivery", sha: "KES 25,000", aar: "KES 45,000", jubilee: "KES 40,000", hospital: "KES 50,000" },
  { service: "Cesarean Section", sha: "KES 50,000", aar: "KES 80,000", jubilee: "KES 75,000", hospital: "KES 100,000" },
  { service: "ICU (per day)", sha: "KES 15,000", aar: "KES 25,000", jubilee: "KES 22,000", hospital: "KES 30,000" },
  { service: "Ward (per day)", sha: "KES 5,000", aar: "KES 8,000", jubilee: "KES 7,000", hospital: "KES 10,000" },
];

const RateContracts = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold text-foreground">Rate Contracts</h1>
      <p className="text-muted-foreground text-sm">Insurance rate comparison by service</p>
    </div>
    <Card>
      <CardHeader><CardTitle>Rate Comparison Matrix</CardTitle></CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left text-muted-foreground">
              <th className="pb-2 pr-4">Service</th><th className="pb-2 pr-4">SHA</th><th className="pb-2 pr-4">AAR</th>
              <th className="pb-2 pr-4">Jubilee</th><th className="pb-2 pr-4">Hospital Rate</th>
            </tr></thead>
            <tbody>{rates.map(r => (
              <tr key={r.service} className="border-b last:border-0">
                <td className="py-3 pr-4 font-medium">{r.service}</td>
                <td className="py-3 pr-4">{r.sha}</td><td className="py-3 pr-4">{r.aar}</td>
                <td className="py-3 pr-4">{r.jubilee}</td><td className="py-3 pr-4 font-medium">{r.hospital}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  </div>
);

export default RateContracts;
