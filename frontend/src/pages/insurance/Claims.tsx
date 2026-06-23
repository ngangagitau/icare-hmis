import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const claims = [
  { id: "CL-001", patient: "Mary Wanjiku", insurer: "SHA", amount: "KES 25,000", submitted: "2026-03-10", status: "Approved" },
  { id: "CL-002", patient: "James Kamau", insurer: "AAR", amount: "KES 85,000", submitted: "2026-03-08", status: "Under Review" },
  { id: "CL-003", patient: "Grace Akinyi", insurer: "Jubilee", amount: "KES 120,000", submitted: "2026-03-05", status: "Rejected" },
  { id: "CL-004", patient: "Peter Mwangi", insurer: "Britam", amount: "KES 45,000", submitted: "2026-03-12", status: "Submitted" },
  { id: "CL-005", patient: "Sarah Otieno", insurer: "SHA", amount: "KES 18,000", submitted: "2026-03-11", status: "Paid" },
];

const statusColor: Record<string, string> = {
  Approved: "bg-green-100 text-green-800", "Under Review": "bg-yellow-100 text-yellow-800",
  Rejected: "bg-red-100 text-red-800", Submitted: "bg-blue-100 text-blue-800", Paid: "bg-emerald-100 text-emerald-800",
};

const InsuranceClaims = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold text-foreground">Claim Submission</h1>
      <p className="text-muted-foreground text-sm">Submit and manage insurance claims</p>
    </div>
    <Card>
      <CardContent className="pt-6">
        <table className="w-full text-sm">
          <thead><tr className="border-b text-left text-muted-foreground">
            <th className="pb-2 pr-4">Claim ID</th><th className="pb-2 pr-4">Patient</th><th className="pb-2 pr-4">Insurer</th>
            <th className="pb-2 pr-4">Amount</th><th className="pb-2 pr-4">Submitted</th><th className="pb-2">Status</th>
          </tr></thead>
          <tbody>{claims.map(c => (
            <tr key={c.id} className="border-b last:border-0">
              <td className="py-3 pr-4 font-mono">{c.id}</td><td className="py-3 pr-4 font-medium">{c.patient}</td>
              <td className="py-3 pr-4">{c.insurer}</td><td className="py-3 pr-4 font-medium">{c.amount}</td>
              <td className="py-3 pr-4">{c.submitted}</td>
              <td className="py-3"><Badge className={statusColor[c.status]}>{c.status}</Badge></td>
            </tr>
          ))}</tbody>
        </table>
      </CardContent>
    </Card>
  </div>
);

export default InsuranceClaims;
