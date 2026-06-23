import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
const reports = ["Monthly Payroll Summary","PAYE Returns","NHIF Contributions","NSSF Contributions","Leave Balance Report"];
export default function PayrollReports() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-heading font-bold text-foreground">Payroll Reports</h1><p className="text-muted-foreground text-sm">Tax and benefit compliance reports</p></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{reports.map(r => (
        <Card key={r}><CardContent className="pt-6 flex items-center justify-between"><span className="font-medium">{r}</span><Button size="sm" variant="outline">Generate</Button></CardContent></Card>
      ))}</div>
    </div>
  );
}
