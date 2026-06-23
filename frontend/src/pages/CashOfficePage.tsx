import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Eye, Edit, Trash2, ChevronLeft } from "lucide-react";
import { useCashOffice } from "@/hooks/useFinance";

const CashOfficePage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data: cashOfficeData, isLoading: cashOfficeLoading } = useCashOffice(page, limit);

  const handleCreateNew = () => {
    console.log("Create new cash office record");
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
          <h1 className="text-2xl font-bold text-foreground">Cash Office Operations</h1>
          <p className="text-sm text-muted-foreground">Handle cash receipts and refunds</p>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {cashOfficeData?.total ? `Total: ${cashOfficeData.total} transactions` : "Loading..."}
        </div>
        <Button onClick={handleCreateNew} className="gap-2">
          <Plus className="h-4 w-4" />
          New Receipt
        </Button>
      </div>

      {/* Cash Office Table */}
      <Card>
        <CardHeader>
          <CardTitle>Cash Office Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {cashOfficeLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading cash office records...</div>
          ) : cashOfficeData?.data?.length > 0 ? (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="pb-2 pr-4">Receipt #</th>
                      <th className="pb-2 pr-4">Type</th>
                      <th className="pb-2 pr-4">Amount</th>
                      <th className="pb-2 pr-4">Payment Method</th>
                      <th className="pb-2 pr-4">Cashier</th>
                      <th className="pb-2 pr-4">Related Bill</th>
                      <th className="pb-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cashOfficeData.data.map((record) => (
                      <tr key={record._id} className="border-b last:border-0">
                        <td className="py-3 pr-4 font-mono text-xs">{record.data?.receiptId}</td>
                        <td className="py-3 pr-4">
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              record.data?.type === "Receipt"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {record.data?.type}
                          </span>
                        </td>
                        <td className="py-3 pr-4">${Number(record.data?.amount || 0).toFixed(2)}</td>
                        <td className="py-3 pr-4 text-xs">{record.data?.paymentMethod}</td>
                        <td className="py-3 pr-4 text-xs">{record.data?.cashier}</td>
                        <td className="py-3 pr-4 text-xs">{record.data?.relatedBill || "N/A"}</td>
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
                  disabled={!cashOfficeData?.hasMore}
                >
                  Next
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p className="mb-4">No cash office transactions found</p>
              <Button onClick={handleCreateNew} className="gap-2">
                <Plus className="h-4 w-4" />
                Create First Receipt
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CashOfficePage;
