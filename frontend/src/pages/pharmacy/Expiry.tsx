import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ShieldAlert,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Search,
  Loader2,
  Calendar,
  DollarSign,
  Ban,
  Archive,
  RefreshCw,
} from "lucide-react";
import { usePharmacyExpiries } from "@/hooks/usePharmacyOps";
import { toast } from "sonner";
import type { PharmacyExpiryItem } from "@/lib/pharmacyOpsService";

export default function ExpiryTracking() {
  const { data: items = [], isLoading, refetch } = usePharmacyExpiries();
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState<"all" | "expired" | "critical" | "warning">("all");

  const filteredItems = useMemo(() => {
    let result = items;
    if (tierFilter === "expired") {
      result = result.filter((i) => i.daysLeft < 0);
    } else if (tierFilter === "critical") {
      result = result.filter((i) => i.daysLeft >= 0 && i.daysLeft <= 30);
    } else if (tierFilter === "warning") {
      result = result.filter((i) => i.daysLeft > 30 && i.daysLeft <= 90);
    }

    if (!search) return result;
    const lower = search.toLowerCase();
    return result.filter(
      (i) =>
        i.drug.toLowerCase().includes(lower) ||
        i.code.toLowerCase().includes(lower) ||
        i.batch.toLowerCase().includes(lower) ||
        i.category.toLowerCase().includes(lower)
    );
  }, [items, search, tierFilter]);

  const expiredCount = items.filter((i) => i.daysLeft < 0).length;
  const criticalCount = items.filter((i) => i.daysLeft >= 0 && i.daysLeft <= 30).length;
  const warningCount = items.filter((i) => i.daysLeft > 30 && i.daysLeft <= 90).length;

  const totalValuationAtRisk = useMemo(() => {
    return items
      .filter((i) => i.daysLeft <= 90)
      .reduce((sum, item) => sum + (item.valuationAtRisk || 0), 0);
  }, [items]);

  const handleQuarantine = (item: PharmacyExpiryItem) => {
    toast.success(`Batch ${item.batch} for ${item.drug} flagged for quarantine removal.`);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground flex items-center gap-2">
            <Clock className="h-6 w-6 text-primary" />
            Batch Expiry Management & FEFO Monitoring
          </h1>
          <p className="text-muted-foreground text-sm">
            Identify aging pharmaceutical stock, minimize write-offs, and enforce First-Expiry-First-Out dispensing
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-1.5" />
            Scan Expiries
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-destructive/20 flex items-center justify-center text-destructive font-bold">
              <Ban className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-heading font-bold text-destructive">{expiredCount}</p>
              <p className="text-xs text-muted-foreground font-medium">Expired Batches</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-500/30 bg-orange-500/5">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-600 font-bold">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-heading font-bold text-orange-600">{criticalCount}</p>
              <p className="text-xs text-muted-foreground font-medium">Critical (&lt; 30 Days)</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-warning/30 bg-warning/5">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-warning/20 flex items-center justify-center text-warning font-bold">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-heading font-bold text-foreground">{warningCount}</p>
              <p className="text-xs text-muted-foreground font-medium">Warning (31 - 90 Days)</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xl font-heading font-bold text-foreground">
                KES {totalValuationAtRisk.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground font-medium">Valuation at Risk (&lt; 90d)</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table */}
      <Card className="shadow-card border-border">
        <CardHeader className="pb-3 border-b">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant={tierFilter === "all" ? "default" : "outline"}
                size="sm"
                className="h-8 text-xs"
                onClick={() => setTierFilter("all")}
              >
                All Batches ({items.length})
              </Button>
              <Button
                variant={tierFilter === "expired" ? "default" : "outline"}
                size="sm"
                className="h-8 text-xs"
                onClick={() => setTierFilter("expired")}
              >
                Expired ({expiredCount})
              </Button>
              <Button
                variant={tierFilter === "critical" ? "default" : "outline"}
                size="sm"
                className="h-8 text-xs"
                onClick={() => setTierFilter("critical")}
              >
                Critical &lt; 30d ({criticalCount})
              </Button>
              <Button
                variant={tierFilter === "warning" ? "default" : "outline"}
                size="sm"
                className="h-8 text-xs"
                onClick={() => setTierFilter("warning")}
              >
                Warning 31-90d ({warningCount})
              </Button>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search drug, batch or code..."
                className="pl-9 h-8 text-xs"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="text-xs">Scanning inventory batch expiration dates...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="text-xs font-semibold uppercase tracking-wide h-10">Drug Name</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wide h-10">Category</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wide h-10">Batch Number</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wide h-10">Expiry Date</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wide h-10 text-right">Remaining Units</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wide h-10 text-right">Value at Risk</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wide h-10 text-center">Days Left</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wide h-10 text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                        <CheckCircle2 className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
                        No pharmaceutical batches matching the selected expiration criteria.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredItems.map((item) => {
                      const isExpired = item.daysLeft < 0;
                      const isCritical = item.daysLeft >= 0 && item.daysLeft <= 30;
                      const isWarning = item.daysLeft > 30 && item.daysLeft <= 90;

                      return (
                        <TableRow key={item._id} className="hover:bg-accent/40 transition-colors">
                          <TableCell className="py-3">
                            <div className="font-semibold text-sm text-foreground">{item.drug}</div>
                            <span className="font-mono text-xs text-muted-foreground">{item.code}</span>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground py-3">
                            {item.category}
                          </TableCell>
                          <TableCell className="font-mono text-xs font-semibold py-3 text-primary">
                            {item.batch}
                          </TableCell>
                          <TableCell className="text-xs font-medium py-3">
                            {item.expiry || "—"}
                          </TableCell>
                          <TableCell className="text-right font-mono font-bold text-xs py-3">
                            {item.qty.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right font-mono text-xs py-3">
                            KES {item.valuationAtRisk.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-center py-3">
                            <Badge
                              variant="outline"
                              className={`text-[11px] font-bold ${
                                isExpired
                                  ? "bg-destructive text-destructive-foreground border-destructive"
                                  : isCritical
                                  ? "bg-orange-500/15 text-orange-600 border-orange-500/30"
                                  : isWarning
                                  ? "bg-warning/15 text-warning border-warning/30"
                                  : "bg-success/10 text-success border-success/30"
                              }`}
                            >
                              {isExpired ? `Expired (${Math.abs(item.daysLeft)}d ago)` : `${item.daysLeft} days`}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right py-3">
                            {isExpired || isCritical ? (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
                                onClick={() => handleQuarantine(item)}
                              >
                                <Archive className="h-3.5 w-3.5 mr-1" />
                                Quarantine
                              </Button>
                            ) : (
                              <span className="text-xs text-muted-foreground">Normal FEFO</span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
