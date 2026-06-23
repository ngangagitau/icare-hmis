import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Video, Clock, CheckCircle, Users } from "lucide-react";

const sessions = [
  { id: "TM-001", patient: "Mary Wanjiku", doctor: "Dr. Ochieng", time: "09:00", type: "Follow-up", status: "Completed" },
  { id: "TM-002", patient: "James Kamau", doctor: "Dr. Njeri", time: "10:30", type: "Consultation", status: "In Progress" },
  { id: "TM-003", patient: "Grace Akinyi", doctor: "Dr. Wambui", time: "11:00", type: "Lab Review", status: "Waiting" },
  { id: "TM-004", patient: "Peter Mwangi", doctor: "Dr. Ochieng", time: "14:00", type: "New Visit", status: "Scheduled" },
];

const statusColor: Record<string, string> = {
  Completed: "bg-green-100 text-green-800", "In Progress": "bg-blue-100 text-blue-800",
  Waiting: "bg-yellow-100 text-yellow-800", Scheduled: "bg-gray-100 text-gray-800",
};

const Telemedicine = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold text-foreground">Virtual Consultations</h1>
      <p className="text-muted-foreground text-sm">Telemedicine sessions and remote consultations</p>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[
        { label: "Sessions Today", value: "12", icon: Video, color: "text-purple-600" },
        { label: "In Progress", value: "1", icon: Clock, color: "text-blue-600" },
        { label: "Completed", value: "5", icon: CheckCircle, color: "text-green-600" },
        { label: "Waiting", value: "3", icon: Users, color: "text-yellow-600" },
      ].map(s => (
        <Card key={s.label}><CardContent className="p-4 flex items-center gap-3">
          <s.icon className={`h-8 w-8 ${s.color}`} /><div><p className="text-2xl font-bold">{s.value}</p><p className="text-xs text-muted-foreground">{s.label}</p></div>
        </CardContent></Card>
      ))}
    </div>
    <Card>
      <CardContent className="pt-6">
        <table className="w-full text-sm">
          <thead><tr className="border-b text-left text-muted-foreground">
            <th className="pb-2 pr-4">Session</th><th className="pb-2 pr-4">Patient</th><th className="pb-2 pr-4">Doctor</th>
            <th className="pb-2 pr-4">Time</th><th className="pb-2 pr-4">Type</th><th className="pb-2">Status</th>
          </tr></thead>
          <tbody>{sessions.map(s => (
            <tr key={s.id} className="border-b last:border-0">
              <td className="py-3 pr-4 font-mono">{s.id}</td><td className="py-3 pr-4 font-medium">{s.patient}</td>
              <td className="py-3 pr-4">{s.doctor}</td><td className="py-3 pr-4 font-mono">{s.time}</td>
              <td className="py-3 pr-4">{s.type}</td>
              <td className="py-3"><Badge className={statusColor[s.status]}>{s.status}</Badge></td>
            </tr>
          ))}</tbody>
        </table>
      </CardContent>
    </Card>
  </div>
);

export default Telemedicine;
