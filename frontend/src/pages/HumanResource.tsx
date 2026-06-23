import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Users, Search, Plus, CalendarDays, DollarSign, Clock, UserCheck } from "lucide-react";

const employees = [
  { id: "EMP-001", name: "Dr. Jane Mwangi", department: "Medical", role: "Senior Doctor", status: "Active", joined: "2020-01-15" },
  { id: "EMP-002", name: "Alice Wambui", department: "Nursing", role: "Head Nurse", status: "Active", joined: "2019-06-01" },
  { id: "EMP-003", name: "James Ouma", department: "Pharmacy", role: "Pharmacist", status: "Active", joined: "2021-03-10" },
  { id: "EMP-004", name: "Peter Njoroge", department: "Lab", role: "Lab Technician", status: "On Leave", joined: "2022-08-20" },
  { id: "EMP-005", name: "Sarah Akinyi", department: "Admin", role: "HR Manager", status: "Active", joined: "2018-11-05" },
  { id: "EMP-006", name: "David Kipchoge", department: "IT", role: "Systems Admin", status: "Active", joined: "2023-01-15" },
];

const payrollSummary = [
  { item: "Basic Salary", amount: "KES 3,200,000" },
  { item: "Allowances", amount: "KES 480,000" },
  { item: "Overtime", amount: "KES 125,000" },
  { item: "PAYE", amount: "(KES 640,000)" },
  { item: "NSSF", amount: "(KES 68,000)" },
  { item: "NHIF/SHA", amount: "(KES 85,000)" },
  { item: "Net Pay", amount: "KES 3,012,000" },
];

const leaveRequests = [
  { employee: "Peter Njoroge", type: "Annual Leave", from: "2026-03-10", to: "2026-03-17", days: 5, status: "Approved" },
  { employee: "Alice Wambui", type: "Sick Leave", from: "2026-03-12", to: "2026-03-13", days: 2, status: "Pending" },
  { employee: "James Ouma", type: "Compassionate", from: "2026-03-15", to: "2026-03-18", days: 3, status: "Pending" },
];

const statusStyle: Record<string, string> = {
  Active: "bg-success/10 text-success border-success/20",
  "On Leave": "bg-warning/10 text-warning border-warning/20",
  Approved: "bg-success/10 text-success border-success/20",
  Pending: "bg-warning/10 text-warning border-warning/20",
};

const HumanResource = () => (
  <div className="space-y-6 animate-fade-in">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-heading font-bold">Human Resource & Payroll</h1>
        <p className="text-sm text-muted-foreground mt-1">Employee management, leave, attendance & payroll</p>
      </div>
      <Button className="gap-2"><Plus className="h-4 w-4" /> Add Employee</Button>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
      {[
        { label: "Total Staff", count: 86, icon: Users, color: "text-primary" },
        { label: "Present Today", count: 78, icon: UserCheck, color: "text-success" },
        { label: "On Leave", count: 5, icon: CalendarDays, color: "text-warning" },
        { label: "Payroll (Monthly)", count: "KES 3M", icon: DollarSign, color: "text-info" },
      ].map(s => (
        <Card key={s.label} className="shadow-card border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className={`h-10 w-10 rounded-lg bg-muted flex items-center justify-center ${s.color}`}>
              <s.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-heading font-bold">{s.count}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>

    <Tabs defaultValue="employees">
      <TabsList>
        <TabsTrigger value="employees">Employees</TabsTrigger>
        <TabsTrigger value="leave">Leave Requests</TabsTrigger>
        <TabsTrigger value="payroll">Payroll Summary</TabsTrigger>
      </TabsList>

      <TabsContent value="employees">
        <Card className="shadow-card border-border">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <CardTitle className="text-base font-heading">Staff Directory</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search staff..." className="pl-9 w-56" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {employees.map(emp => (
              <div key={emp.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border border-border gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary shrink-0">
                    {emp.name.split(" ").slice(-2).map(n => n[0]).join("")}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{emp.name}</p>
                    <p className="text-xs text-muted-foreground">{emp.id} · {emp.department} · {emp.role}</p>
                  </div>
                </div>
                <Badge variant="outline" className={`text-[11px] ${statusStyle[emp.status]}`}>{emp.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="leave">
        <Card className="shadow-card border-border">
          <CardContent className="pt-4 space-y-3">
            {leaveRequests.map((lr, i) => (
              <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border border-border gap-3">
                <div>
                  <p className="text-sm font-medium">{lr.employee}</p>
                  <p className="text-xs text-muted-foreground">{lr.type} · {lr.from} to {lr.to} · {lr.days} days</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={`text-[11px] ${statusStyle[lr.status]}`}>{lr.status}</Badge>
                  {lr.status === "Pending" && (
                    <>
                      <Button size="sm" className="h-7 text-xs">Approve</Button>
                      <Button size="sm" variant="outline" className="h-7 text-xs">Reject</Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="payroll">
        <Card className="shadow-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-heading">March 2026 Payroll</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <tbody>
                {payrollSummary.map(p => (
                  <tr key={p.item} className="border-b border-border last:border-0">
                    <td className={`py-3 ${p.item === "Net Pay" ? "font-bold text-primary" : ""}`}>{p.item}</td>
                    <td className={`py-3 text-right font-semibold ${p.item === "Net Pay" ? "text-primary text-lg" : p.amount.startsWith("(") ? "text-destructive" : ""}`}>{p.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Button className="w-full mt-4">Process Payroll</Button>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  </div>
);

export default HumanResource;
