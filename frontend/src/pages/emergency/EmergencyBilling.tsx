import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const bills = [
  { id: "E-001", patient: "John Ouma", services: "Resuscitation, ECG, Labs, Medication", total: "KES 45,000", insurance: "SHA", status: "Pending Auth" },
  { id: "E-002", patient: "Alice Wanjiru", services: "Consultation, Ultrasound, Labs", total: "KES 12,500", insurance: "Cash", status: "Billed" },
  { id: "E-003", patient: "Tom Kiprono", services: "Surgery, ICU, Blood, Imaging", total: "KES 185,000", insurance: "AAR", status: "Pre-Auth Approved" },
];

const EmergencyBilling = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold text-foreground">Emergency Billing</h1>
      <p className="text-muted-foreground text-sm">Billing for emergency department services</p>
    </div>
    <Card>
      <CardContent className="pt-6">
        <table className="w-full text-sm">
          <thead><tr className="border-b text-left text-muted-foreground">
            <th className="pb-2 pr-4">Case</th><th className="pb-2 pr-4">Patient</th><th className="pb-2 pr-4">Services</th>
            <th className="pb-2 pr-4">Total</th><th className="pb-2 pr-4">Payer</th><th className="pb-2">Status</th>
          </tr></thead>
          <tbody>{bills.map(b => (
            <tr key={b.id} className="border-b last:border-0">
              <td className="py-3 pr-4 font-mono">{b.id}</td><td className="py-3 pr-4 font-medium">{b.patient}</td>
              <td className="py-3 pr-4 max-w-[200px] truncate">{b.services}</td><td className="py-3 pr-4 font-medium">{b.total}</td>
              <td className="py-3 pr-4">{b.insurance}</td>
              <td className="py-3"><Badge variant="outline">{b.status}</Badge></td>
            </tr>
          ))}</tbody>
        </table>
      </CardContent>
    </Card>
  </div>
);

export default EmergencyBilling;
