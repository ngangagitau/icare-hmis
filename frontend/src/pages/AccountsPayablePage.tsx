import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Eye, Edit, Trash2, ChevronLeft } from "lucide-react";
import { useAccountsPayable } from "@/hooks/useFinance";

const AccountsPayablePage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data: apData, isLoading: apLoading } = useAccountsPayable(page, limit);

  const handleCreateNew = () => {
    console.log("Create new AP record");
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
          <h1 className="text-2xl font-bold text-foreground">Accounts Payable</h1>
          <p className="text-sm text-muted-foreground">Manage supplier invoices and payments</p>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {apData?.total ? `Total: ${apData.total} invoices` : "Loading..."}
        </div>
        <Button onClick={handleCreateNew} className="gap-2">
          <Plus className="h-4 w-4" />
          New Invoice
        </Button>
      </div>

      {/* AP Table */}
      <Card>
        <CardHeader>
          <CardTitle>Accounts Payable Records</CardTitle>
        </CardHeader>
        <CardContent>
          {apLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading AP records...</div>
          ) : apData?.data?.length > 0 ? (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="pb-2 pr-4">Invoice #</th>
                      <th className="pb-2 pr-4">Supplier</th>
                      <th className="pb-2 pr-4">Amount</th>
                      <th className="pb-2 pr-4">Paid</th>
                      <th className="pb-2 pr-4">Status</th>
                      <th className="pb-2 pr-4">Reconciliation</th>
                      <th className="pb-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {apData.data.map((ap) => (
                      <tr key={ap._id} className="border-b last:border-0">
                        <td className="py-3 pr-4 font-mono text-xs">{ap.data?.invoiceNumber}</td>
                        <td className="py-3 pr-4">{ap.data?.supplier}</td>
                        <td className="py-3 pr-4">${Number(ap.data?.amount || 0).toFixed(2)}</td>
                        <td className="py-3 pr-4">${Number(ap.data?.amountPaid || 0).toFixed(2)}</td>
                        <td className="py-3 pr-4">
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold ${
                              ap.data?.paymentStatus === "Paid"
                                ? "bg-green-100 text-green-800"
                                : ap.data?.paymentStatus === "Partial"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            {ap.data?.paymentStatus}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-xs">{ap.data?.reconciliationStatus}</td>
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
                  disabled={!apData?.hasMore}
                >
                  Next
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p className="mb-4">No accounts payable records found</p>
              <Button onClick={handleCreateNew} className="gap-2">
                <Plus className="h-4 w-4" />
                Add First Invoice
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountsPayablePage;
