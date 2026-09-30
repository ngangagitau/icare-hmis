import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, BarChart3, DollarSign, HeartPulse, TrendingUp } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const monthlyData = [
  { month: "Jan", patients: 1180, revenue: 440000, discharges: 980 },
  { month: "Feb", patients: 1260, revenue: 495000, discharges: 1040 },
  { month: "Mar", patients: 1320, revenue: 518000, discharges: 1095 },
  { month: "Apr", patients: 1470, revenue: 562000, discharges: 1160 },
  { month: "May", patients: 1540, revenue: 603000, discharges: 1265 },
  { month: "Jun", patients: 1665, revenue: 648000, discharges: 1390 },
];

const departmentData = [
  { name: "OPD", value: 38 },
  { name: "IPD", value: 24 },
  { name: "Lab", value: 16 },
  { name: "Pharmacy", value: 14 },
  { name: "Radiology", value: 8 },
];

const COLORS = ["#0ea5e9", "#10b981", "#f59e0b", "#a78bfa", "#f97316"];

const overviewStats = [
  { label: "Patient Volume", value: "1,665", delta: "+12.8%", icon: Activity, tone: "text-primary" },
  { label: "Revenue", value: "KES 648K", delta: "+9.4%", icon: DollarSign, tone: "text-success" },
  { label: "Avg. LOS", value: "3.8 days", delta: "-0.6 days", icon: HeartPulse, tone: "text-warning" },
  { label: "Productivity", value: "94%", delta: "+2.3%", icon: BarChart3, tone: "text-info" },
];

export default function Analytics() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Operational analytics</p>
          <h1 className="text-3xl font-heading font-bold text-foreground">Performance Analytics</h1>
        </div>

        <Badge variant="outline" className="w-fit border-success/30 bg-success/10 text-success">
          <TrendingUp className="mr-1 h-3.5 w-3.5" />
          Performance improving
        </Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {overviewStats.map(({ label, value, delta, icon: Icon, tone }) => (
          <Card key={label} className="border-border shadow-card">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
                  <p className="mt-3 text-2xl font-heading font-bold text-foreground">{value}</p>
                </div>

                <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-muted ${tone}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>

              <p className="mt-4 text-xs font-medium text-success">{delta} vs previous month</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-heading">Monthly patient volume</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                  }}
                />
                <Bar dataKey="patients" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-heading">Revenue trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" tickLine={false} axisLine={false} />
                <Tooltip
                  formatter={(value) => [`KES ${Number(value).toLocaleString()}`, "Revenue"]}
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} name="Revenue" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border shadow-card lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-heading">Department contribution</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={departmentData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={88} paddingAngle={2}>
                    {departmentData.map((entry, index) => (
                      <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`${value}%`, "Share"]}
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e2e8f0",
                      borderRadius: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-3">
              {departmentData.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between rounded-lg border border-border bg-muted/40 p-3">
                  <div className="flex items-center gap-3">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="text-sm font-medium text-foreground">{item.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-foreground">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
