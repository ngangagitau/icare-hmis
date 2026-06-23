import { useState, useEffect } from "react";
import { Users, Clock, CreditCard, Activity, TrendingUp, TrendingDown, ArrowUpRight, AlertCircle, CheckCircle2, Wind, Zap, Plus, Phone, MessageSquare, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import apiClient from "@/lib/api";

interface DashboardStats {
  totalPatients: number;
  patientsInQueue: number;
  revenueToday: number;
  bedOccupancy: number;
}

interface PatientActivity {
  id: string;
  name: string;
  department: string;
  status: string;
  timestamp: string;
}

interface Alert {
  id: string;
  type: "critical" | "warning" | "success";
  title: string;
  description: string;
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentPatients, setRecentPatients] = useState<PatientActivity[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch dashboard stats
      const statsResponse = await apiClient.get<DashboardStats>("/dashboard/stats");
      setStats(statsResponse);

      // Fetch recent patient activity
      try {
        const patientsResponse = await apiClient.get<PatientActivity[]>("/patients?limit=5");
        setRecentPatients(Array.isArray(patientsResponse) ? patientsResponse : []);
      } catch (err) {
        console.error("Failed to fetch recent patients:", err);
        setRecentPatients([]);
      }

      // Fetch alerts (if endpoint exists)
      try {
        const alertsResponse = await apiClient.get<Alert[]>("/alerts?priority=high");
        setAlerts(Array.isArray(alertsResponse) ? alertsResponse : []);
      } catch (err) {
        console.error("Failed to fetch alerts:", err);
        setAlerts([]);
      }
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { label: "New Patient", icon: Plus, color: "from-primary" },
    { label: "Schedule Appointment", icon: Calendar, color: "from-info" },
    { label: "Send Message", icon: MessageSquare, color: "from-success" },
    { label: "Emergency Call", icon: Phone, color: "from-destructive" },
  ];

  const performanceMetrics = [
    { label: "Avg. Wait Time", value: "18 min", change: "-2 min", status: "improving" },
    { label: "Patient Satisfaction", value: "4.7/5", change: "+0.3", status: "improving" },
    { label: "Treatment Success", value: "94%", change: "+2%", status: "improving" },
    { label: "Referral Rate", value: "12%", change: "-1%", status: "improving" },
  ];

  const statusColor: Record<string, string> = {
    "In Queue": "bg-warning/10 text-warning border-warning/20",
    "Awaiting Results": "bg-info/10 text-info border-info/20",
    "Dispensing": "bg-primary/10 text-primary border-primary/20",
    "In Progress": "bg-accent text-accent-foreground",
    "Consultation": "bg-success/10 text-success border-success/20",
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading dashboard data...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Welcome back — here's today's overview.</p>
        </div>
        <div className="text-right text-xs text-muted-foreground">
          <p>Last updated: Just now</p>
          <p>System Status: <span className="text-success font-semibold">Operational</span></p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats && [
          { label: "Total Patients Today", value: stats.totalPatients, change: "+12%", trend: "up", icon: Users, color: "text-primary" },
          { label: "In Queue", value: stats.patientsInQueue, change: "5 urgent", trend: "up", icon: Clock, color: "text-warning" },
          { label: "Revenue Today", value: `KES ${stats.revenueToday?.toLocaleString()}`, change: "+8.2%", trend: "up", icon: CreditCard, color: "text-success" },
          { label: "Bed Occupancy", value: `${stats.bedOccupancy}%`, change: "-2%", trend: "down", icon: Activity, color: "text-info" },
        ].map((stat) => (
          <Card key={stat.label} className="shadow-card border-border hover:shadow-lg transition-all duration-200">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{stat.label}</p>
                  <p className="text-2xl font-heading font-bold mt-1">{stat.value}</p>
                </div>
                <div className={`h-10 w-10 rounded-lg bg-muted flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-3">
                {stat.trend === "up" ? (
                  <TrendingUp className="h-3.5 w-3.5 text-success" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5 text-destructive" />
                )}
                <span className={`text-xs font-medium ${stat.trend === "up" ? "text-success" : "text-destructive"}`}>
                  {stat.change}
                </span>
                <span className="text-xs text-muted-foreground">vs yesterday</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {quickActions.map((action) => (
          <button
            key={action.label}
            className="group p-4 rounded-lg border border-border bg-card hover:shadow-md hover:border-primary/30 hover:scale-105 active:scale-95 transition-all duration-200"
          >
            <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${action.color} to-transparent opacity-10 group-hover:opacity-20 flex items-center justify-center mb-2 transition-opacity`}>
              <action.icon className={`h-5 w-5`} />
            </div>
            <p className="text-xs font-semibold text-foreground/80 group-hover:text-foreground transition-colors">{action.label}</p>
          </button>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column - Charts and Activity */}
        <div className="lg:col-span-2 space-y-4">
          {/* Performance Metrics */}
          <Card className="shadow-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-heading">Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {performanceMetrics.map((metric) => (
                  <div key={metric.label} className="p-3 rounded-lg bg-muted/50 border border-border/50">
                    <p className="text-xs text-muted-foreground font-medium">{metric.label}</p>
                    <p className="text-xl font-heading font-bold mt-1">{metric.value}</p>
                    <p className="text-xs text-success mt-1 flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" /> {metric.change}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Patient Activity */}
          <Card className="shadow-card border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-heading">Recent Patient Activity</CardTitle>
                <a href="#" className="text-xs text-primary hover:text-primary/80 font-semibold transition-colors">View All</a>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentPatients.length > 0 ? (
                  recentPatients.map((p) => (
                    <div key={p.id} className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary shrink-0">
                          {p.name.split(" ").map(n => n[0]).join("")}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{p.name}</p>
                          <p className="text-xs text-muted-foreground">{p.id} · {p.department}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className={`text-[11px] ${statusColor[p.status] || ""}`}>
                          {p.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground hidden sm:block">{p.timestamp}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No recent patient activity</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Alerts and Queue */}
        <div className="space-y-4">
          {/* Alerts Panel */}
          <Card className="shadow-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-heading">Active Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alerts.length > 0 ? (
                  alerts.map((alert) => {
                    const IconComponent = alert.type === "critical" ? AlertCircle : alert.type === "warning" ? AlertCircle : CheckCircle2;
                    return (
                      <div
                        key={alert.id}
                        className={`p-3 rounded-lg border-l-4 ${
                          alert.type === "critical"
                            ? "bg-destructive/5 border-destructive/30"
                            : alert.type === "warning"
                            ? "bg-warning/5 border-warning/30"
                            : "bg-success/5 border-success/30"
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <IconComponent
                            className={`h-4 w-4 mt-0.5 shrink-0 ${
                              alert.type === "critical"
                                ? "text-destructive"
                                : alert.type === "warning"
                                ? "text-warning"
                                : "text-success"
                            }`}
                          />
                          <div className="flex-1">
                            <p className="text-xs font-semibold text-foreground">{alert.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{alert.description}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No active alerts</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Department Queue */}
          <Card className="shadow-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-heading">Department Queue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { dept: "Outpatient", count: 12, color: "bg-primary" },
                  { dept: "Laboratory", count: 8, color: "bg-info" },
                  { dept: "Pharmacy", count: 5, color: "bg-success" },
                  { dept: "Radiology", count: 3, color: "bg-warning" },
                  { dept: "Triage", count: 7, color: "bg-destructive" },
                ].map((d) => (
                  <div key={d.dept}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className={`h-2.5 w-2.5 rounded-full ${d.color}`} />
                        <span className="text-sm font-medium">{d.dept}</span>
                      </div>
                      <span className="text-xs font-bold text-foreground">{d.count}</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                      <div className={`h-full rounded-full ${d.color} transition-all`} style={{ width: `${(d.count / 15) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
