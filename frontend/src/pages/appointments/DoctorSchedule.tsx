import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const schedule = [
  { doctor: "Dr. Ochieng", department: "General", morning: 8, afternoon: 5, available: true },
  { doctor: "Dr. Njeri", department: "Pediatrics", morning: 6, afternoon: 4, available: true },
  { doctor: "Dr. Wambui", department: "Internal Medicine", morning: 7, afternoon: 0, available: false },
  { doctor: "Dr. Kipchoge", department: "Surgery", morning: 3, afternoon: 3, available: true },
  { doctor: "Dr. Muthoni", department: "Obs & Gyn", morning: 5, afternoon: 5, available: true },
];

const DoctorSchedule = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold text-foreground">Doctor Schedule</h1>
      <p className="text-muted-foreground text-sm">View doctor availability and appointment slots</p>
    </div>
    <Card>
      <CardHeader><CardTitle>Today's Availability</CardTitle></CardHeader>
      <CardContent>
        <table className="w-full text-sm">
          <thead><tr className="border-b text-left text-muted-foreground">
            <th className="pb-2 pr-4">Doctor</th><th className="pb-2 pr-4">Department</th>
            <th className="pb-2 pr-4">Morning Slots</th><th className="pb-2 pr-4">Afternoon Slots</th><th className="pb-2">Status</th>
          </tr></thead>
          <tbody>
            {schedule.map((d) => (
              <tr key={d.doctor} className="border-b last:border-0">
                <td className="py-3 pr-4 font-medium">{d.doctor}</td>
                <td className="py-3 pr-4">{d.department}</td>
                <td className="py-3 pr-4">{d.morning} booked</td>
                <td className="py-3 pr-4">{d.afternoon} booked</td>
                <td className="py-3">
                  <Badge className={d.available ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                    {d.available ? "Available" : "Off Duty"}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  </div>
);

export default DoctorSchedule;
