import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShieldCheck, CheckCircle2, AlertTriangle, CreditCard, Search, RefreshCw, ArrowRight } from "lucide-react";
import { useRadiologyOrders, useUpdateRadiologyOrder } from "@/hooks/useRadiology";
import { toast } from "sonner";
import type { RadiologyOrder } from "@/lib/radiologyService";
import { cn } from "@/lib/utils";

export default function RadiologyValidation() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const { data: ordersData, isLoading, refetch } = useRadiologyOrders(1, 100);
  const updateOrderMutation = useUpdateRadiologyOrder();

  const orders = ordersData?.data || [];

  const handleClearOrder = async (order: RadiologyOrder) => {
    if (!order.id) return;
    try {
      await updateOrderMutation.mutateAsync({
        id: order.id,
        data: {
          paymentStatus: "Cleared",
        },
      });
      toast.success(`Cleared ${order.patientName} for ${order.modality} scanning!`);
      refetch();
    } catch (err: any) {
      toast.error("Failed to clear examination", { description: err.message });
    }
  };

  const filtered = orders.filter(
    (o) =>
      `${o.patientName} ${o.orderNumber} ${o.modality} ${o.bodyPart} ${o.paymentStatus}`
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Pre-Imaging Financial & Pre-Auth Clearance</h1>
          <p className="text-xs text-muted-foreground">
            Verify payment receipts, SHA/NHIF pre-authorization codes, and clinical safety before scan acquisition
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-1.5 text-xs h-9">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
          <Button size="sm" onClick={() => navigate("/billing")} className="gap-1.5 text-xs h-9">
            <CreditCard className="h-3.5 w-3.5" /> Cashier Desk
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Cleared for Scan</p>
              <h3 className="text-2xl font-bold font-heading text-emerald-600 mt-1">
                {orders.filter((o) => o.paymentStatus === "Cleared").length}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">Ready for technologist</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Insurance Pre-Auth</p>
              <h3 className="text-2xl font-bold font-heading text-indigo-600 mt-1">
                {orders.filter((o) => o.paymentStatus === "Insurance").length}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">Corporate / SHA coverage</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Awaiting Clearance</p>
              <h3 className="text-2xl font-bold font-heading text-rose-600 mt-1">
                {orders.filter((o) => o.paymentStatus === "Unpaid" || o.paymentStatus === "Pending").length}
              </h3>
              <p className="text-xs text-rose-600 mt-0.5">Must settle before entering scanner</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-rose-500/10 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="relative flex-1 w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by patient, order #, modality or status..."
                className="pl-9 text-xs h-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="border border-border rounded-xl overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="text-xs font-semibold">Order No</TableHead>
                  <TableHead className="text-xs font-semibold">Patient Details</TableHead>
                  <TableHead className="text-xs font-semibold">Modality</TableHead>
                  <TableHead className="text-xs font-semibold">Examination</TableHead>
                  <TableHead className="text-xs font-semibold">Payment Mode</TableHead>
                  <TableHead className="text-xs font-semibold text-center">Clearance Status</TableHead>
                  <TableHead className="text-xs font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-xs">
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Loading verification queue...
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No examinations found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((o) => {
                    const isCleared = o.paymentStatus === "Cleared";
                    const isInsurance = o.paymentStatus === "Insurance";
                    return (
                      <TableRow key={o.id || o._id}>
                        <TableCell className="font-mono font-bold text-foreground">
                          {o.orderNumber || o.orderId}
                        </TableCell>
                        <TableCell className="font-medium text-foreground">
                          {o.patientName} <span className="text-muted-foreground">({o.patientDisplayId})</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px] text-blue-700 dark:text-blue-400 border-blue-200">
                            {o.modality}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium text-foreground">{o.bodyPart || o.imagingType}</TableCell>
                        <TableCell className="text-muted-foreground">{o.paymentMethod || "Cash"}</TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px]",
                              isCleared
                                ? "bg-emerald-500/10 text-emerald-700 border-emerald-200"
                                : isInsurance
                                ? "bg-indigo-500/10 text-indigo-700 border-indigo-200"
                                : "bg-rose-500/10 text-rose-700 border-rose-200"
                            )}
                          >
                            {isCleared ? "Cleared for Scan" : isInsurance ? "Pre-Auth Verified" : "Payment Pending"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {!isCleared ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-[11px] gap-1 px-2 text-rose-600 hover:text-rose-700"
                                onClick={() => navigate("/billing")}
                              >
                                Send to Cashier
                              </Button>
                              <Button
                                size="sm"
                                className="h-7 text-[11px] gap-1 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                                onClick={() => handleClearOrder(o)}
                              >
                                Clear Now
                              </Button>
                            </div>
                          ) : (
                            <span className="text-[11px] text-emerald-600 font-semibold flex items-center justify-end gap-1">
                              <CheckCircle2 className="h-3.5 w-3.5" /> Cleared
                            </span>
                          )}
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
    </div>
  );
}
