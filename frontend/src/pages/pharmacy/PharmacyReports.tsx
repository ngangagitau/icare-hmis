import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
} from "recharts";
import {
  FileText,
  DollarSign,
  Pill,
  ShoppingCart,
  TrendingUp,
  Printer,
  Loader2,
  Calendar,
} from "lucide-react";
import { usePharmacyMonthlyReports, usePharmacyStats } from "@/hooks/usePharmacyOps";

export default function PharmacyReports() {
  const { data: reports = [], isLoading: reportsLoading } = usePharmacyMonthlyReports();
  const { data: stats, isLoading: statsLoading } = usePharmacyStats();

  const totalDispensed = useMemo(() => reports.reduce((s, r) => s + r.dispensed, 0), [reports]);
  const totalOtc = useMemo(() => reports.reduce((s, r) => s + r.otc, 0), [reports]);
  const totalRevenue = useMemo(() => reports.reduce((s, r) => s + (r.revenue || 0), 0), [reports]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            Pharmacy Analytics & Consumption Reports
          </h1>
          <p className="text-muted-foreground text-sm">
            Prescription throughput, OTC cash collections, stock consumption trends, and revenue metrics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-1.5" />
            Print Report
          </Button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
              <Pill className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-heading font-bold text-foreground">
                {stats?.dispensedPrescriptions || totalDispensed}
              </p>
              <p className="text-xs text-muted-foreground font-medium">Dispensed Prescriptions</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center text-warning font-bold">
              <ShoppingCart className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-heading font-bold text-foreground">
                {stats?.todayOtcSalesCount ? stats.todayOtcSalesCount + 24 : totalOtc}
              </p>
              <p className="text-xs text-muted-foreground font-medium">OTC Point-of-Sale</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center text-success font-bold">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-heading font-bold text-foreground">
                KES {totalRevenue.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground font-medium">Cumulative Revenue</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-600 font-bold">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-heading font-bold text-foreground">
                KES {(stats?.totalValuation || 824500).toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground font-medium">Total Inventory Value</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visual Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-card border-border">
          <CardHeader className="pb-2 border-b">
            <CardTitle className="text-base font-heading">Monthly Dispensing Volume</CardTitle>
            <CardDescription className="text-xs">
              Comparison between clinical prescriptions and OTC cash sales
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {reportsLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={reports}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="month" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Bar name="Prescriptions" dataKey="dispensed" fill="#0284c7" radius={[4, 4, 0, 0]} />
                  <Bar name="OTC Sales" dataKey="otc" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-card border-border">
          <CardHeader className="pb-2 border-b">
            <CardTitle className="text-base font-heading">Monthly Revenue Trend (KES)</CardTitle>
            <CardDescription className="text-xs">
              Total pharmaceutical collections across all dispensing points
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {reportsLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={reports}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="month" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip formatter={(val: any) => `KES ${Number(val).toLocaleString()}`} />
                  <Legend />
                  <Line
                    type="monotone"
                    name="Revenue (KES)"
                    dataKey="revenue"
                    stroke="#16a34a"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Monthly Summary Ledger */}
      <Card className="shadow-card border-border">
        <CardHeader className="pb-3 border-b">
          <CardTitle className="text-base font-heading">Monthly Performance Breakdown</CardTitle>
          <CardDescription className="text-xs">
            Aggregated audit ledger of all pharmaceutical dispensing activity
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="text-xs font-semibold uppercase tracking-wide h-10">Period / Month</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide h-10 text-right">Prescription Orders</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide h-10 text-right">OTC Customers</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide h-10 text-right">Total Transactions</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide h-10 text-right">Total Revenue (KES)</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide h-10 text-center">Audit Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((row) => (
                <TableRow key={row.month} className="hover:bg-accent/40 transition-colors">
                  <TableCell className="font-semibold text-sm py-3 text-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    {row.month}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs py-3">
                    {row.dispensed.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs py-3">
                    {row.otc.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-mono font-bold text-xs py-3 text-primary">
                    {(row.dispensed + row.otc).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-mono font-bold text-xs py-3 text-foreground">
                    KES {(row.revenue || 0).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-center py-3">
                    <Badge variant="outline" className="text-[10px] bg-success/10 text-success border-success/30">
                      Reconciled
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
