import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Shield, Search, Plus, Users, Key, FileText, Settings, Clock } from "lucide-react";

const users = [
  { id: "USR-001", name: "Dr. Jane Mwangi", username: "jane.mwangi", role: "Doctor", group: "Clinical Staff", lastLogin: "2026-03-10 08:30", status: "Active" },
  { id: "USR-002", name: "Alice Wambui", username: "alice.wambui", role: "Nurse", group: "Nursing Staff", lastLogin: "2026-03-10 07:15", status: "Active" },
  { id: "USR-003", name: "James Ouma", username: "james.ouma", role: "Pharmacist", group: "Pharmacy Staff", lastLogin: "2026-03-10 08:00", status: "Active" },
  { id: "USR-004", name: "Sarah Akinyi", username: "sarah.akinyi", role: "Admin", group: "Administrators", lastLogin: "2026-03-10 09:00", status: "Active" },
  { id: "USR-005", name: "Peter Njoroge", username: "peter.njoroge", role: "Lab Tech", group: "Lab Staff", lastLogin: "2026-03-08 16:00", status: "Inactive" },
];

const userGroups = [
  { name: "Administrators", members: 3, permissions: "Full Access", modules: "All Modules" },
  { name: "Clinical Staff", members: 12, permissions: "Clinical Read/Write", modules: "Doctor, Triage, Lab, Radiology, Pharmacy" },
  { name: "Nursing Staff", members: 18, permissions: "Nursing Read/Write", modules: "Triage, In-Patient, Doctor (Read)" },
  { name: "Pharmacy Staff", members: 5, permissions: "Pharmacy Read/Write", modules: "Pharmacy, Inventory" },
  { name: "Lab Staff", members: 8, permissions: "Lab Read/Write", modules: "Laboratory, Radiology" },
  { name: "Finance Staff", members: 6, permissions: "Finance Read/Write", modules: "Billing, GL, AR, AP, Assets" },
  { name: "HR Staff", members: 3, permissions: "HR Read/Write", modules: "HR, Payroll" },
];

const auditLog = [
  { timestamp: "2026-03-10 09:45:23", user: "Dr. Jane Mwangi", action: "Updated", module: "Doctor", detail: "Modified prescription for P-10234", field: "drugs.dosage" },
  { timestamp: "2026-03-10 09:30:12", user: "Alice Wambui", action: "Created", module: "Triage", detail: "Recorded vitals for P-10236", field: "vitals.bp" },
  { timestamp: "2026-03-10 09:15:05", user: "James Ouma", action: "Dispensed", module: "Pharmacy", detail: "Dispensed RX-3019", field: "prescription.status" },
  { timestamp: "2026-03-10 08:50:44", user: "Sarah Akinyi", action: "Modified", module: "Admin", detail: "Updated user group permissions", field: "group.permissions" },
  { timestamp: "2026-03-10 08:30:00", user: "System", action: "Login", module: "Auth", detail: "User jane.mwangi logged in", field: "—" },
];

const statusStyle: Record<string, string> = {
  Active: "bg-success/10 text-success border-success/20",
  Inactive: "bg-muted text-muted-foreground",
};

const Administration = () => (
  <div className="space-y-6 animate-fade-in">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-heading font-bold">Administration & Security</h1>
        <p className="text-sm text-muted-foreground mt-1">User management, roles, permissions & audit trail</p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" className="gap-2"><Settings className="h-4 w-4" /> System Settings</Button>
        <Button className="gap-2"><Plus className="h-4 w-4" /> Add User</Button>
      </div>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
      {[
        { label: "Total Users", count: 86, icon: Users, color: "text-primary" },
        { label: "User Groups", count: 7, icon: Key, color: "text-info" },
        { label: "Active Sessions", count: 34, icon: Shield, color: "text-success" },
        { label: "Audit Events (24h)", count: 1248, icon: FileText, color: "text-warning" },
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

    <Tabs defaultValue="users">
      <TabsList>
        <TabsTrigger value="users">Users</TabsTrigger>
        <TabsTrigger value="groups">User Groups</TabsTrigger>
        <TabsTrigger value="audit">Audit Trail</TabsTrigger>
      </TabsList>

      <TabsContent value="users">
        <Card className="shadow-card border-border">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <CardTitle className="text-base font-heading">User Accounts</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search users..." className="pl-9 w-56" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {users.map(u => (
              <div key={u.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border border-border gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary shrink-0">
                    {u.name.split(" ").slice(-2).map(n => n[0]).join("")}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{u.name} <span className="text-muted-foreground">(@{u.username})</span></p>
                    <p className="text-xs text-muted-foreground">{u.role} · {u.group} · Last login: {u.lastLogin}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-12 sm:ml-0">
                  <Badge variant="outline" className={`text-[11px] ${statusStyle[u.status]}`}>{u.status}</Badge>
                  <Button size="sm" variant="outline" className="h-7 text-xs">Edit</Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="groups">
        <Card className="shadow-card border-border">
          <CardContent className="pt-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="pb-3 font-medium text-muted-foreground">Group</th>
                  <th className="pb-3 font-medium text-muted-foreground text-center">Members</th>
                  <th className="pb-3 font-medium text-muted-foreground">Permissions</th>
                  <th className="pb-3 font-medium text-muted-foreground">Modules</th>
                  <th className="pb-3 font-medium text-muted-foreground text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {userGroups.map(g => (
                  <tr key={g.name} className="border-b border-border last:border-0">
                    <td className="py-3 font-medium">{g.name}</td>
                    <td className="py-3 text-center">{g.members}</td>
                    <td className="py-3 text-muted-foreground">{g.permissions}</td>
                    <td className="py-3 text-xs text-muted-foreground">{g.modules}</td>
                    <td className="py-3 text-right">
                      <Button size="sm" variant="outline" className="h-7 text-xs">Configure</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="audit">
        <Card className="shadow-card border-border">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <CardTitle className="text-base font-heading">Audit Trail (Field-Level)</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search audit log..." className="pl-9 w-56" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="pb-3 font-medium text-muted-foreground">Timestamp</th>
                  <th className="pb-3 font-medium text-muted-foreground">User</th>
                  <th className="pb-3 font-medium text-muted-foreground">Action</th>
                  <th className="pb-3 font-medium text-muted-foreground">Module</th>
                  <th className="pb-3 font-medium text-muted-foreground">Detail</th>
                  <th className="pb-3 font-medium text-muted-foreground">Field</th>
                </tr>
              </thead>
              <tbody>
                {auditLog.map((a, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td className="py-3 text-xs text-muted-foreground whitespace-nowrap"><Clock className="inline h-3 w-3 mr-1" />{a.timestamp}</td>
                    <td className="py-3 font-medium">{a.user}</td>
                    <td className="py-3"><Badge variant="outline" className="text-[11px]">{a.action}</Badge></td>
                    <td className="py-3 text-muted-foreground">{a.module}</td>
                    <td className="py-3 text-muted-foreground">{a.detail}</td>
                    <td className="py-3 text-xs font-mono text-muted-foreground">{a.field}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  </div>
);

export default Administration;
