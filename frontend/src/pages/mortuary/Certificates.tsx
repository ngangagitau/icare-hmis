import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const certificates = [
  { id: "DC-001", deceased: "Agnes Wambui", cause: "Natural causes - Heart failure", certifiedBy: "Dr. Ochieng", date: "2026-03-12", status: "Issued" },
  { id: "DC-002", deceased: "Samuel Omondi", cause: "Road traffic accident - Polytrauma", certifiedBy: "Dr. Kipchoge", date: "2026-03-13", status: "Pending" },
];

const DeathCertificates = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold text-foreground">Death Certificates</h1>
      <p className="text-muted-foreground text-sm">Issue and manage death certificates</p>
    </div>
    <Card>
      <CardContent className="pt-6">
        <table className="w-full text-sm">
          <thead><tr className="border-b text-left text-muted-foreground">
            <th className="pb-2 pr-4">Certificate ID</th><th className="pb-2 pr-4">Deceased</th><th className="pb-2 pr-4">Cause of Death</th>
            <th className="pb-2 pr-4">Certified By</th><th className="pb-2 pr-4">Date</th><th className="pb-2 pr-4">Status</th><th className="pb-2">Action</th>
          </tr></thead>
          <tbody>{certificates.map(c => (
            <tr key={c.id} className="border-b last:border-0">
              <td className="py-3 pr-4 font-mono">{c.id}</td><td className="py-3 pr-4 font-medium">{c.deceased}</td>
              <td className="py-3 pr-4">{c.cause}</td><td className="py-3 pr-4">{c.certifiedBy}</td>
              <td className="py-3 pr-4">{c.date}</td>
              <td className="py-3 pr-4"><Badge variant={c.status === "Issued" ? "default" : "secondary"}>{c.status}</Badge></td>
              <td className="py-3"><Button size="sm" variant="outline">Print</Button></td>
            </tr>
          ))}</tbody>
        </table>
      </CardContent>
    </Card>
  </div>
);

export default DeathCertificates;
