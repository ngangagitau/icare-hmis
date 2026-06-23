import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const postOpPatients = [
  { patient: "Peter Mwangi", procedure: "Appendectomy", recovery: "PACU", vitals: "Stable", pain: "4/10", time: "10:30", status: "Monitoring" },
  { patient: "Grace Akinyi", procedure: "C-Section", recovery: "Post-Natal Ward", vitals: "Stable", pain: "3/10", time: "11:15", status: "Transferred" },
  { patient: "James Odhiambo", procedure: "Hernia Repair", recovery: "PACU", vitals: "Stable", pain: "5/10", time: "14:00", status: "Monitoring" },
];

const PostOp = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold text-foreground">Post-Op Care</h1>
      <p className="text-muted-foreground text-sm">Post-operative monitoring and recovery tracking</p>
    </div>
    <Card>
      <CardHeader><CardTitle>Post-Op Patients</CardTitle></CardHeader>
      <CardContent>
        <table className="w-full text-sm">
          <thead><tr className="border-b text-left text-muted-foreground">
            <th className="pb-2 pr-4">Patient</th><th className="pb-2 pr-4">Procedure</th><th className="pb-2 pr-4">Location</th>
            <th className="pb-2 pr-4">Vitals</th><th className="pb-2 pr-4">Pain</th><th className="pb-2 pr-4">Time</th><th className="pb-2">Status</th>
          </tr></thead>
          <tbody>{postOpPatients.map((p, i) => (
            <tr key={i} className="border-b last:border-0">
              <td className="py-3 pr-4 font-medium">{p.patient}</td><td className="py-3 pr-4">{p.procedure}</td>
              <td className="py-3 pr-4">{p.recovery}</td><td className="py-3 pr-4">{p.vitals}</td>
              <td className="py-3 pr-4">{p.pain}</td><td className="py-3 pr-4 font-mono">{p.time}</td>
              <td className="py-3"><Badge variant="secondary">{p.status}</Badge></td>
            </tr>
          ))}</tbody>
        </table>
      </CardContent>
    </Card>
  </div>
);

export default PostOp;
