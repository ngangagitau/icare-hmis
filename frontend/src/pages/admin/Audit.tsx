import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ScrollText } from "lucide-react";
import { toast } from "sonner";
import apiClient from "@/lib/api";

// ── types ────────────────────────────────────────────────────────────────────

interface AuditEntry {
  _id: string;
  code: string;
  name: string;
  description: string;
  status: string;
  payload: Record<string, any>;
  moduleSlug: string;
  createdAt: string;
}

// ── action colour palette ─────────────────────────────────────────────────────

const ACTION_COLORS: Record<string, string> = {
  CREATE: "bg-success/10 text-success border-success/20",
  UPDATE: "bg-primary/10 text-primary border-primary/20",
  DELETE: "bg-destructive/10 text-destructive border-destructive/20",
  LOGIN: "bg-primary/10 text-primary border-primary/20",
  LOGOUT: "bg-muted text-muted-foreground border-border",
  VIEW: "bg-accent text-accent-foreground",
};

function actionColor(action: string): string {
  const upper = action.toUpperCase();
  return ACTION_COLORS[upper] ?? "bg-muted text-muted-foreground border-border";
}

// ── component ────────────────────────────────────────────────────────────────

export default function AuditTrail() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [moduleFilter, setModuleFilter] = useState<string>("all");

  // ── fetch ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        // Pull from super-admin module_items (audit trail records stored there)
        const resp = await apiClient.get<{ success: boolean; data: AuditEntry[] }>(
          `/module-items?module_slug=super-admin`
        );
        if (resp.success) setEntries(resp.data ?? []);
      } catch (err: any) {
        toast.error("Failed to load audit log", { description: err?.message ?? "Server error" });
        setEntries([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ── filters ───────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = [...entries];
    if (actionFilter !== "all") list = list.filter((e) => e.code === actionFilter);
    if (moduleFilter !== "all") list = list.filter((e) => e.payload?.module === moduleFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.payload?.user?.toLowerCase().includes(q) ||
          e.payload?.entity?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [entries, search, actionFilter, moduleFilter]);

  const actionOptions = useMemo(() => {
    const set = new Set(entries.map((e) => e.code).filter(Boolean));
    return Array.from(set).sort();
  }, [entries]);

  const moduleOptions = useMemo(() => {
    const set = new Set(entries.map((e) => e.payload?.module).filter(Boolean));
    return Array.from(set).sort();
  }, [entries]);

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Audit Trail</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Field-level change tracking across all modules
        </p>
      </div>

      {/* ── filter bar ───────────────────────────────────────────────────────── */}
      <Card className="shadow-card border-border">
        <CardContent className="pt-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by user, entity or field…"
                className="pl-9 h-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="h-9 w-auto min-w-[140px]">
                <SelectValue placeholder="All actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All actions</SelectItem>
                {actionOptions.map((a) => (
                  <SelectItem key={a} value={a}>{a}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={moduleFilter} onValueChange={setModuleFilter}>
              <SelectTrigger className="h-9 w-auto min-w-[140px]">
                <SelectValue placeholder="All modules" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All modules</SelectItem>
                {moduleOptions.map((m) => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="text-xs text-muted-foreground flex items-center shrink-0">
              {filtered.length} recording{filtered.length !== 1 ? "s" : ""}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── audit table ──────────────────────────────────────────────────────── */}
      <Card className="shadow-card border-border overflow-hidden">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ScrollText className="h-4 w-4" />
            Audit Log
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 flex justify-center">
              <ScrollText className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 px-4 text-center">
              <ScrollText className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-sm font-medium">No audit records found</p>
              <p className="text-xs text-muted-foreground mt-1">
                {search || actionFilter || moduleFilter
                  ? "Try adjusting the filters."
                  : "System changes will appear here automatically."}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-muted/60">
                <TableRow>
                  <TableHead className="text-xs font-semibold uppercase tracking-wide h-10">Timestamp</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wide h-10">User</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wide h-10">Action</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wide h-10">Module</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wide h-10">Entity</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wide h-10">Field</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wide h-10">Old Value</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wide h-10">New Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((entry) => {
                  const p = entry.payload ?? {};
                  return (
                    <TableRow key={entry._id} className="group hover:bg-accent/40 transition-colors">
                      <TableCell className="text-xs font-mono text-muted-foreground py-3">
                        {new Date(entry.createdAt).toLocaleString("en-KE", {
                          year: "numeric",
                          month: "short",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </TableCell>
                      <TableCell className="text-sm font-medium py-3">{p.user ?? "—"}</TableCell>
                      <TableCell className="py-3">
                        <Badge variant="outline" className={`text-[11px] font-medium ${actionColor(entry.code)}`}>
                          {entry.code}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm py-3">{p.module ?? "—"}</TableCell>
                      <TableCell className="text-sm py-3 max-w-[160px] truncate" title={p.entity ?? ""}>
                        {p.entity ?? "—"}
                      </TableCell>
                      <TableCell className="text-sm py-3">{p.field ?? "—"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground py-3 max-w-[120px] truncate" title={p.oldValue ?? ""}>
                        {p.oldValue ?? "—"}
                      </TableCell>
                      <TableCell className="text-sm py-3 max-w-[120px] truncate" title={p.newValue ?? ""}>
                        {p.newValue
                          ? <span className="text-success">{p.newValue}</span>
                          : "—"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
