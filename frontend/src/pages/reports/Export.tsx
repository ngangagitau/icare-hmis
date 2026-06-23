import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Download } from "lucide-react";
export default function ExportReports() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-heading font-bold text-foreground">Export Reports</h1><p className="text-muted-foreground text-sm">Export reports to PDF, Excel, or Word</p></div>
      <Card><CardHeader><CardTitle className="text-base">Export Configuration</CardTitle></CardHeader><CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2"><Label>Report Type</Label><Select><SelectTrigger><SelectValue placeholder="Select report" /></SelectTrigger><SelectContent><SelectItem value="trial">Trial Balance</SelectItem><SelectItem value="income">Income Statement</SelectItem><SelectItem value="balance">Balance Sheet</SelectItem><SelectItem value="payroll">Payroll Summary</SelectItem></SelectContent></Select></div>
          <div className="space-y-2"><Label>Format</Label><Select><SelectTrigger><SelectValue placeholder="Select format" /></SelectTrigger><SelectContent><SelectItem value="pdf">PDF</SelectItem><SelectItem value="excel">MS Excel</SelectItem><SelectItem value="word">MS Word</SelectItem></SelectContent></Select></div>
          <div className="space-y-2"><Label>Period</Label><Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="mar">March 2024</SelectItem><SelectItem value="feb">February 2024</SelectItem><SelectItem value="q1">Q1 2024</SelectItem></SelectContent></Select></div>
        </div>
        <Button onClick={() => toast.success("Report exported!")}><Download className="h-4 w-4 mr-2" />Export Report</Button>
      </CardContent></Card>
    </div>
  );
}
