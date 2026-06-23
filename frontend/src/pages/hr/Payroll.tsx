import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

const payroll = [
  { emp: "Dr. Kamau", basic: 250000, allowances: 50000, deductions: 75000, paye: 52500, nhif: 1700, nssf: 2160, net: 168640 },
  { emp: "Dr. Ouma", basic: 220000, allowances: 45000, deductions: 65000, paye: 45000, nhif: 1700, nssf: 2160, net: 151140 },
  { emp: "Nurse Wanjiku", basic: 80000, allowances: 15000, deductions: 22000, paye: 12000, nhif: 1700, nssf: 2160, net: 57140 },
  { emp: "Tech Otieno", basic: 65000, allowances: 10000, deductions: 16000, paye: 8000, nhif: 1700, nssf: 2160, net: 47140 },
  { emp: "Cashier Jane", basic: 55000, allowances: 8000, deductions: 13000, paye: 5500, nhif: 1200, nssf: 2160, net: 41140 },
];

export default function Payroll() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><div><h1 className="text-2xl font-heading font-bold text-foreground">Payroll Processing</h1><p className="text-muted-foreground text-sm">March 2024 payroll</p></div><Button>Process Payroll</Button></div>
      <Card><CardContent className="pt-6 overflow-x-auto">
        <Table>
          <TableHeader><TableRow><TableHead>Employee</TableHead><TableHead className="text-right">Basic</TableHead><TableHead className="text-right">Allowances</TableHead><TableHead className="text-right">PAYE</TableHead><TableHead className="text-right">NHIF</TableHead><TableHead className="text-right">NSSF</TableHead><TableHead className="text-right">Other Ded.</TableHead><TableHead className="text-right">Net Pay (KES)</TableHead></TableRow></TableHeader>
          <TableBody>
            {payroll.map(p => <TableRow key={p.emp}><TableCell className="font-medium">{p.emp}</TableCell><TableCell className="text-right">{p.basic.toLocaleString()}</TableCell><TableCell className="text-right">{p.allowances.toLocaleString()}</TableCell><TableCell className="text-right">{p.paye.toLocaleString()}</TableCell><TableCell className="text-right">{p.nhif.toLocaleString()}</TableCell><TableCell className="text-right">{p.nssf.toLocaleString()}</TableCell><TableCell className="text-right">{(p.deductions - p.paye - p.nhif - p.nssf).toLocaleString()}</TableCell><TableCell className="text-right font-bold">{p.net.toLocaleString()}</TableCell></TableRow>)}
            <TableRow className="bg-muted/50 font-bold"><TableCell>Total</TableCell><TableCell className="text-right">{payroll.reduce((s, p) => s + p.basic, 0).toLocaleString()}</TableCell><TableCell className="text-right">{payroll.reduce((s, p) => s + p.allowances, 0).toLocaleString()}</TableCell><TableCell className="text-right">{payroll.reduce((s, p) => s + p.paye, 0).toLocaleString()}</TableCell><TableCell className="text-right">{payroll.reduce((s, p) => s + p.nhif, 0).toLocaleString()}</TableCell><TableCell className="text-right">{payroll.reduce((s, p) => s + p.nssf, 0).toLocaleString()}</TableCell><TableCell></TableCell><TableCell className="text-right">{payroll.reduce((s, p) => s + p.net, 0).toLocaleString()}</TableCell></TableRow>
          </TableBody>
        </Table>
      </CardContent></Card>
    </div>
  );
}
