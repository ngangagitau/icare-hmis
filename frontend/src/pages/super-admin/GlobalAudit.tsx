import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollText, Search, Filter, Download, Eye } from "lucide-react";

const GlobalAudit = () => {
  const auditLogs = [
    {
      id: "AUD-001",
      timestamp: "2026-04-15 14:30:22",
      user: "Super Admin",
      action: "EMERGENCY_ACCESS",
      module: "Super Admin",
      details: "Activated God Mode",
      severity: "Critical"
    },
    {
      id: "AUD-002",
      timestamp: "2026-04-15 14:25:15",
      user: "Dr. Johnson",
      action: "UPDATE",
      module: "EMR",
      details: "Modified patient record P-10234",
      severity: "High"
    },
    {
      id: "AUD-003",
      timestamp: "2026-04-15 14:20:08",
      user: "Nurse Sarah",
      action: "CREATE",
      module: "Triage",
      details: "Added vital signs for patient P-10236",
      severity: "Medium"
    },
    {
      id: "AUD-004",
      timestamp: "2026-04-15 14:15:45",
      user: "Admin Lucy",
      action: "DELETE",
      module: "User Management",
      details: "Removed user account U-0456",
      severity: "High"
    },
    {
      id: "AUD-005",
      timestamp: "2026-04-15 14:10:12",
      user: "Super Admin",
      action: "SYSTEM_MAINTENANCE",
      module: "Super Admin",
      details: "Initiated system backup",
      severity: "Critical"
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Critical": return "bg-red-500/10 text-red-600 border-red-500/20";
      case "High": return "bg-orange-500/10 text-orange-600 border-orange-500/20";
      case "Medium": return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
      default: return "bg-gray-500/10 text-gray-600 border-gray-500/20";
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold">Global Audit Trail</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Complete system-wide audit log of all user actions and system events.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search audit logs..."
            className="pl-9"
          />
        </div>
        <Select>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severities</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
        <Select>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Module" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Modules</SelectItem>
            <SelectItem value="super-admin">Super Admin</SelectItem>
            <SelectItem value="emr">EMR</SelectItem>
            <SelectItem value="triage">Triage</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="shadow-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ScrollText className="h-5 w-5" />
            Audit Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {auditLogs.map((log) => (
              <div key={log.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium">{log.user}</p>
                    <Badge className={getSeverityColor(log.severity)}>{log.severity}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{log.action} in {log.module}</p>
                  <p className="text-xs text-muted-foreground">{log.details}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{log.timestamp}</span>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-card border-border">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-heading font-bold text-red-600">12</p>
            <p className="text-xs text-muted-foreground">Critical Events</p>
          </CardContent>
        </Card>
        <Card className="shadow-card border-border">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-heading font-bold text-orange-600">45</p>
            <p className="text-xs text-muted-foreground">High Priority</p>
          </CardContent>
        </Card>
        <Card className="shadow-card border-border">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-heading font-bold text-yellow-600">128</p>
            <p className="text-xs text-muted-foreground">Medium Priority</p>
          </CardContent>
        </Card>
        <Card className="shadow-card border-border">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-heading font-bold text-gray-600">892</p>
            <p className="text-xs text-muted-foreground">Total Events</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GlobalAudit;