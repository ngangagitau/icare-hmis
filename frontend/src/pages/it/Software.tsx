import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Server, CheckCircle, AlertTriangle } from "lucide-react";

const software = [
  { name: "EMR Suite", licenses: 120, expiry: "2027-02-18", status: "Valid" },
  { name: "Billing Engine", licenses: 32, expiry: "2026-10-03", status: "Renew" },
  { name: "Labs Middleware", licenses: 8, expiry: "2028-01-14", status: "Valid" },
  { name: "Network Management", licenses: 16, expiry: "2026-09-05", status: "Alert" },
];

const statusStyle: Record<string, string> = {
  Valid: "bg-success/10 text-success",
  Renew: "bg-warning/10 text-warning",
  Alert: "bg-destructive/10 text-destructive",
};

const Software = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold">Software Licenses</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Keep software inventory current and watch for upcoming renewals.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="shadow-card border-border">
          <CardContent className="p-4 flex items-center gap-4">
            <Server className="h-6 w-6 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Total Packages</p>
              <p className="text-3xl font-heading font-bold">42</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card border-border">
          <CardContent className="p-4 flex items-center gap-4">
            <CheckCircle className="h-6 w-6 text-success" />
            <div>
              <p className="text-sm text-muted-foreground">Valid Licenses</p>
              <p className="text-3xl font-heading font-bold">37</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card border-border">
          <CardContent className="p-4 flex items-center gap-4">
            <AlertTriangle className="h-6 w-6 text-destructive" />
            <div>
              <p className="text-sm text-muted-foreground">Action Required</p>
              <p className="text-3xl font-heading font-bold">2</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-card border-border">
        <CardHeader>
          <CardTitle>Software License Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {software.map((item) => (
            <div key={item.name} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-border p-4">
              <div>
                <p className="font-semibold">{item.name}</p>
                <p className="text-xs text-muted-foreground">Expires {item.expiry}</p>
              </div>
              <Badge className={statusStyle[item.status]}>{item.status}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default Software;
