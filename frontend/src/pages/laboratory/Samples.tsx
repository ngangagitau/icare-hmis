import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, FlaskConical, CheckCircle2, Clock } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api";
import { toast } from "sonner";

// --- Interfaces ---
interface Sample {
  _id: string; // Changed from 'id' to '_id' to match typical MongoDB IDs
  patientName: string; // Changed from 'patient' for clarity
  patientId: string; // Added patient ID
  testName: string; // Changed from 'test' for clarity
  sampleType: string; // Changed from 'type' for clarity
  collectorName?: string; // Changed from 'collector', made optional
  collectionTime?: string; // Changed from 'time', made optional
  status: "Pending" | "Collected" | "In Progress" | "Completed"; // Expanded status options
}

// --- API Hooks ---
const useLabSamples = () => {
  return useQuery<Sample[], Error>({
    queryKey: ["labSamples"],
    queryFn: async () => {
      const response = await apiClient.get<{ success: boolean; data: Sample[] }>("/lab/samples");
      return response.data; // Assuming API returns { success: true, data: [...] }
    },
  });
};

const useCollectSample = () => {
  const queryClient = useQueryClient();
  return useMutation<Sample, Error, string>({ // Returns updated sample, takes sample _id
    mutationFn: async (sampleId: string) => {
      const response = await apiClient.put<{ success: boolean; data: Sample }>(`/lab/samples/${sampleId}/collect`);
      return response.data;
    },
    onSuccess: (updatedSample) => {
      toast.success("Sample Collected", {
        description: `Sample ${updatedSample._id} for ${updatedSample.patientName} has been collected.`,
      });
      queryClient.invalidateQueries({ queryKey: ["labSamples"] }); // Refetch samples list
    },
    onError: (error) => {
      toast.error("Collection Failed", {
        description: error.message || "Failed to update sample status.",
      });
    },
  });
};

// --- Component ---
const statusColor: Record<string, string> = {
  Pending: "bg-warning/10 text-warning border-warning/20",
  Collected: "bg-success/10 text-success border-success/20",
  "In Progress": "bg-info/10 text-info border-info/20",
  Completed: "bg-primary/10 text-primary border-primary/20",
};

export default function SampleCollection() {
  const { data: samples = [], isLoading, isError, error } = useLabSamples();
  const collectSampleMutation = useCollectSample();

  const [search, setSearch] = useState("");

  const filteredSamples = useMemo(() => {
    if (!search) return samples;
    const lowerSearch = search.toLowerCase();
    return samples.filter(
      (s) =>
        s.patientName.toLowerCase().includes(lowerSearch) ||
        s.patientId.toLowerCase().includes(lowerSearch) ||
        s._id.toLowerCase().includes(lowerSearch) ||
        s.testName.toLowerCase().includes(lowerSearch) ||
        s.sampleType.toLowerCase().includes(lowerSearch)
    );
  }, [samples, search]);

  // --- KPI Stats ---
  const pendingCount = useMemo(() => samples.filter(s => s.status === "Pending").length, [samples]);
  const collectedCount = useMemo(() => samples.filter(s => s.status === "Collected").length, [samples]);
  const inProgressCount = useMemo(() => samples.filter(s => s.status === "In Progress").length, [samples]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Sample Collection</h1>
        <p className="text-muted-foreground text-sm">Track and manage laboratory sample collection</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="shadow-card border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center text-warning">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-heading font-bold">{pendingCount}</p>
              <p className="text-xs text-muted-foreground">Pending Samples</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center text-success">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-heading font-bold">{collectedCount}</p>
              <p className="text-xs text-muted-foreground">Collected Samples</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-info/10 flex items-center justify-center text-info">
              <FlaskConical className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-heading font-bold">{inProgressCount}</p>
              <p className="text-xs text-muted-foreground">In Progress</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-card border-border">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <CardTitle className="text-base font-heading">Sample List</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search samples..."
                className="pl-9 w-56"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Loading samples...</div>
          ) : isError ? (
            <div className="p-8 text-center text-destructive">Error: {error?.message}</div>
          ) : filteredSamples.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No samples found.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/60">
                  <TableRow>
                    <TableHead className="text-xs font-semibold uppercase tracking-wide h-10">Sample ID</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wide h-10">Patient</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wide h-10">Test</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wide h-10">Type</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wide h-10">Collector</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wide h-10">Time</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wide h-10">Status</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wide h-10 w-24" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSamples.map((s) => (
                    <TableRow key={s._id} className="group hover:bg-accent/40 transition-colors">
                      <TableCell className="font-mono text-xs font-semibold tracking-tight py-3">{s._id}</TableCell>
                      <TableCell className="text-sm font-medium py-3">
                        {s.patientName}
                        <p className="text-xs text-muted-foreground">{s.patientId}</p>
                      </TableCell>
                      <TableCell className="text-sm py-3">{s.testName}</TableCell>
                      <TableCell className="text-sm py-3">{s.sampleType}</TableCell>
                      <TableCell className="text-sm text-muted-foreground py-3">{s.collectorName || "—"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground py-3">{s.collectionTime || "—"}</TableCell>
                      <TableCell className="py-3">
                        <Badge variant="outline" className={`text-[11px] font-medium ${statusColor[s.status]}`}>
                          {s.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3">
                        {s.status === "Pending" && (
                          <Button
                            size="sm"
                            className="h-8 text-xs"
                            onClick={() => collectSampleMutation.mutate(s._id)}
                            disabled={collectSampleMutation.isPending}
                          >
                            {collectSampleMutation.isPending ? "Collecting..." : "Collect"}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
