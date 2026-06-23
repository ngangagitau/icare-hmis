import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Download, Printer, BarChart3, TrendingUp, Users, DollarSign, Package, Calendar } from "lucide-react";

const financialReports = [
  { name: "Trial Balance", period: "March 2026", lastRun: "2026-03-10", format: "PDF, Excel" },
  { name: "Income Statement", period: "Q1 2026", lastRun: "2026-03-09", format: "PDF, Excel" },
  { name: "Balance Sheet", period: "March 2026", lastRun: "2026-03-10", format: "PDF" },
  { name: "Cash Flow Statement", period: "Q1 2026", lastRun: "2026-03-08", format: "PDF, Excel" },
  { name: "Revenue by Department", period: "March 2026", lastRun: "2026-03-10", format: "PDF, Excel, Word" },
];

const clinicalReports = [
  { name: "Daily Patient Summary", period: "2026-03-10", lastRun: "2026-03-10", format: "PDF" },
  { name: "Department Workload Report", period: "March 2026", lastRun: "2026-03-09", format: "PDF, Excel" },
  { name: "Lab Turnaround Time", period: "March 2026", lastRun: "2026-03-08", format: "PDF" },
  { name: "Diagnosis Statistics (MOH)", period: "Q1 2026", lastRun: "2026-03-07", format: "PDF, Excel" },
  { name: "Bed Occupancy Report", period: "March 2026", lastRun: "2026-03-10", format: "PDF" },
];

const inventoryReports = [
  { name: "Stock Levels Summary", period: "Current", lastRun: "2026-03-10", format: "PDF, Excel" },
  { name: "Stock Movement Report", period: "March 2026", lastRun: "2026-03-09", format: "Excel" },
  { name: "Expiry Alert Report", period: "Current", lastRun: "2026-03-10", format: "PDF" },
  { name: "Consumption Analysis", period: "Q1 2026", lastRun: "2026-03-08", format: "PDF, Excel" },
];

const payrollReports = [
  { name: "Payroll Summary", period: "March 2026", lastRun: "2026-03-10", format: "PDF, Excel" },
  { name: "PAYE Returns", period: "March 2026", lastRun: "2026-03-10", format: "PDF" },
  { name: "NSSF Returns", period: "March 2026", lastRun: "2026-03-10", format: "PDF" },
  { name: "NHIF/SHA Returns", period: "March 2026", lastRun: "2026-03-10", format: "PDF" },
  { name: "Leave Balances", period: "Current", lastRun: "2026-03-10", format: "Excel" },
];

const ReportTable = ({ reports }: { reports: typeof financialReports }) => (
  <Card className="shadow-card border-border">
    <CardContent className="pt-4">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left">
            <th className="pb-3 font-medium text-muted-foreground">Report</th>
            <th className="pb-3 font-medium text-muted-foreground">Period</th>
            <th className="pb-3 font-medium text-muted-foreground">Last Run</th>
            <th className="pb-3 font-medium text-muted-foreground">Formats</th>
            <th className="pb-3 font-medium text-muted-foreground text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {reports.map(r => (
            <tr key={r.name} className="border-b border-border last:border-0">
              <td className="py-3 font-medium">{r.name}</td>
              <td className="py-3 text-muted-foreground">{r.period}</td>
              <td className="py-3 text-muted-foreground">{r.lastRun}</td>
              <td className="py-3">
                <div className="flex gap-1 flex-wrap">
                  {r.format.split(", ").map(f => (
                    <Badge key={f} variant="outline" className="text-[10px]">{f}</Badge>
                  ))}
                </div>
              </td>
              <td className="py-3 text-right">
                <div className="flex justify-end gap-1">
                  <Button size="sm" variant="outline" className="h-7 text-xs gap-1"><BarChart3 className="h-3 w-3" /> Generate</Button>
                  <Button size="sm" variant="outline" className="h-7 text-xs gap-1"><Download className="h-3 w-3" /></Button>
                  <Button size="sm" variant="outline" className="h-7 text-xs gap-1"><Printer className="h-3 w-3" /></Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </CardContent>
  </Card>
);

const Reports = () => (
  <div className="space-y-6 animate-fade-in">
    <div>
      <h1 className="text-2xl font-heading font-bold">Comprehensive Reports</h1>
      <p className="text-sm text-muted-foreground mt-1">Financial, clinical, inventory & payroll reports — exportable to PDF, Excel & Word</p>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
      {[
        { label: "Financial", count: 12, icon: DollarSign, color: "text-primary" },
        { label: "Clinical", count: 18, icon: Users, color: "text-info" },
        { label: "Inventory", count: 8, icon: Package, color: "text-warning" },
        { label: "Payroll/HR", count: 6, icon: Calendar, color: "text-success" },
      ].map(s => (
        <Card key={s.label} className="shadow-card border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className={`h-10 w-10 rounded-lg bg-muted flex items-center justify-center ${s.color}`}>
              <s.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-heading font-bold">{s.count}</p>
              <p className="text-xs text-muted-foreground">{s.label} Reports</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>

    <Tabs defaultValue="financial">
      <TabsList>
        <TabsTrigger value="financial">Financial</TabsTrigger>
        <TabsTrigger value="clinical">Clinical</TabsTrigger>
        <TabsTrigger value="inventory">Inventory</TabsTrigger>
        <TabsTrigger value="payroll">Payroll & HR</TabsTrigger>
      </TabsList>
      <TabsContent value="financial"><ReportTable reports={financialReports} /></TabsContent>
      <TabsContent value="clinical"><ReportTable reports={clinicalReports} /></TabsContent>
      <TabsContent value="inventory"><ReportTable reports={inventoryReports} /></TabsContent>
      <TabsContent value="payroll"><ReportTable reports={payrollReports} /></TabsContent>
    </Tabs>
  </div>
);

export default Reports;
