import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Scissors, Clock, CheckCircle, CalendarDays } from "lucide-react";

const otSchedule = [
  { time: "08:00", patient: "Peter Mwangi", procedure: "Appendectomy", surgeon: "Dr. Kipchoge", anaesthetist: "Dr. Otieno", ot: "OT-1", status: "In Progress", duration: "1.5 hrs" },
  { time: "10:00", patient: "Grace Akinyi", procedure: "Cesarean Section", surgeon: "Dr. Muthoni", anaesthetist: "Dr. Otieno", ot: "OT-2", status: "Prep", duration: "1 hr" },
  { time: "11:30", patient: "James Odhiambo", procedure: "Hernia Repair", surgeon: "Dr. Kipchoge", anaesthetist: "Dr. Wanjiku", ot: "OT-1", status: "Scheduled", duration: "2 hrs" },
  { time: "14:00", patient: "Susan Njeri", procedure: "Knee Arthroscopy", surgeon: "Dr. Kamau", anaesthetist: "Dr. Wanjiku", ot: "OT-3", status: "Scheduled", duration: "1.5 hrs" },
];

const Theatre = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold text-foreground">OT Schedule</h1>
      <p className="text-muted-foreground text-sm">Operation Theatre management and scheduling</p>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[
        { label: "Surgeries Today", value: "8", icon: Scissors, color: "text-pink-600" },
        { label: "In Progress", value: "1", icon: Clock, color: "text-blue-600" },
        { label: "Completed", value: "3", icon: CheckCircle, color: "text-green-600" },
        { label: "Scheduled", value: "4", icon: CalendarDays, color: "text-purple-600" },
      ].map(s => (
        <Card key={s.label}><CardContent className="p-4 flex items-center gap-3">
          <s.icon className={`h-8 w-8 ${s.color}`} /><div><p className="text-2xl font-bold">{s.value}</p><p className="text-xs text-muted-foreground">{s.label}</p></div>
        </CardContent></Card>
      ))}
    </div>
    <Card>
      <CardHeader><CardTitle>Today's OT Schedule</CardTitle></CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left text-muted-foreground">
              <th className="pb-2 pr-4">Time</th><th className="pb-2 pr-4">Patient</th><th className="pb-2 pr-4">Procedure</th>
              <th className="pb-2 pr-4">Surgeon</th><th className="pb-2 pr-4">Anaesthetist</th><th className="pb-2 pr-4">OT</th>
              <th className="pb-2 pr-4">Duration</th><th className="pb-2">Status</th>
            </tr></thead>
            <tbody>{otSchedule.map((s, i) => (
              <tr key={i} className="border-b last:border-0">
                <td className="py-3 pr-4 font-mono">{s.time}</td><td className="py-3 pr-4 font-medium">{s.patient}</td>
                <td className="py-3 pr-4">{s.procedure}</td><td className="py-3 pr-4">{s.surgeon}</td>
                <td className="py-3 pr-4">{s.anaesthetist}</td><td className="py-3 pr-4">{s.ot}</td>
                <td className="py-3 pr-4">{s.duration}</td>
                <td className="py-3"><Badge variant={s.status === "In Progress" ? "default" : "secondary"}>{s.status}</Badge></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  </div>
);

export default Theatre;
