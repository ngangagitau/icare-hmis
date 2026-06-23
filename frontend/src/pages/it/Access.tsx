import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Users } from "lucide-react";

const accessRequests = [
  { id: "AR-0201", user: "LabTech Amina", request: "Access to lab instruments", status: "Pending" },
  { id: "AR-0202", user: "Pharmacy John", request: "Add medication approval role", status: "Approved" },
  { id: "AR-0203", user: "Nurse Peter", request: "Reset EMR password", status: "Completed" },
];

const statusStyle: Record<string, string> = {
  Pending: "bg-warning/10 text-warning",
  Approved: "bg-success/10 text-success",
  Completed: "bg-muted text-muted-foreground",
};

const Access = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold">Access Control</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage user access requests, role assignments and security approvals.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="shadow-card border-border">
          <CardContent className="p-4 flex items-center gap-4">
            <Lock className="h-6 w-6 text-destructive" />
            <div>
              <p className="text-sm text-muted-foreground">Pending Requests</p>
              <p className="text-3xl font-heading font-bold">1</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card border-border">
          <CardContent className="p-4 flex items-center gap-4">
            <Users className="h-6 w-6 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Active Users</p>
              <p className="text-3xl font-heading font-bold">842</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card border-border">
          <CardContent className="p-4 flex items-center gap-4">
            <Lock className="h-6 w-6 text-success" />
            <div>
              <p className="text-sm text-muted-foreground">Secure Sessions</p>
              <p className="text-3xl font-heading font-bold">62</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-card border-border">
        <CardHeader>
          <CardTitle>Access Requests</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {accessRequests.map((request) => (
            <div key={request.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-border p-4">
              <div>
                <p className="font-semibold">{request.user}</p>
                <p className="text-xs text-muted-foreground">{request.request} · {request.id}</p>
              </div>
              <Badge className={statusStyle[request.status]}>{request.status}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default Access;
