import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const bodies = [
  { id: "M-001", name: "John Doe (Unidentified)", dateAdmitted: "2026-03-10", cause: "Pending autopsy", compartment: "C-01", status: "Awaiting Release", nextOfKin: "Unknown" },
  { id: "M-002", name: "Agnes Wambui", dateAdmitted: "2026-03-12", cause: "Natural causes", compartment: "C-03", status: "Ready for Release", nextOfKin: "David Kamau - Son" },
  { id: "M-003", name: "Samuel Omondi", dateAdmitted: "2026-03-13", cause: "Road traffic accident", compartment: "C-05", status: "Admitted", nextOfKin: "Mary Omondi - Wife" },
];

const Mortuary = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold text-foreground">Body Register</h1>
      <p className="text-muted-foreground text-sm">Mortuary management and body tracking</p>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[
        { label: "Total Bodies", value: "3" },
        { label: "Capacity", value: "12" },
        { label: "Awaiting Release", value: "1" },
        { label: "Available Compartments", value: "9" },
      ].map(s => (
        <Card key={s.label}><CardContent className="p-4">
          <p className="text-2xl font-bold">{s.value}</p><p className="text-xs text-muted-foreground">{s.label}</p>
        </CardContent></Card>
      ))}
    </div>
    <Card>
      <CardContent className="pt-6">
        <table className="w-full text-sm">
          <thead><tr className="border-b text-left text-muted-foreground">
            <th className="pb-2 pr-4">ID</th><th className="pb-2 pr-4">Name</th><th className="pb-2 pr-4">Date Admitted</th>
            <th className="pb-2 pr-4">Cause</th><th className="pb-2 pr-4">Compartment</th><th className="pb-2 pr-4">Next of Kin</th><th className="pb-2">Status</th>
          </tr></thead>
          <tbody>{bodies.map(b => (
            <tr key={b.id} className="border-b last:border-0">
              <td className="py-3 pr-4 font-mono">{b.id}</td><td className="py-3 pr-4 font-medium">{b.name}</td>
              <td className="py-3 pr-4">{b.dateAdmitted}</td><td className="py-3 pr-4">{b.cause}</td>
              <td className="py-3 pr-4">{b.compartment}</td><td className="py-3 pr-4">{b.nextOfKin}</td>
              <td className="py-3"><Badge variant="secondary">{b.status}</Badge></td>
            </tr>
          ))}</tbody>
        </table>
      </CardContent>
    </Card>
  </div>
);

export default Mortuary;
