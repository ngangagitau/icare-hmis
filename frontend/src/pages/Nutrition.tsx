import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const dietPlans = [
  { patient: "Mary Wanjiku", ward: "Medical Ward", diet: "Diabetic Diet", calories: "1800 kcal", allergies: "None", status: "Active" },
  { patient: "James Kamau", ward: "Surgical Ward", diet: "Soft Diet (Post-Op)", calories: "2000 kcal", allergies: "Shellfish", status: "Active" },
  { patient: "Grace Akinyi", ward: "Maternity", diet: "High Protein", calories: "2200 kcal", allergies: "Lactose intolerant", status: "Active" },
  { patient: "Peter Mwangi", ward: "Pediatric", diet: "Pediatric Standard", calories: "1400 kcal", allergies: "Peanuts", status: "Active" },
  { patient: "Tom Kiprono", ward: "ICU", diet: "Enteral (NG tube)", calories: "1600 kcal", allergies: "None", status: "Monitoring" },
];

const Nutrition = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold text-foreground">Diet Plans</h1>
      <p className="text-muted-foreground text-sm">Inpatient dietary management and nutrition plans</p>
    </div>
    <Card>
      <CardHeader><CardTitle>Active Diet Plans</CardTitle></CardHeader>
      <CardContent>
        <table className="w-full text-sm">
          <thead><tr className="border-b text-left text-muted-foreground">
            <th className="pb-2 pr-4">Patient</th><th className="pb-2 pr-4">Ward</th><th className="pb-2 pr-4">Diet Type</th>
            <th className="pb-2 pr-4">Calories</th><th className="pb-2 pr-4">Allergies</th><th className="pb-2">Status</th>
          </tr></thead>
          <tbody>{dietPlans.map((d, i) => (
            <tr key={i} className="border-b last:border-0">
              <td className="py-3 pr-4 font-medium">{d.patient}</td><td className="py-3 pr-4">{d.ward}</td>
              <td className="py-3 pr-4">{d.diet}</td><td className="py-3 pr-4">{d.calories}</td>
              <td className="py-3 pr-4">{d.allergies}</td>
              <td className="py-3"><Badge variant="secondary">{d.status}</Badge></td>
            </tr>
          ))}</tbody>
        </table>
      </CardContent>
    </Card>
  </div>
);

export default Nutrition;
