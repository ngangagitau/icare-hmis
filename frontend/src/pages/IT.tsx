import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardCheck, Cpu, Server, ShieldCheck, Wifi } from "lucide-react";
import apiClient from "@/lib/api";

interface ITStat {
  label: string;
  value: number;
  icon: any;
  tone: string;
}

interface Incident {
  id: string;
  summary: string;
  status: string;
}

const IT = () => {
  const [stats, setStats] = useState<ITStat[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchITData();
  }, []);

  const fetchITData = async () => {
    try {
      setLoading(true);
      
      // Fetch IT stats
      try {
        const statsResponse = await apiClient.get<ITStat[]>("/it/stats");
        setStats(Array.isArray(statsResponse) ? statsResponse : []);
      } catch (err) {
        console.error("Failed to fetch IT stats:", err);
        setStats([]);
      }

      // Fetch IT incidents/tickets
      try {
        const incidentsResponse = await apiClient.get<Incident[]>("/it/incidents");
        setIncidents(Array.isArray(incidentsResponse) ? incidentsResponse : []);
      } catch (err) {
        console.error("Failed to fetch incidents:", err);
        setIncidents([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const defaultStats = [
    { label: "Open Tickets", value: 0, icon: ClipboardCheck, tone: "text-primary" },
    { label: "Hardware Assets", value: 0, icon: Cpu, tone: "text-foreground" },
    { label: "Software Licenses", value: 0, icon: Server, tone: "text-purple-600" },
    { label: "Network Alerts", value: 0, icon: Wifi, tone: "text-sky-600" },
  ];
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold">IT Operations</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor technical support, infrastructure, access control and network health.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="bg-success/10 text-success">Live</Badge>
          <Badge className="bg-muted text-muted-foreground">IT Services</Badge>
          <Button size="sm" className="h-9">Open Helpdesk</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {(stats.length > 0 ? stats : defaultStats).map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="shadow-card border-border">
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-heading font-bold">{stat.value}</p>
                </div>
                <div className={`h-12 w-12 rounded-2xl bg-muted flex items-center justify-center ${stat.tone}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="shadow-card border-border">
        <CardHeader>
          <CardTitle>Recent IT Incidents</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {incidents.length > 0 ? (
            incidents.map((incident) => (
              <div key={incident.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-border p-4">
                <div>
                  <p className="text-sm font-semibold">{incident.summary}</p>
                  <p className="text-xs text-muted-foreground">{incident.id}</p>
                </div>
                <Badge className="bg-warning/10 text-warning">{incident.status}</Badge>
              </div>
            ))
          ) : (
            <p className="text-center py-4 text-muted-foreground">No incidents reported</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default IT;
