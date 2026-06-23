import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Eye, Edit, Trash2, ChevronLeft } from "lucide-react";
import { useAccountsReceivable } from "@/hooks/useFinance";

const AccountsReceivablePage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data: arData, isLoading: arLoading } = useAccountsReceivable(page, limit);

  const handleCreateNew = () => {
    console.log("Create new AR record");
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
          <h1 className="text-2xl font-bold text-foreground">Accounts Receivable</h1>
          <p className="text-sm text-muted-foreground">Track outstanding receivables and collections</p>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {arData?.total ? `Total: ${arData.total} records` : "Loading..."}
        </div>
        <Button onClick={handleCreateNew} className="gap-2">
          <Plus className="h-4 w-4" />
          New Debtor
        </Button>
      </div>

      {/* AR Table */}
      <Card>
        <CardHeader>
          <CardTitle>Accounts Receivable Records</CardTitle>
        </CardHeader>
        <CardContent>
          {arLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading AR records...</div>
          ) : arData?.data?.length > 0 ? (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="pb-2 pr-4">Debtor ID</th>
                      <th className="pb-2 pr-4">Outstanding</th>
                      <th className="pb-2 pr-4">Age Category</th>
                      <th className="pb-2 pr-4">Follow-up Status</th>
                      <th className="pb-2 pr-4">Collection Status</th>
                      <th className="pb-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {arData.data.map((ar) => (
                      <tr key={ar._id} className="border-b last:border-0">
                        <td className="py-3 pr-4 font-mono text-xs">{ar.data?.debtorId}</td>
                        <td className="py-3 pr-4">${Number(ar.data?.outstandingBalance || 0).toFixed(2)}</td>
                        <td className="py-3 pr-4">
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              ar.data?.ageCategory === "Current"
                                ? "bg-green-100 text-green-800"
                                : ar.data?.ageCategory === "30-60 days"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            {ar.data?.ageCategory}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-xs">{ar.data?.followUpStatus}</td>
                        <td className="py-3 pr-4">
                          <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                            {ar.data?.collectionStatus}
                          </span>
                        </td>
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
                  disabled={!arData?.hasMore}
                >
                  Next
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p className="mb-4">No accounts receivable records found</p>
              <Button onClick={handleCreateNew} className="gap-2">
                <Plus className="h-4 w-4" />
                Add First Debtor
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountsReceivablePage;
