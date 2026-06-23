import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const otUtilization = [
  { name: "OT-1 (General)", scheduled: 6, completed: 4, utilization: 78, nextAvailable: "14:00" },
  { name: "OT-2 (Obstetric)", scheduled: 4, completed: 3, utilization: 85, nextAvailable: "12:30" },
  { name: "OT-3 (Orthopedic)", scheduled: 3, completed: 1, utilization: 45, nextAvailable: "11:00" },
  { name: "OT-4 (Minor)", scheduled: 8, completed: 5, utilization: 62, nextAvailable: "13:00" },
];

const OTUtilization = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold text-foreground">OT Utilization</h1>
      <p className="text-muted-foreground text-sm">Theatre usage statistics and capacity</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {otUtilization.map(ot => (
        <Card key={ot.name}>
          <CardHeader className="pb-2"><CardTitle className="text-base">{ot.name}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm"><span>Utilization</span><span className="font-bold">{ot.utilization}%</span></div>
            <Progress value={ot.utilization} />
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><span className="text-muted-foreground">Scheduled:</span> {ot.scheduled}</div>
              <div><span className="text-muted-foreground">Completed:</span> {ot.completed}</div>
              <div className="col-span-2"><span className="text-muted-foreground">Next Available:</span> {ot.nextAvailable}</div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

export default OTUtilization;
