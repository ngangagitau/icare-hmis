import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Clock, CheckCircle, AlertCircle } from "lucide-react";

const ClaimTracking = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold text-foreground">Claim Tracking</h1>
      <p className="text-muted-foreground text-sm">Track insurance claim status and payments</p>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[
        { label: "Total Claims", value: "156", icon: DollarSign, color: "text-blue-600" },
        { label: "Pending", value: "23", icon: Clock, color: "text-yellow-600" },
        { label: "Approved", value: "118", icon: CheckCircle, color: "text-green-600" },
        { label: "Rejected", value: "15", icon: AlertCircle, color: "text-red-600" },
      ].map(s => (
        <Card key={s.label}><CardContent className="p-4 flex items-center gap-3">
          <s.icon className={`h-8 w-8 ${s.color}`} /><div><p className="text-2xl font-bold">{s.value}</p><p className="text-xs text-muted-foreground">{s.label}</p></div>
        </CardContent></Card>
      ))}
    </div>
    <Card>
      <CardHeader><CardTitle>Claims Pipeline (KES)</CardTitle></CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[
            { insurer: "SHA", submitted: "KES 2.4M", approved: "KES 1.8M", paid: "KES 1.2M", pending: "KES 600K" },
            { insurer: "AAR", submitted: "KES 1.8M", approved: "KES 1.5M", paid: "KES 1.1M", pending: "KES 400K" },
            { insurer: "Jubilee", submitted: "KES 980K", approved: "KES 750K", paid: "KES 500K", pending: "KES 250K" },
            { insurer: "Britam", submitted: "KES 650K", approved: "KES 500K", paid: "KES 350K", pending: "KES 150K" },
          ].map(i => (
            <div key={i.insurer} className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">{i.insurer}</h3>
              <div className="grid grid-cols-4 gap-2 text-sm">
                <div><span className="text-muted-foreground">Submitted:</span><br/>{i.submitted}</div>
                <div><span className="text-muted-foreground">Approved:</span><br/>{i.approved}</div>
                <div><span className="text-muted-foreground">Paid:</span><br/>{i.paid}</div>
                <div><span className="text-muted-foreground">Pending:</span><br/>{i.pending}</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

export default ClaimTracking;
