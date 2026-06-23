import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

const history = [
  { date: "2026-03-12", patient: "Mary Wanjiku", doctor: "Dr. Ochieng", type: "Follow-up", status: "Completed" },
  { date: "2026-03-12", patient: "James Kamau", doctor: "Dr. Njeri", type: "New Visit", status: "Completed" },
  { date: "2026-03-11", patient: "Grace Akinyi", doctor: "Dr. Wambui", type: "Consultation", status: "No Show" },
  { date: "2026-03-11", patient: "Peter Mwangi", doctor: "Dr. Ochieng", type: "Lab Review", status: "Completed" },
  { date: "2026-03-10", patient: "Sarah Otieno", doctor: "Dr. Njeri", type: "Follow-up", status: "Cancelled" },
];

const statusColor: Record<string, string> = {
  Completed: "bg-green-100 text-green-800",
  "No Show": "bg-red-100 text-red-800",
  Cancelled: "bg-gray-100 text-gray-800",
};

const AppointmentHistory = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold text-foreground">Appointment History</h1>
      <p className="text-muted-foreground text-sm">View past appointments and outcomes</p>
    </div>
    <div className="flex gap-3">
      <Input placeholder="Search patient..." className="max-w-sm" />
      <Input type="date" className="max-w-[180px]" />
    </div>
    <Card>
      <CardContent className="pt-6">
        <table className="w-full text-sm">
          <thead><tr className="border-b text-left text-muted-foreground">
            <th className="pb-2 pr-4">Date</th><th className="pb-2 pr-4">Patient</th><th className="pb-2 pr-4">Doctor</th>
            <th className="pb-2 pr-4">Type</th><th className="pb-2">Status</th>
          </tr></thead>
          <tbody>
            {history.map((h, i) => (
              <tr key={i} className="border-b last:border-0">
                <td className="py-3 pr-4">{h.date}</td>
                <td className="py-3 pr-4 font-medium">{h.patient}</td>
                <td className="py-3 pr-4">{h.doctor}</td>
                <td className="py-3 pr-4">{h.type}</td>
                <td className="py-3"><Badge className={statusColor[h.status]}>{h.status}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  </div>
);

export default AppointmentHistory;
