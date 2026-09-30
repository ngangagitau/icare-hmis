import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { ShieldCheck, Plus, Search, RefreshCw, Send, CheckCircle2, AlertCircle } from "lucide-react";
import { useBills, useUpdateBillClaim } from "@/hooks/useBilling";
import { toast } from "sonner";
import type { Bill } from "@/lib/billingService";

const statusColor: Record<string, string> = {
  Draft: "bg-muted text-muted-foreground",
  Submitted: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200",
  Approved: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200",
  Paid: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-300",
  Rejected: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200",
  Settled: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200",
};

export default function InsuranceClaims() {
  const [search, setSearch] = useState("");
  const [providerFilter, setProviderFilter] = useState("All");

  const { data: billsData, isLoading, refetch } = useBills(1, 100);
  const updateClaimMutation = useUpdateBillClaim();

  const bills = billsData?.data || [];
  const claimedBills = bills.filter((b) => b.insuranceClaim);

  const [activeBill, setActiveBill] = useState<Bill | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [claimProvider, setClaimProvider] = useState("SHA");
  const [claimMemberNo, setClaimMemberNo] = useState("");
  const [claimPreAuth, setClaimPreAuth] = useState("");
  const [claimStatus, setClaimStatus] = useState<"Draft" | "Submitted" | "Approved" | "Rejected" | "Settled">("Submitted");
  const [claimAmount, setClaimAmount] = useState<number>(0);
  const [claimCopay, setClaimCopay] = useState<number>(0);

  const filtered = claimedBills.filter((b) => {
    const c = b.insuranceClaim;
    const matchesSearch =
      `${c?.claimNumber || ""} ${c?.provider || ""} ${b.patientName || ""} ${c?.memberNumber || ""} ${c?.preAuthCode || ""}`
        .toLowerCase()
        .includes(search.toLowerCase());
    const matchesProvider = providerFilter === "All" || (c?.provider || "").toLowerCase().includes(providerFilter.toLowerCase());
    return matchesSearch && matchesProvider;
  });

  const handleOpenEdit = (b: Bill) => {
    setActiveBill(b);
    const c = b.insuranceClaim;
    setClaimProvider(c?.provider || "SHA");
    setClaimMemberNo(c?.memberNumber || "");
    setClaimPreAuth(c?.preAuthCode || "");
    setClaimStatus(c?.status || "Submitted");
    setClaimAmount(Number(c?.amountClaimed || b.totalAmount || 0));
    setClaimCopay(Number(c?.copayAmount || 0));
    setIsEditModalOpen(true);
  };

  const handleSaveClaim = async () => {
    if (!activeBill?.id) return;
    try {
      await updateClaimMutation.mutateAsync({
        billId: activeBill.id,
        claimData: {
          provider: claimProvider,
          memberNumber: claimMemberNo,
          preAuthCode: claimPreAuth,
          amountClaimed: claimAmount,
          copayAmount: claimCopay,
          status: claimStatus,
        },
      });

      toast.success("Insurance claim updated successfully!");
      setIsEditModalOpen(false);
      refetch();
    } catch (err: any) {
      toast.error("Failed to update claim", { description: err.message });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Insurance & Pre-Authorization Claims</h1>
          <p className="text-xs text-muted-foreground">Manage SHA, NHIF, and private health insurance billing claims</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-1.5 text-xs h-9">
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </Button>
      </div>

      {/* Claims Workbench Card */}
      <Card className="border-border shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="relative flex-1 w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search claims by provider, patient, member # or pre-auth..."
                className="pl-9 text-xs h-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={providerFilter} onValueChange={setProviderFilter}>
              <SelectTrigger className="w-36 h-9 text-xs">
                <SelectValue placeholder="All Providers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Providers</SelectItem>
                <SelectItem value="SHA">SHA Scheme</SelectItem>
                <SelectItem value="NHIF">NHIF</SelectItem>
                <SelectItem value="Jubilee">Jubilee</SelectItem>
                <SelectItem value="AAR">AAR Health</SelectItem>
                <SelectItem value="Madison">Madison</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="border border-border rounded-xl overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="text-xs font-semibold">Claim No</TableHead>
                  <TableHead className="text-xs font-semibold">Provider / Scheme</TableHead>
                  <TableHead className="text-xs font-semibold">Patient</TableHead>
                  <TableHead className="text-xs font-semibold">Member Number</TableHead>
                  <TableHead className="text-xs font-semibold">Pre-Auth Code</TableHead>
                  <TableHead className="text-xs font-semibold text-right">Amount (KES)</TableHead>
                  <TableHead className="text-xs font-semibold text-center">Status</TableHead>
                  <TableHead className="text-xs font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-xs">
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Loading insurance claims...
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No active insurance claims found. Select a bill with an insurance scheme to file a claim.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((b) => {
                    const c = b.insuranceClaim!;
                    return (
                      <TableRow key={b.id}>
                        <TableCell className="font-mono font-bold text-foreground">
                          {c.claimNumber || "CLM-" + b.id?.slice(0, 6)}
                        </TableCell>
                        <TableCell className="font-semibold text-primary">{c.provider}</TableCell>
                        <TableCell className="font-medium text-foreground">
                          {b.patientName} <span className="text-muted-foreground">({b.patientDisplayId})</span>
                        </TableCell>
                        <TableCell className="font-mono">{c.memberNumber || "—"}</TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {c.preAuthCode || "Pending"}
                        </TableCell>
                        <TableCell className="text-right font-mono font-bold text-foreground">
                          KES {Number(c.amountClaimed || b.totalAmount || 0).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className={`text-[10px] ${statusColor[c.status || "Submitted"]}`}>
                            {c.status || "Submitted"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-[11px] px-2.5"
                            onClick={() => handleOpenEdit(b)}
                          >
                            Update Status
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Claim Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-indigo-600" />
              Manage Insurance Claim
            </DialogTitle>
            <DialogDescription className="text-xs">
              Patient: <span className="font-semibold text-foreground">{activeBill?.patientName}</span> · Invoice: <span className="font-mono">{activeBill?.invoiceNumber || activeBill?.billId}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Provider</Label>
                <Select value={claimProvider} onValueChange={setClaimProvider}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SHA">Social Health Authority (SHA)</SelectItem>
                    <SelectItem value="NHIF">NHIF</SelectItem>
                    <SelectItem value="Jubilee">Jubilee Insurance</SelectItem>
                    <SelectItem value="AAR">AAR Health</SelectItem>
                    <SelectItem value="Madison">Madison Insurance</SelectItem>
                    <SelectItem value="Britam">Britam</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Claim Status</Label>
                <Select value={claimStatus} onValueChange={(v: any) => setClaimStatus(v)}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Submitted">Submitted</SelectItem>
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="Settled">Settled</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Member / Policy Number</Label>
              <Input
                value={claimMemberNo}
                onChange={(e) => setClaimMemberNo(e.target.value)}
                placeholder="e.g. SHA-8821940"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Pre-Authorization Code</Label>
              <Input
                value={claimPreAuth}
                onChange={(e) => setClaimPreAuth(e.target.value)}
                placeholder="e.g. AUTH-2026-991"
                className="font-mono uppercase"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Claim Amount (KES)</Label>
                <Input
                  type="number"
                  value={claimAmount}
                  onChange={(e) => setClaimAmount(Number(e.target.value))}
                  className="font-mono"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Patient Co-Pay (KES)</Label>
                <Input
                  type="number"
                  value={claimCopay}
                  onChange={(e) => setClaimCopay(Number(e.target.value))}
                  className="font-mono"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveClaim} disabled={updateClaimMutation.isPending} className="gap-2">
              <CheckCircle2 className="h-4 w-4" /> Save Claim
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
