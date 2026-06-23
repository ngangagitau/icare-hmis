import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Activity, Server, Database, Wifi, Cpu, HardDrive } from "lucide-react";

const SystemHealth = () => {
  const metrics = [
    { name: "CPU Usage", value: 45, status: "Good", icon: Cpu, color: "text-green-600" },
    { name: "Memory Usage", value: 67, status: "Warning", icon: Server, color: "text-yellow-600" },
    { name: "Disk Usage", value: 78, status: "Critical", icon: HardDrive, color: "text-red-600" },
    { name: "Network Latency", value: 23, status: "Good", icon: Wifi, color: "text-green-600" },
    { name: "Database Load", value: 34, status: "Good", icon: Database, color: "text-green-600" },
  ];

  const services = [
    { name: "Web Server", status: "Online", uptime: "99.9%" },
    { name: "Database", status: "Online", uptime: "99.8%" },
    { name: "API Gateway", status: "Online", uptime: "99.7%" },
    { name: "Cache Service", status: "Degraded", uptime: "95.2%" },
    { name: "Backup Service", status: "Online", uptime: "100%" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold">System Health</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time monitoring of all system components and services.
          </p>
        </div>
        <Badge className="bg-green-500/10 text-green-600">
          <Activity className="h-3 w-3 mr-1" />
          All Systems Operational
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.name} className="shadow-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon className={`h-4 w-4 ${metric.color}`} />
                    <span className="text-sm font-medium">{metric.name}</span>
                  </div>
                  <Badge
                    className={`text-xs ${
                      metric.status === "Good"
                        ? "bg-green-500/10 text-green-600"
                        : metric.status === "Warning"
                        ? "bg-yellow-500/10 text-yellow-600"
                        : "bg-red-500/10 text-red-600"
                    }`}
                  >
                    {metric.status}
                  </Badge>
                </div>
                <Progress value={metric.value} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">{metric.value}%</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="shadow-card border-border">
        <CardHeader>
          <CardTitle>Service Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {services.map((service) => (
              <div key={service.name} className="flex items-center justify-between p-3 rounded-lg border border-border">
                <div>
                  <p className="font-medium">{service.name}</p>
                  <p className="text-xs text-muted-foreground">Uptime: {service.uptime}</p>
                </div>
                <Badge
                  className={
                    service.status === "Online"
                      ? "bg-green-500/10 text-green-600"
                      : "bg-yellow-500/10 text-yellow-600"
                  }
                >
                  {service.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-card border-border">
          <CardHeader>
            <CardTitle>Recent Alerts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/20">
              <Activity className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium">High Memory Usage</p>
                <p className="text-xs text-muted-foreground">Server memory at 85% - 2 minutes ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-red-500/5 border border-red-500/20">
              <Activity className="h-4 w-4 text-red-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Disk Space Critical</p>
                <p className="text-xs text-muted-foreground">Storage at 92% capacity - 5 minutes ago</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-border">
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Response Time</span>
              <span className="text-sm font-medium">245ms</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Active Users</span>
              <span className="text-sm font-medium">1,247</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Concurrent Sessions</span>
              <span className="text-sm font-medium">89</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Error Rate</span>
              <span className="text-sm font-medium text-green-600">0.02%</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SystemHealth;