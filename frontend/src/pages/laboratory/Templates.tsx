import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const templates = [
  { name: "Complete Blood Count (CBC)", params: ["WBC", "RBC", "Hemoglobin", "Hematocrit", "Platelets", "MCV", "MCH", "MCHC"] },
  { name: "Liver Function Tests (LFT)", params: ["ALT", "AST", "ALP", "Bilirubin Total", "Bilirubin Direct", "Albumin", "Total Protein"] },
  { name: "Renal Function Tests (RFT)", params: ["Urea", "Creatinine", "Sodium", "Potassium", "Chloride"] },
  { name: "Urinalysis", params: ["pH", "Specific Gravity", "Protein", "Glucose", "Ketones", "Blood", "WBC", "RBC"] },
];

export default function TestTemplates() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><div><h1 className="text-2xl font-heading font-bold text-foreground">Test Templates</h1><p className="text-muted-foreground text-sm">Preconfigured test result entry forms</p></div><Button>Create Template</Button></div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {templates.map(t => (
          <Card key={t.name}>
            <CardHeader><CardTitle className="text-base">{t.name}</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {t.params.map(p => <div key={p} className="space-y-1"><Label className="text-xs">{p}</Label><Input placeholder="Value" className="h-8 text-sm" disabled /></div>)}
              </div>
              <Button size="sm" variant="outline" className="mt-4" onClick={() => toast.info(`Editing ${t.name}`)}>Edit Template</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
