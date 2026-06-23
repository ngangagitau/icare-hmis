import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const prescriptions = [
  { id: "EP-001", patient: "Mary Wanjiku", doctor: "Dr. Ochieng", medications: "Metformin 500mg BD, Lisinopril 10mg OD", date: "2026-03-13", status: "Sent to Pharmacy" },
  { id: "EP-002", patient: "James Kamau", doctor: "Dr. Njeri", medications: "Amoxicillin 500mg TDS x 7 days", date: "2026-03-13", status: "Dispensed" },
  { id: "EP-003", patient: "Grace Akinyi", doctor: "Dr. Wambui", medications: "Omeprazole 20mg OD, Buscopan PRN", date: "2026-03-12", status: "Pending" },
];

const EPrescriptions = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold text-foreground">E-Prescriptions</h1>
      <p className="text-muted-foreground text-sm">Electronic prescriptions from telemedicine consultations</p>
    </div>
    <Card>
      <CardContent className="pt-6">
        <table className="w-full text-sm">
          <thead><tr className="border-b text-left text-muted-foreground">
            <th className="pb-2 pr-4">Rx ID</th><th className="pb-2 pr-4">Patient</th><th className="pb-2 pr-4">Doctor</th>
            <th className="pb-2 pr-4">Medications</th><th className="pb-2 pr-4">Date</th><th className="pb-2">Status</th>
          </tr></thead>
          <tbody>{prescriptions.map(p => (
            <tr key={p.id} className="border-b last:border-0">
              <td className="py-3 pr-4 font-mono">{p.id}</td><td className="py-3 pr-4 font-medium">{p.patient}</td>
              <td className="py-3 pr-4">{p.doctor}</td><td className="py-3 pr-4 max-w-[250px]">{p.medications}</td>
              <td className="py-3 pr-4">{p.date}</td>
              <td className="py-3"><Badge variant="secondary">{p.status}</Badge></td>
            </tr>
          ))}</tbody>
        </table>
      </CardContent>
    </Card>
  </div>
);

export default EPrescriptions;
