import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Eye, Edit, Trash2, ChevronLeft } from "lucide-react";
import { useBillings } from "@/hooks/useFinance";

const BillingPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data: billingData, isLoading: billingLoading } = useBillings(page, limit);

  const handleCreateNew = () => {
    // TODO: Open create billing modal or navigate to create page
    console.log("Create new bill");
  };

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/finance")}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Finance
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Billing Management</h1>
          <p className="text-sm text-muted-foreground">Manage patient billing and invoices</p>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {billingData?.total ? `Total: ${billingData.total} records` : "Loading..."}
        </div>
        <Button onClick={handleCreateNew} className="gap-2">
          <Plus className="h-4 w-4" />
          New Bill
        </Button>
      </div>

      {/* Billing Table */}
      <Card>
        <CardHeader>
          <CardTitle>Billing Records</CardTitle>
        </CardHeader>
        <CardContent>
          {billingLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading billing records...</div>
          ) : billingData?.data?.length > 0 ? (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="pb-2 pr-4">Bill ID</th>
                      <th className="pb-2 pr-4">Type</th>
                      <th className="pb-2 pr-4">Patient</th>
                      <th className="pb-2 pr-4">Amount</th>
                      <th className="pb-2 pr-4">Status</th>
                      <th className="pb-2 pr-4">Balance</th>
                      <th className="pb-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {billingData.data.map((bill) => (
                      <tr key={bill._id} className="border-b last:border-0">
                        <td className="py-3 pr-4 font-mono text-xs">{bill.data?.billId}</td>
                        <td className="py-3 pr-4 text-xs">{bill.data?.billType || "N/A"}</td>
                        <td className="py-3 pr-4 text-xs">{bill.data?.patientRef || "N/A"}</td>
                        <td className="py-3 pr-4">${Number(bill.data?.total || 0).toFixed(2)}</td>
                        <td className="py-3 pr-4">
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold ${
                              bill.data?.paymentStatus === "Paid"
                                ? "bg-green-100 text-green-800"
                                : bill.data?.paymentStatus === "Partial"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            {bill.data?.paymentStatus}
                          </span>
                        </td>
                        <td className="py-3 pr-4">${Number(bill.data?.balance || 0).toFixed(2)}</td>
                        <td className="py-3 flex gap-1">
                          <button className="p-1 hover:bg-muted rounded transition">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="p-1 hover:bg-muted rounded transition">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button className="p-1 hover:bg-red-100 rounded transition">
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex justify-center gap-2 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="flex items-center text-sm">Page {page}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={!billingData?.hasMore}
                >
                  Next
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p className="mb-4">No billing records found</p>
              <Button onClick={handleCreateNew} className="gap-2">
                <Plus className="h-4 w-4" />
                Create First Bill
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BillingPage;
