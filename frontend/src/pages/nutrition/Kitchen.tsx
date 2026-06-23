import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const KitchenManagement = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold text-foreground">Kitchen Management</h1>
      <p className="text-muted-foreground text-sm">Kitchen operations and food service management</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[
        { meal: "Breakfast", total: 40, served: 40, time: "06:30 - 08:00" },
        { meal: "Mid-Morning Snack", total: 25, served: 25, time: "10:00 - 10:30" },
        { meal: "Lunch", total: 40, served: 15, time: "12:00 - 13:30" },
        { meal: "Dinner", total: 40, served: 0, time: "18:00 - 19:30" },
      ].map(m => (
        <Card key={m.meal}>
          <CardHeader className="pb-2"><CardTitle className="text-base">{m.meal}</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <p className="text-xs text-muted-foreground">{m.time}</p>
            <div className="flex justify-between text-sm"><span>Progress</span><span>{m.served}/{m.total} served</span></div>
            <Progress value={(m.served / m.total) * 100} />
          </CardContent>
        </Card>
      ))}
    </div>
    <Card>
      <CardHeader><CardTitle>Kitchen Inventory Alerts</CardTitle></CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          {["Rice stock low - 5kg remaining", "Fresh milk expiring tomorrow - 10L", "Cooking oil needs reorder", "Special diet ingredients (gluten-free flour) running low"].map((a, i) => (
            <div key={i} className="flex items-center gap-2 p-2 bg-yellow-50 rounded text-yellow-800">⚠️ {a}</div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

export default KitchenManagement;
