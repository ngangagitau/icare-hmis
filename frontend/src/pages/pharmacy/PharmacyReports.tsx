import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import apiClient from "@/lib/api";

interface ReportData {
  month: string;
  dispensed: number;
  otc: number;
  returned: number;
}

export default function PharmacyReports() {
  const [data, setData] = useState<ReportData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get<ReportData[]>("/pharmacy/reports/monthly");
      setData(Array.isArray(response) ? response : []);
    } catch (err) {
      console.error("Failed to fetch pharmacy reports:", err);
      setError("Failed to load pharmacy reports");
      // Set default empty data
      setData([
        { month: "Jan", dispensed: 0, otc: 0, returned: 0 },
        { month: "Feb", dispensed: 0, otc: 0, returned: 0 },
        { month: "Mar", dispensed: 0, otc: 0, returned: 0 },
        { month: "Apr", dispensed: 0, otc: 0, returned: 0 },
      ]);
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Pharmacy Reports</h1>
        <p className="text-muted-foreground text-sm">Dispensing, sales, and stock reports</p>
      </div>

      {loading && (
        <Card>
          <CardContent className="py-12">
            <p className="text-center text-muted-foreground">Loading pharmacy reports...</p>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="py-4">
            <p className="text-center text-destructive text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      {!loading && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Monthly Dispensing</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="dispensed" fill="hsl(152,55%,45%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="otc" fill="hsl(38,92%,50%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
