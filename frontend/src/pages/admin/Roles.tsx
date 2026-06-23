import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import apiClient from "@/lib/api";
import { useModules } from "@/contexts/ModuleContext";
import { modules as allModules } from "@/config/modules";
import { Search, Shield, Plus, Pencil, Trash2, UserCheck } from "lucide-react";

// ── types ────────────────────────────────────────────────────────────────────

interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: string;
  department?: string;
  phone?: string;
  isActive: boolean;
  permissions: Array<{ module: string; actions: string[] }>;
}

const ROLES = ["Super Admin", "Admin", "Doctor", "Nurse", "Cashier", "Lab Tech", "Pharmacist", "Receptionist"] as const;
type Role = (typeof ROLES)[number];

const ACTION_OPTIONS = ["read", "create", "update", "delete"] as const;

// ── permission helpers ───────────────────────────────────────────────────────

function roleLabelColor(role: string): string {
  switch (role) {
    case "Super Admin":
    case "Admin":
      return "bg-primary/10 text-primary border-primary/20";
    case "Doctor":
      return "bg-success/10 text-success border-success/20";
    case "Nurse":
      return "bg-warning/10 text-warning border-warning/20";
    case "Pharmacist":
      return "bg-accent text-accent-foreground";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

function formatPerms(perms: UserRecord["permissions"]): string {
  if (!perms.length) return "—";
  return perms.map((p) => `${p.module}: ${p.actions.join(", ")}`).join(" · ");
}

// ── component ────────────────────────────────────────────────────────────────

export default function Roles() {
  const { isModuleEnabled } = useModules();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [editOpen, setEditOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [activeUser, setActiveUser] = useState<UserRecord | null>(null);

  // form state
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formRole, setFormRole] = useState<Role>("Receptionist");
  const [formDept, setFormDept] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formPerms, setFormPerms] = useState<Record<string, string[]>>({});
  const [saving, setSaving] = useState(false);

  // Get only enabled modules for permissions assignment
  const enabledModulesForPermissions = useMemo(
    () => allModules.filter(mod => isModuleEnabled(mod.key)),
    [isModuleEnabled]
  );

  // ── load users ────────────────────────────────────────────────────────────
  const loadUsers = async () => {
    setLoading(true);
    try {
      const query = roleFilter && roleFilter !== "all" ? `?role=${encodeURIComponent(roleFilter)}` : "";
      const resp = await apiClient.get<{ success: boolean; data: UserRecord[] }>(`/users${query}`);
      if (resp.success) setUsers(resp.data ?? []);
    } catch (err: any) {
      // Gracefully handle missing endpoint - show empty state
      console.warn("Users endpoint not yet available");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadUsers(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Re-fetch when role filter changes
  const filtered = useMemo(() => {
    let list = users;
    if (roleFilter && roleFilter !== "all") list = list.filter((u) => u.role === roleFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.role.toLowerCase().includes(q)
      );
    }
    return list;
  }, [users, search, roleFilter]);

  // ── helpers ───────────────────────────────────────────────────────────────
  const openEdit = (u: UserRecord) => {
    setActiveUser(u);
    setFormName(u.name);
    setFormEmail(u.email);
    setFormRole(u.role as Role);
    setFormDept(u.department ?? "");
    setFormPhone(u.phone ?? "");
    const pm: Record<string, string[]> = {};
    (u.permissions ?? []).forEach((p) => { pm[p.module] = p.actions; });
    setFormPerms(pm);
    setEditOpen(true);
  };

  const openCreate = () => {
    setActiveUser(null);
    setFormName("");
    setFormEmail("");
    setFormRole("Receptionist");
    setFormDept("");
    setFormPhone("");
    setFormPerms({});
    setCreateOpen(true);
  };

  const toggleAction = (module: string, action: string) => {
    setFormPerms((prev) => {
      const existing = new Set(prev[module] ?? []);
      if (existing.has(action)) existing.delete(action);
      else existing.add(action);
      return { ...prev, [module]: Array.from(existing) };
    });
  };

  const saveUser = async () => {
    if (!formName.trim() || !formEmail.trim()) {
      toast.error("Validation", { description: "Name and email are required." });
      return;
    }
    setSaving(true);
    try {
      const permsPayload = Object.entries(formPerms)
        .filter(([, acts]) => acts.length > 0)
        .map(([module, actions]) => ({ module, actions }));
      if (activeUser) {
        // update
        await apiClient.put(`/users/${activeUser.id}`, {
          ...(formName !== activeUser.name && { name: formName }),
          ...(formEmail !== activeUser.email && { email: formEmail }),
          role: formRole,
          department: formDept || undefined,
          phone: formPhone || undefined,
          permissions: permsPayload,
          isActive: activeUser.isActive,
        } as any);
        toast.success("User updated", { description: `${formName}'s role has been saved.` });
        setEditOpen(false);
        await loadUsers();
      } else {
        // create – must include a password
        const password = `Pass${Math.random().toString(36).slice(-6)}123`;
        await apiClient.post("/users", {
          firstName: formName.split(" ")[0],
          lastName: formName.split(" ").slice(1).join(" ") || "",
          email: formEmail,
          password,
          role: formRole,
          department: formDept,
          phone: formPhone,
          permissions: permsPayload,
        } as any);
        toast.success("User created", { description: `Login credentials sent to ${formEmail}.` });
        setCreateOpen(false);
        await loadUsers();
      }
    } catch (err: any) {
      toast.error("Save failed", { description: err?.message ?? "Please try again." });
    } finally {
      setSaving(false);
    }
  };

  const deactivateUser = async (u: UserRecord) => {
    try {
      await apiClient.delete(`/users/${u.id}`);
      toast.success("User removed", { description: `${u.name} has been deactivated.` });
      await loadUsers();
    } catch (err: any) {
      toast.error("Delete failed", { description: err?.message ?? "Please try again." });
    }
  };

  // ── form dialog ───────────────────────────────────────────────────────────
  const renderForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-sm">Full name</Label>
          <Input value={formName} onChange={(e) => setFormName(e.target.value)} className="h-9" placeholder="John Doe" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm">Email</Label>
          <Input type="email" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} className="h-9" placeholder="john@example.com" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm">Role</Label>
          <Select value={formRole} onValueChange={(v) => setFormRole(v as Role)}>
            <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              {ROLES.map((r) => (
                <SelectItem key={r} value={r}>{r}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm">Department</Label>
          <Input value={formDept} onChange={(e) => setFormDept(e.target.value)} className="h-9" placeholder="e.g. Pharmacy" />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label className="text-sm">Phone</Label>
          <Input value={formPhone} onChange={(e) => setFormPhone(e.target.value)} className="h-9" placeholder="+254 …" />
        </div>
      </div>
      <div className="space-y-2">
        <Label className="text-sm font-medium">Permissions</Label>
        <div className="border rounded-lg overflow-hidden max-h-64 overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/60">
                <TableHead className="text-xs h-8">Module</TableHead>
                {ACTION_OPTIONS.map((a) => (
                  <TableHead key={a} className="text-xs h-8 text-center w-[68px]">{a}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {enabledModulesForPermissions.map((mod) => {
                const acts = formPerms[mod.label] ?? [];
                return (
                  <TableRow key={mod.key} className="text-sm">
                    <TableCell className="font-medium py-2 text-xs">{mod.label}</TableCell>
                    {ACTION_OPTIONS.map((a) => (
                      <TableCell key={a} className="text-center py-2">
                        <Checkbox
                          checked={acts.includes(a)}
                          onCheckedChange={() => toggleAction(mod.label, a)}
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Roles &amp; Permissions</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage users, assign roles, and configure module-level permissions.
          </p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={openCreate}>
              <Plus className="h-4 w-4" /> New User
            </Button>
          </DialogTrigger>
        </Dialog>
      </div>

      {/* ── filter bar ─────────────────────────────────────────────────────── */}
      <Card className="shadow-card border-border">
        <CardContent className="pt-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email or role…"
                className="pl-9 h-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="h-9 w-auto min-w-[160px]">
                <SelectValue placeholder="All roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All roles</SelectItem>
                {ROLES.map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="text-xs text-muted-foreground flex items-center">
              {filtered.length} user{filtered.length !== 1 ? "s" : ""} found
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── users table ─────────────────────────────────────────────────────── */}
      <Card className="shadow-card border-border overflow-hidden">
        <CardHeader>
          <CardTitle className="text-base">System Users</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 text-center text-muted-foreground text-sm">Loading users…</div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 px-4 text-center">
              <Shield className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-sm font-medium">No users found</p>
              <p className="text-xs text-muted-foreground mt-1">
                {search ? "Try a different search term or role filter." : "Create your first user to get started."}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-muted/60">
                <TableRow>
                  <TableHead className="text-xs font-semibold uppercase tracking-wide h-10">Name</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wide h-10">Email</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wide h-10">Role</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wide h-10">Department</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wide h-10 hidden sm:table-cell">Permissions</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wide h-10">Status</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wide h-10 w-32" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((u) => (
                  <TableRow key={u.id} className="group hover:bg-accent/40 transition-colors">
                    <TableCell className="text-sm font-medium py-3">{u.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground py-3">{u.email}</TableCell>
                    <TableCell className="py-3">
                      <Badge variant="outline" className={`text-[11px] font-medium ${roleLabelColor(u.role)}`}>
                        {u.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground py-3">{u.department ?? "—"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-xs truncate py-3 hidden sm:table-cell">
                      {formatPerms(u.permissions)}
                    </TableCell>
                    <TableCell className="py-3">
                      <Badge
                        variant="outline"
                        className={`text-[11px] font-medium ${u.isActive
                          ? "bg-success/10 text-success border-success/20"
                          : "bg-muted text-muted-foreground border-border"
                          }`}
                      >
                        {u.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-primary"
                          onClick={() => openEdit(u)}
                        >
                          <Pencil className="h-3.5 w-3.5" /> Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                          onClick={() => deactivateUser(u)}
                          title="Remove user"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* ── edit / create dialog ─────────────────────────────────────────────── */}
      <Dialog open={editOpen || createOpen} onOpenChange={(open) => { if (!open) { setEditOpen(false); setCreateOpen(false); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              {activeUser ? `Edit — ${activeUser.name}` : "Create New User"}
            </DialogTitle>
          </DialogHeader>
          {renderForm()}
          <DialogFooter className="gap-2 mt-2">
            <Button variant="outline" onClick={() => { setEditOpen(false); setCreateOpen(false); }}>
              Cancel
            </Button>
            <Button onClick={saveUser} disabled={saving}>
              {saving ? "Saving…" : activeUser ? "Save Changes" : "Create User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
