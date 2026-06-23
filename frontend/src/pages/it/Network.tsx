import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wifi, Server, AlertTriangle } from "lucide-react";

const networkMetrics = [
  { label: "Uptime", value: "99.97%", icon: Server },
  { label: "Latency", value: "16ms", icon: Wifi },
  { label: "Alerts", value: "3", icon: AlertTriangle },
];

const endpoints = [
  { name: "Gateway", status: "Online" },
  { name: "VPN Server", status: "Online" },
  { name: "Wi-Fi Portal", status: "Degraded" },
  { name: "Backup Link", status: "Offline" },
];

const statusStyle: Record<string, string> = {
  Online: "bg-success/10 text-success",
  Degraded: "bg-warning/10 text-warning",
  Offline: "bg-destructive/10 text-destructive",
};

const Network = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold">Network Monitoring</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor infrastructure health and connectivity across the hospital network.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {networkMetrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.label} className="shadow-card border-border">
              <CardContent className="p-4 flex items-center gap-4">
                <Icon className="h-6 w-6 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">{metric.label}</p>
                  <p className="text-3xl font-heading font-bold">{metric.value}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="shadow-card border-border">
        <CardHeader>
          <CardTitle>Endpoint Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {endpoints.map((endpoint) => (
            <div key={endpoint.name} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-border p-4">
              <div>
                <p className="font-semibold">{endpoint.name}</p>
              </div>
              <Badge className={statusStyle[endpoint.status]}>{endpoint.status}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default Network;
