import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const mealOrders = [
  { ward: "Medical Ward", patients: 12, breakfast: "Served", lunch: "Preparing", dinner: "Pending", special: 3 },
  { ward: "Surgical Ward", patients: 8, breakfast: "Served", lunch: "Preparing", dinner: "Pending", special: 2 },
  { ward: "Maternity", patients: 6, breakfast: "Served", lunch: "Served", dinner: "Pending", special: 1 },
  { ward: "Pediatric", patients: 10, breakfast: "Served", lunch: "Preparing", dinner: "Pending", special: 4 },
  { ward: "ICU", patients: 4, breakfast: "N/A (Enteral)", lunch: "N/A (Enteral)", dinner: "N/A (Enteral)", special: 4 },
];

const mealColor: Record<string, string> = {
  Served: "bg-green-100 text-green-800", Preparing: "bg-yellow-100 text-yellow-800", Pending: "bg-gray-100 text-gray-800",
};

const MealOrders = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold text-foreground">Meal Orders</h1>
      <p className="text-muted-foreground text-sm">Daily meal service tracking by ward</p>
    </div>
    <Card>
      <CardContent className="pt-6">
        <table className="w-full text-sm">
          <thead><tr className="border-b text-left text-muted-foreground">
            <th className="pb-2 pr-4">Ward</th><th className="pb-2 pr-4">Patients</th><th className="pb-2 pr-4">Breakfast</th>
            <th className="pb-2 pr-4">Lunch</th><th className="pb-2 pr-4">Dinner</th><th className="pb-2">Special Diets</th>
          </tr></thead>
          <tbody>{mealOrders.map(m => (
            <tr key={m.ward} className="border-b last:border-0">
              <td className="py-3 pr-4 font-medium">{m.ward}</td><td className="py-3 pr-4">{m.patients}</td>
              {[m.breakfast, m.lunch, m.dinner].map((s, i) => (
                <td key={i} className="py-3 pr-4"><Badge className={mealColor[s] || "bg-gray-100 text-gray-600"}>{s}</Badge></td>
              ))}
              <td className="py-3">{m.special}</td>
            </tr>
          ))}</tbody>
        </table>
      </CardContent>
    </Card>
  </div>
);

export default MealOrders;
