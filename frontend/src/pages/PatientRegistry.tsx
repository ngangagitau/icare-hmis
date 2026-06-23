import { useState, useEffect } from "react";
import { Search, Filter, MoreHorizontal, Phone, Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import apiClient from "@/lib/api";

interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  email: string;
  idNumber: string;
  insurance: string;
  status: string;
  lastVisit: string;
}

const statusStyle: Record<string, string> = {
  "In Queue": "bg-warning/10 text-warning border-warning/20",
  "Checked In": "bg-success/10 text-success border-success/20",
  "Discharged": "bg-muted text-muted-foreground",
};

const PatientRegistry = () => {
  const [search, setSearch] = useState("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get<Patient[]>("/patients");
      setPatients(Array.isArray(response) ? response : []);
    } catch (err) {
      console.error("Failed to fetch patients:", err);
      setError("Failed to load patients");
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toLowerCase().includes(search.toLowerCase()) ||
      p.idNumber.includes(search)
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold">Patient Registry</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {patients.length} registered patients · {patients.filter(p => p.status === "In Queue").length} in queue
          </p>
        </div>
      </div>

      {loading && (
        <Card className="shadow-card border-border">
          <CardContent className="py-12">
            <p className="text-center text-muted-foreground">Loading patients...</p>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="shadow-card border-border border-destructive/20 bg-destructive/5">
          <CardContent className="py-4">
            <p className="text-center text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {!loading && !error && (
        <Card className="shadow-card border-border">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, patient ID, or ID number..."
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" /> Filters
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="pb-3 font-medium text-muted-foreground">Patient</th>
                    <th className="pb-3 font-medium text-muted-foreground hidden md:table-cell">Contact</th>
                    <th className="pb-3 font-medium text-muted-foreground hidden lg:table-cell">ID Number</th>
                    <th className="pb-3 font-medium text-muted-foreground">Insurance</th>
                    <th className="pb-3 font-medium text-muted-foreground">Status</th>
                    <th className="pb-3 font-medium text-muted-foreground text-right">Last Visit</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length > 0 ? (
                    filtered.map((p) => (
                      <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors cursor-pointer">
                        <td className="py-3">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary shrink-0">
                              {p.name.split(" ").map(n => n[0]).join("")}
                            </div>
                            <div>
                              <p className="font-medium">{p.name}</p>
                              <p className="text-xs text-muted-foreground">{p.id} · {p.age}y · {p.gender}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 hidden md:table-cell">
                          <div className="flex items-center gap-3 text-muted-foreground">
                            <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{p.phone}</span>
                          </div>
                        </td>
                        <td className="py-3 hidden lg:table-cell text-muted-foreground">{p.idNumber}</td>
                        <td className="py-3">
                          <Badge variant="outline" className="text-xs">{p.insurance}</Badge>
                        </td>
                        <td className="py-3">
                          <Badge variant="outline" className={`text-[11px] ${statusStyle[p.status] || ""}`}>{p.status}</Badge>
                        </td>
                        <td className="py-3 text-right text-muted-foreground text-xs">{p.lastVisit}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-muted-foreground">
                        No patients found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PatientRegistry;
