import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, FileText, Calendar, Download } from "lucide-react";

const PatientPortal = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold text-foreground">Patient Portal</h1>
      <p className="text-muted-foreground text-sm">Self-service patient portal features</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[
        { title: "Upcoming Appointments", icon: Calendar, desc: "View and manage scheduled appointments", count: "2 upcoming", action: "View Schedule" },
        { title: "Lab Results", icon: FileText, desc: "Access your laboratory test results", count: "3 new results", action: "View Results" },
        { title: "Video Consultation", icon: Video, desc: "Join or request a telemedicine session", count: "1 session today", action: "Join Session" },
        { title: "Medical Records", icon: Download, desc: "Download visit summaries and prescriptions", count: "12 records", action: "View Records" },
      ].map(f => (
        <Card key={f.title}>
          <CardContent className="p-6 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <f.icon className="h-8 w-8 text-primary" />
              <div>
                <h3 className="font-semibold">{f.title}</h3>
                <p className="text-xs text-muted-foreground">{f.desc}</p>
              </div>
            </div>
            <p className="text-sm font-medium">{f.count}</p>
            <Button variant="outline" size="sm">{f.action}</Button>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

export default PatientPortal;
