import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cpu, Monitor, ShieldCheck } from "lucide-react";

const inventory = [
  { item: "Desktop Workstations", count: 42, status: "Healthy" },
  { item: "Servers", count: 8, status: "Maintenance" },
  { item: "Network Switches", count: 26, status: "Healthy" },
  { item: "Wi-Fi Access Points", count: 18, status: "Healthy" },
];

const statusStyle: Record<string, string> = {
  Healthy: "bg-success/10 text-success",
  Maintenance: "bg-warning/10 text-warning",
};

const Hardware = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold">Hardware Inventory</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Review the status of critical infrastructure and technical assets.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="shadow-card border-border">
          <CardContent className="p-4 flex items-center gap-4">
            <Cpu className="h-6 w-6 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Active Devices</p>
              <p className="text-3xl font-heading font-bold">94</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card border-border">
          <CardContent className="p-4 flex items-center gap-4">
            <Monitor className="h-6 w-6 text-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Systems Under Warranty</p>
              <p className="text-3xl font-heading font-bold">58</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card border-border">
          <CardContent className="p-4 flex items-center gap-4">
            <ShieldCheck className="h-6 w-6 text-success" />
            <div>
              <p className="text-sm text-muted-foreground">Critical Issues</p>
              <p className="text-3xl font-heading font-bold">2</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-card border-border">
        <CardHeader>
          <CardTitle>Hardware Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {inventory.map((item) => (
            <div key={item.item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-border p-4">
              <div>
                <p className="font-semibold">{item.item}</p>
                <p className="text-xs text-muted-foreground">{item.count} units</p>
              </div>
              <Badge className={statusStyle[item.status]}>{item.status}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default Hardware;
