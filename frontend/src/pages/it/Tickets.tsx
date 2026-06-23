import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardCheck, Clock, Phone } from "lucide-react";

const tickets = [
  { id: "TS-0001", requester: "Dr. Mwende", issue: "EMR login timeout", status: "Open", age: "12m" },
  { id: "TS-0002", requester: "Pharmacy", issue: "POS terminal offline", status: "Escalated", age: "25m" },
  { id: "TS-0003", requester: "Nursing", issue: "Printer spooler error", status: "Queued", age: "1h" },
];

const statusColor: Record<string, string> = {
  Open: "bg-primary/10 text-primary",
  Escalated: "bg-destructive/10 text-destructive",
  Queued: "bg-warning/10 text-warning",
};

const Tickets = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold">Helpdesk Tickets</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track support requests from across the hospital and resolve them quickly.
          </p>
        </div>
        <Button size="sm" className="h-9 gap-2">
          <Phone className="h-4 w-4" /> New Ticket
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="shadow-card border-border">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Open tickets</p>
            <p className="text-3xl font-heading font-bold">{tickets.length}</p>
          </CardContent>
        </Card>
        <Card className="shadow-card border-border">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Average response</p>
            <p className="text-3xl font-heading font-bold">18m</p>
          </CardContent>
        </Card>
        <Card className="shadow-card border-border">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Resolved today</p>
            <p className="text-3xl font-heading font-bold">7</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-card border-border">
        <CardHeader>
          <CardTitle>Active Support Requests</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {tickets.map((ticket) => (
            <div key={ticket.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-lg border border-border p-4">
              <div>
                <p className="text-sm font-semibold">{ticket.issue}</p>
                <p className="text-xs text-muted-foreground">{ticket.requester} · {ticket.id}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={statusColor[ticket.status]}>{ticket.status}</Badge>
                <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{ticket.age}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default Tickets;
