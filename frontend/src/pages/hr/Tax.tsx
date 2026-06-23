import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const taxData = [
  { employee: "Dr. Kamau", gross: 300000, taxable: 278840, paye: 52500, nhif: 1700, nssf: 2160, totalDed: 56360, relief: 2400 },
  { employee: "Dr. Ouma", gross: 265000, taxable: 243840, paye: 45000, nhif: 1700, nssf: 2160, totalDed: 48860, relief: 2400 },
  { employee: "Nurse Wanjiku", gross: 95000, taxable: 73840, paye: 12000, nhif: 1700, nssf: 2160, totalDed: 15860, relief: 2400 },
  { employee: "Tech Otieno", gross: 75000, taxable: 53840, paye: 8000, nhif: 1700, nssf: 2160, totalDed: 11860, relief: 2400 },
];

export default function TaxBenefits() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-heading font-bold text-foreground">Tax & Benefits</h1><p className="text-muted-foreground text-sm">PAYE, NHIF, NSSF compliance and reporting</p></div>
      <Card><CardContent className="pt-6 overflow-x-auto">
        <Table>
          <TableHeader><TableRow><TableHead>Employee</TableHead><TableHead className="text-right">Gross (KES)</TableHead><TableHead className="text-right">Taxable</TableHead><TableHead className="text-right">PAYE</TableHead><TableHead className="text-right">NHIF</TableHead><TableHead className="text-right">NSSF</TableHead><TableHead className="text-right">Total Ded.</TableHead><TableHead className="text-right">Relief</TableHead></TableRow></TableHeader>
          <TableBody>{taxData.map(t => (
            <TableRow key={t.employee}><TableCell className="font-medium">{t.employee}</TableCell><TableCell className="text-right">{t.gross.toLocaleString()}</TableCell><TableCell className="text-right">{t.taxable.toLocaleString()}</TableCell><TableCell className="text-right">{t.paye.toLocaleString()}</TableCell><TableCell className="text-right">{t.nhif.toLocaleString()}</TableCell><TableCell className="text-right">{t.nssf.toLocaleString()}</TableCell><TableCell className="text-right">{t.totalDed.toLocaleString()}</TableCell><TableCell className="text-right">{t.relief.toLocaleString()}</TableCell></TableRow>
          ))}</TableBody>
        </Table>
      </CardContent></Card>
    </div>
  );
}
