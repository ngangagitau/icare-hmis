import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle } from "lucide-react";

const QualityControl = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold text-foreground">Quality Control</h1>
      <p className="text-muted-foreground text-sm">Sterilization quality assurance and compliance</p>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[
        { label: "Cycles Today", value: "12", pass: true },
        { label: "All Passed", value: "11", pass: true },
        { label: "Failed", value: "1", pass: false },
        { label: "Compliance", value: "98.5%", pass: true },
      ].map(s => (
        <Card key={s.label}><CardContent className="p-4 flex items-center gap-3">
          {s.pass ? <CheckCircle className="h-8 w-8 text-green-600" /> : <AlertCircle className="h-8 w-8 text-red-600" />}
          <div><p className="text-2xl font-bold">{s.value}</p><p className="text-xs text-muted-foreground">{s.label}</p></div>
        </CardContent></Card>
      ))}
    </div>
    <Card>
      <CardHeader><CardTitle>Recent Quality Checks</CardTitle></CardHeader>
      <CardContent>
        <div className="space-y-3">
          {[
            { test: "Biological Indicator (Spore Test)", date: "2026-03-13", result: "Pass", autoclave: "Autoclave 1" },
            { test: "Chemical Indicator Strip", date: "2026-03-13", result: "Pass", autoclave: "Autoclave 2" },
            { test: "Bowie-Dick Test", date: "2026-03-13", result: "Pass", autoclave: "Autoclave 1" },
            { test: "Biological Indicator (Spore Test)", date: "2026-03-12", result: "Fail - Reprocessed", autoclave: "Autoclave 2" },
          ].map((q, i) => (
            <div key={i} className="flex items-center justify-between border rounded-lg p-3">
              <div>
                <p className="font-medium text-sm">{q.test}</p>
                <p className="text-xs text-muted-foreground">{q.autoclave} • {q.date}</p>
              </div>
              <Badge variant={q.result.startsWith("Pass") ? "default" : "destructive"}>{q.result}</Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

export default QualityControl;
