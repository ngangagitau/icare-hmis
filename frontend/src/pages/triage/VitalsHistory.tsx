import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const history = [
  { date: "2024-01-15", bp: "120/80", hr: 72, temp: 36.5, spo2: 98, rr: 16 },
  { date: "2024-02-10", bp: "125/82", hr: 75, temp: 36.7, spo2: 97, rr: 18 },
  { date: "2024-03-08", bp: "118/78", hr: 70, temp: 36.4, spo2: 99, rr: 16 },
  { date: "2024-04-12", bp: "130/85", hr: 78, temp: 37.0, spo2: 96, rr: 20 },
  { date: "2024-05-20", bp: "122/80", hr: 73, temp: 36.6, spo2: 98, rr: 17 },
];

const chartData = history.map(h => ({ date: h.date, hr: h.hr, temp: h.temp, spo2: h.spo2 }));

export default function VitalsHistory() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-heading font-bold text-foreground">Vitals History</h1><p className="text-muted-foreground text-sm">Historical vital signs for trend analysis</p></div>
      <Card>
        <CardHeader><CardTitle className="text-base">Select Patient</CardTitle></CardHeader>
        <CardContent>
          <Select><SelectTrigger><SelectValue placeholder="Select patient" /></SelectTrigger>
            <SelectContent><SelectItem value="P-10001">John Mwangi</SelectItem><SelectItem value="P-10002">Mary Achieng</SelectItem></SelectContent></Select>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-base">Heart Rate Trend</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis /><Tooltip /><Line type="monotone" dataKey="hr" stroke="hsl(0,65%,55%)" strokeWidth={2} /></LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-base">Vitals Records</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>BP (mmHg)</TableHead><TableHead>HR (bpm)</TableHead><TableHead>Temp (°C)</TableHead><TableHead>SpO2 (%)</TableHead><TableHead>RR (/min)</TableHead></TableRow></TableHeader>
            <TableBody>
              {history.map((h, i) => (
                <TableRow key={i}><TableCell>{h.date}</TableCell><TableCell>{h.bp}</TableCell><TableCell>{h.hr}</TableCell><TableCell>{h.temp}</TableCell><TableCell>{h.spo2}</TableCell><TableCell>{h.rr}</TableCell></TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
