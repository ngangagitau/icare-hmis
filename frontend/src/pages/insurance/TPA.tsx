import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const tpaList = [
  { name: "SHA", contactPerson: "John Maina", phone: "+254 20 271 0000", email: "claims@sha.go.ke", activePatients: 245, status: "Active" },
  { name: "AAR Insurance", contactPerson: "Mary Njeri", phone: "+254 20 289 3000", email: "preauth@aar.co.ke", activePatients: 128, status: "Active" },
  { name: "Jubilee Insurance", contactPerson: "Peter Ochieng", phone: "+254 20 328 0000", email: "medical@jubilee.co.ke", activePatients: 86, status: "Active" },
  { name: "Britam", contactPerson: "Sarah Wambui", phone: "+254 20 283 3000", email: "claims@britam.com", activePatients: 54, status: "Active" },
  { name: "CIC Insurance", contactPerson: "David Kamau", phone: "+254 20 282 3000", email: "medical@cic.co.ke", activePatients: 32, status: "Under Review" },
];

const TPA = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold text-foreground">TPA Management</h1>
      <p className="text-muted-foreground text-sm">Manage Third Party Administrator relationships</p>
    </div>
    <Card>
      <CardContent className="pt-6">
        <table className="w-full text-sm">
          <thead><tr className="border-b text-left text-muted-foreground">
            <th className="pb-2 pr-4">TPA / Insurer</th><th className="pb-2 pr-4">Contact Person</th><th className="pb-2 pr-4">Phone</th>
            <th className="pb-2 pr-4">Email</th><th className="pb-2 pr-4">Active Patients</th><th className="pb-2">Status</th>
          </tr></thead>
          <tbody>{tpaList.map(t => (
            <tr key={t.name} className="border-b last:border-0">
              <td className="py-3 pr-4 font-medium">{t.name}</td><td className="py-3 pr-4">{t.contactPerson}</td>
              <td className="py-3 pr-4">{t.phone}</td><td className="py-3 pr-4 text-blue-600">{t.email}</td>
              <td className="py-3 pr-4">{t.activePatients}</td>
              <td className="py-3"><Badge variant={t.status === "Active" ? "default" : "secondary"}>{t.status}</Badge></td>
            </tr>
          ))}</tbody>
        </table>
      </CardContent>
    </Card>
  </div>
);

export default TPA;
