import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, AlertCircle, HeartPulse, Clock } from "lucide-react";

const emergencyCases = [
  { id: "E-001", patient: "John Ouma", age: 34, complaint: "Chest pain, shortness of breath", priority: "Red", time: "07:45", status: "Resuscitation", doctor: "Dr. Ochieng" },
  { id: "E-002", patient: "Alice Wanjiru", age: 28, complaint: "Severe abdominal pain", priority: "Orange", time: "08:10", status: "Assessment", doctor: "Dr. Njeri" },
  { id: "E-003", patient: "Tom Kiprono", age: 45, complaint: "Road traffic accident - multiple injuries", priority: "Red", time: "08:25", status: "Treatment", doctor: "Dr. Kipchoge" },
  { id: "E-004", patient: "Mary Adhiambo", age: 6, complaint: "High fever, convulsions", priority: "Orange", time: "08:40", status: "Assessment", doctor: "Dr. Njeri" },
  { id: "E-005", patient: "Samuel Mutua", age: 55, complaint: "Laceration on forearm", priority: "Yellow", time: "09:00", status: "Waiting", doctor: "Unassigned" },
];

const priorityColor: Record<string, string> = {
  Red: "bg-red-600 text-white", Orange: "bg-orange-500 text-white", Yellow: "bg-yellow-400 text-black", Green: "bg-green-500 text-white",
};

const Emergency = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold text-foreground">Emergency Dashboard</h1>
      <p className="text-muted-foreground text-sm">Real-time emergency department overview</p>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[
        { label: "Active Cases", value: "5", icon: Zap, color: "text-red-600" },
        { label: "Critical (Red)", value: "2", icon: AlertCircle, color: "text-red-500" },
        { label: "Urgent (Orange)", value: "2", icon: HeartPulse, color: "text-orange-500" },
        { label: "Avg Wait Time", value: "12 min", icon: Clock, color: "text-blue-600" },
      ].map((s) => (
        <Card key={s.label}><CardContent className="p-4 flex items-center gap-3">
          <s.icon className={`h-8 w-8 ${s.color}`} /><div><p className="text-2xl font-bold">{s.value}</p><p className="text-xs text-muted-foreground">{s.label}</p></div>
        </CardContent></Card>
      ))}
    </div>
    <Card>
      <CardHeader><CardTitle>Active Emergency Cases</CardTitle></CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left text-muted-foreground">
              <th className="pb-2 pr-4">Case ID</th><th className="pb-2 pr-4">Patient</th><th className="pb-2 pr-4">Age</th>
              <th className="pb-2 pr-4">Complaint</th><th className="pb-2 pr-4">Priority</th><th className="pb-2 pr-4">Time In</th>
              <th className="pb-2 pr-4">Status</th><th className="pb-2">Doctor</th>
            </tr></thead>
            <tbody>{emergencyCases.map((c) => (
              <tr key={c.id} className="border-b last:border-0">
                <td className="py-3 pr-4 font-mono">{c.id}</td><td className="py-3 pr-4 font-medium">{c.patient}</td>
                <td className="py-3 pr-4">{c.age}</td><td className="py-3 pr-4 max-w-[200px] truncate">{c.complaint}</td>
                <td className="py-3 pr-4"><Badge className={priorityColor[c.priority]}>{c.priority}</Badge></td>
                <td className="py-3 pr-4 font-mono">{c.time}</td><td className="py-3 pr-4">{c.status}</td><td className="py-3">{c.doctor}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  </div>
);

export default Emergency;
