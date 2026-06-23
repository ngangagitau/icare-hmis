import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const issues = [
  { id: "BI-001", patient: "Tom Kiprono", group: "B+", component: "Packed RBC", units: 2, requestedBy: "Dr. Kipchoge", purpose: "Surgery", status: "Issued" },
  { id: "BI-002", patient: "Mary Wambui", group: "A+", component: "Platelets", units: 1, requestedBy: "Dr. Njeri", purpose: "Thrombocytopenia", status: "Pending" },
  { id: "BI-003", patient: "John Ouma", group: "O+", component: "Whole Blood", units: 1, requestedBy: "Dr. Ochieng", purpose: "Emergency", status: "Issued" },
];

const BloodIssue = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold text-foreground">Blood Issue</h1>
      <p className="text-muted-foreground text-sm">Issue blood products to patients</p>
    </div>
    <Card>
      <CardContent className="pt-6">
        <table className="w-full text-sm">
          <thead><tr className="border-b text-left text-muted-foreground">
            <th className="pb-2 pr-4">Issue ID</th><th className="pb-2 pr-4">Patient</th><th className="pb-2 pr-4">Group</th>
            <th className="pb-2 pr-4">Component</th><th className="pb-2 pr-4">Units</th><th className="pb-2 pr-4">Doctor</th>
            <th className="pb-2 pr-4">Purpose</th><th className="pb-2">Status</th>
          </tr></thead>
          <tbody>{issues.map(i => (
            <tr key={i.id} className="border-b last:border-0">
              <td className="py-3 pr-4 font-mono">{i.id}</td><td className="py-3 pr-4 font-medium">{i.patient}</td>
              <td className="py-3 pr-4 font-bold">{i.group}</td><td className="py-3 pr-4">{i.component}</td>
              <td className="py-3 pr-4">{i.units}</td><td className="py-3 pr-4">{i.requestedBy}</td>
              <td className="py-3 pr-4">{i.purpose}</td>
              <td className="py-3"><Badge variant={i.status === "Issued" ? "default" : "secondary"}>{i.status}</Badge></td>
            </tr>
          ))}</tbody>
        </table>
      </CardContent>
    </Card>
  </div>
);

export default BloodIssue;
