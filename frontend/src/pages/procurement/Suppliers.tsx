import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

const suppliers = [
  { id: "SUP-001", name: "MediSupply Ltd", contact: "James Ochieng", phone: "0712000001", email: "james@medisupply.co.ke", balance: 125000, terms: "Net 30" },
  { id: "SUP-002", name: "PharmaCo East", contact: "Sarah Mwende", phone: "0723000002", email: "sarah@pharmaco.co.ke", balance: 85000, terms: "Net 45" },
  { id: "SUP-003", name: "LabEquip Kenya", contact: "Peter Ngugi", phone: "0734000003", email: "peter@labequip.co.ke", balance: 0, terms: "Net 30" },
  { id: "SUP-004", name: "SurgicalTools Ltd", contact: "Mary Njoki", phone: "0745000004", email: "mary@surgtools.co.ke", balance: 38000, terms: "Net 60" },
];

export default function Suppliers() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><div><h1 className="text-2xl font-heading font-bold text-foreground">Suppliers</h1><p className="text-muted-foreground text-sm">Manage supplier directory and contact information</p></div><Button>Add Supplier</Button></div>
      <Card><CardContent className="pt-6">
        <Table>
          <TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Supplier</TableHead><TableHead>Contact</TableHead><TableHead>Phone</TableHead><TableHead>Email</TableHead><TableHead>Balance (KES)</TableHead><TableHead>Terms</TableHead></TableRow></TableHeader>
          <TableBody>{suppliers.map(s => (
            <TableRow key={s.id}><TableCell className="font-mono">{s.id}</TableCell><TableCell className="font-medium">{s.name}</TableCell><TableCell>{s.contact}</TableCell><TableCell>{s.phone}</TableCell><TableCell className="text-sm">{s.email}</TableCell><TableCell>{s.balance.toLocaleString()}</TableCell><TableCell>{s.terms}</TableCell></TableRow>
          ))}</TableBody>
        </Table>
      </CardContent></Card>
    </div>
  );
}
