import { useState } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Bell, Search, LayoutGrid, Mail, Phone, Briefcase, LogOut, Key } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ModuleGrid } from "@/components/ModuleGrid";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import apiClient from "@/lib/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

// ── helpers ──────────────────────────────────────────────────────────────────

function getInitials(user: { firstName?: string; lastName?: string; name?: string }): string {
  const fullName = user.name ?? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();
  if (!fullName) return "?";
  return fullName
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// ── Change-Password dialog ────────────────────────────────────────────────────

function ChangePasswordDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPw.length < 6) {
      toast.error("Weak password", { description: "New password must be at least 6 characters." });
      return;
    }
    if (newPw !== confirmPw) {
      toast.error("Mismatch", { description: "New passwords do not match." });
      return;
    }
    setSaving(true);
    try {
      await apiClient.put("/auth/updatepassword", { currentPassword: currentPw, newPassword: newPw });
      toast.success("Password updated", { description: "Your password has been changed securely." });
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
      setOpen(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Please check your current password and try again.";
      toast.error("Update failed", { description: message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            Change Password
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3 mt-2">
          <div className="space-y-1.5">
            <Label className="text-xs">Current password</Label>
            <Input type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} className="h-9" required />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">New password</Label>
            <Input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} className="h-9" required minLength={6} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Confirm new password</Label>
            <Input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} className="h-9" required />
          </div>
          <DialogFooter className="gap-2 mt-1">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : "Update Password"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── AppLayout ────────────────────────────────────────────────────────────────

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [isGridOpen, setIsGridOpen] = useState(false);

  const initials = getInitials(user ?? {});

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center justify-between border-b border-border bg-card px-4 shrink-0 sticky top-0 z-30">
            <div className="flex items-center gap-3">
              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search patients, records..."
                  className="pl-9 w-64 h-9 bg-muted/50 border-0 text-sm"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsGridOpen(true)}
                className="relative h-9 w-9 rounded-lg flex items-center justify-center hover:bg-muted transition-colors group"
                title="View Modules"
              >
                <LayoutGrid className="h-[18px] w-[18px] text-muted-foreground group-hover:text-foreground transition-colors" />
              </button>
              <button className="relative h-9 w-9 rounded-lg flex items-center justify-center hover:bg-muted transition-colors">
                <Bell className="h-[18px] w-[18px] text-muted-foreground" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive" />
              </button>

              {/* ── user avatar + profile dropdown ─────────────────────────────── */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="relative h-9 w-9 rounded-full overflow-hidden shrink-0 hover:ring-2 hover:ring-primary/30 transition-all focus:outline-none focus:ring-2 focus:ring-primary/50">
                    <Avatar className="h-9 w-9 hmis-gradient">
                      <AvatarFallback className="text-[11px] font-semibold text-primary-foreground">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72">
                  {/* identity block */}
                  <DropdownMenuLabel className="pb-1">
                    <p className="text-sm font-semibold truncate">
                      {(user?.name ?? `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim()) || "User"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email ?? "—"}</p>
                  </DropdownMenuLabel>
                  <div className="px-2 pb-2">
                    <span className="inline-flex items-center rounded-full bg-primary/10 text-primary text-[11px] font-medium px-2 py-0.5">
                      {user?.role ?? "No role"}
                    </span>
                  </div>
                  <DropdownMenuSeparator />

                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="text-[11px] uppercase tracking-wider text-muted-foreground">
                      Profile details
                    </DropdownMenuLabel>

                    <DropdownMenuItem disabled className="flex items-center gap-2 text-xs">
                      <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="truncate">{user?.email ?? "—"}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled className="flex items-center gap-2 text-xs">
                      <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{user?.phone ?? "No phone number"}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled className="flex items-center gap-2 text-xs">
                      <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{user?.department ?? "No department"}</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>

                  <DropdownMenuSeparator />

                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="text-[11px] uppercase tracking-wider text-muted-foreground">
                      Account security
                    </DropdownMenuLabel>
                    <ChangePasswordDialog>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="flex items-center gap-2 text-xs cursor-pointer">
                        <Key className="h-3.5 w-3.5 text-muted-foreground" />
                        Reset password
                      </DropdownMenuItem>
                    </ChangePasswordDialog>
                  </DropdownMenuGroup>

                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="flex items-center gap-2 text-xs text-destructive focus:text-destructive cursor-pointer"
                    onClick={async () => {
                      try {
                        await apiClient.get("/auth/logout");
                      } catch {
                        /* ignore network errors during logout */
                      } finally {
                        localStorage.removeItem("authToken");
                        window.location.href = "/login";
                      }
                    }}
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
        </SidebarInset>
      </div>

      {isGridOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-card rounded-xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-auto animate-in zoom-in-95 duration-200">
            <div className="sticky top-0 flex items-center justify-between p-4 border-b border-border bg-card">
              <h2 className="text-lg font-semibold text-foreground">Select a Module</h2>
              <button
                onClick={() => setIsGridOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <ModuleGrid onClose={() => setIsGridOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </SidebarProvider>
  );
}
