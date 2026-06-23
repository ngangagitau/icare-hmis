import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Building2, Search, Plus, TrendingDown, DollarSign, Package } from "lucide-react";

const assets = [
  { id: "FA-001", name: "X-Ray Machine (Digital)", category: "Medical Equipment", acquired: "2024-06-15", cost: "KES 3,500,000", nbv: "KES 2,800,000", depreciation: "KES 700,000", status: "Active" },
  { id: "FA-002", name: "Ultrasound Scanner", category: "Medical Equipment", acquired: "2023-01-10", cost: "KES 2,200,000", nbv: "KES 1,540,000", depreciation: "KES 660,000", status: "Active" },
  { id: "FA-003", name: "Hospital Van (KCE 123J)", category: "Motor Vehicles", acquired: "2022-03-20", cost: "KES 4,800,000", nbv: "KES 2,880,000", depreciation: "KES 1,920,000", status: "Active" },
  { id: "FA-004", name: "Server Room Equipment", category: "IT Equipment", acquired: "2024-09-01", cost: "KES 850,000", nbv: "KES 708,000", depreciation: "KES 142,000", status: "Active" },
  { id: "FA-005", name: "Autoclave Machine", category: "Medical Equipment", acquired: "2020-11-05", cost: "KES 1,200,000", nbv: "KES 0", depreciation: "KES 1,200,000", status: "Disposed" },
];

const statusStyle: Record<string, string> = {
  Active: "bg-success/10 text-success border-success/20",
  Disposed: "bg-muted text-muted-foreground",
};

const FixedAssets = () => (
  <div className="space-y-6 animate-fade-in">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-heading font-bold">Fixed Assets Management</h1>
        <p className="text-sm text-muted-foreground mt-1">Asset tracking, depreciation & disposal</p>
      </div>
      <Button className="gap-2"><Plus className="h-4 w-4" /> Register Asset</Button>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
      {[
        { label: "Total Assets", count: 142, icon: Building2, color: "text-primary" },
        { label: "Total Cost", count: "KES 48M", icon: DollarSign, color: "text-info" },
        { label: "Total Depreciation", count: "KES 14M", icon: TrendingDown, color: "text-warning" },
        { label: "NBV", count: "KES 34M", icon: Package, color: "text-success" },
      ].map(s => (
        <Card key={s.label} className="shadow-card border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className={`h-10 w-10 rounded-lg bg-muted flex items-center justify-center ${s.color}`}>
              <s.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-heading font-bold">{s.count}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>

    <Card className="shadow-card border-border">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <CardTitle className="text-base font-heading">Asset Register</CardTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search assets..." className="pl-9 w-56" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="pb-3 font-medium text-muted-foreground">ID</th>
                <th className="pb-3 font-medium text-muted-foreground">Asset</th>
                <th className="pb-3 font-medium text-muted-foreground">Category</th>
                <th className="pb-3 font-medium text-muted-foreground text-right">Cost</th>
                <th className="pb-3 font-medium text-muted-foreground text-right">Depreciation</th>
                <th className="pb-3 font-medium text-muted-foreground text-right">NBV</th>
                <th className="pb-3 font-medium text-muted-foreground text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {assets.map(a => (
                <tr key={a.id} className="border-b border-border last:border-0">
                  <td className="py-3 font-medium text-primary">{a.id}</td>
                  <td className="py-3">
                    <p className="font-medium">{a.name}</p>
                    <p className="text-xs text-muted-foreground">Acquired: {a.acquired}</p>
                  </td>
                  <td className="py-3 text-muted-foreground">{a.category}</td>
                  <td className="py-3 text-right font-semibold">{a.cost}</td>
                  <td className="py-3 text-right text-muted-foreground">{a.depreciation}</td>
                  <td className="py-3 text-right font-semibold">{a.nbv}</td>
                  <td className="py-3 text-right">
                    <Badge variant="outline" className={`text-[11px] ${statusStyle[a.status]}`}>{a.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  </div>
);

export default FixedAssets;
