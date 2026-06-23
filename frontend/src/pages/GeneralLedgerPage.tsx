import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Eye, Edit, Trash2, ChevronLeft } from "lucide-react";
import { useGeneralLedger } from "@/hooks/useFinance";

const GeneralLedgerPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data: glData, isLoading: glLoading } = useGeneralLedger(page, limit);

  const handleCreateNew = () => {
    console.log("Create new GL entry");
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
          <h1 className="text-2xl font-bold text-foreground">General Ledger</h1>
          <p className="text-sm text-muted-foreground">View and manage general ledger accounts</p>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {glData?.total ? `Total: ${glData.total} entries` : "Loading..."}
        </div>
        <Button onClick={handleCreateNew} className="gap-2">
          <Plus className="h-4 w-4" />
          New Entry
        </Button>
      </div>

      {/* GL Table */}
      <Card>
        <CardHeader>
          <CardTitle>General Ledger Entries</CardTitle>
        </CardHeader>
        <CardContent>
          {glLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading general ledger records...</div>
          ) : glData?.data?.length > 0 ? (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="pb-2 pr-4">Account Code</th>
                      <th className="pb-2 pr-4">Account Type</th>
                      <th className="pb-2 pr-4">Debit</th>
                      <th className="pb-2 pr-4">Credit</th>
                      <th className="pb-2 pr-4">Journal Entries</th>
                      <th className="pb-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {glData.data.map((entry) => (
                      <tr key={entry._id} className="border-b last:border-0">
                        <td className="py-3 pr-4 font-mono text-xs">{entry.data?.accountCode}</td>
                        <td className="py-3 pr-4">
                          <span className="px-2 py-1 rounded text-xs bg-purple-100 text-purple-800">
                            {entry.data?.accountType}
                          </span>
                        </td>
                        <td className="py-3 pr-4">${Number(entry.data?.debit || 0).toFixed(2)}</td>
                        <td className="py-3 pr-4">${Number(entry.data?.credit || 0).toFixed(2)}</td>
                        <td className="py-3 pr-4 text-xs">{entry.data?.journalEntries?.length || 0} entries</td>
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
                  disabled={!glData?.hasMore}
                >
                  Next
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p className="mb-4">No general ledger entries found</p>
              <Button onClick={handleCreateNew} className="gap-2">
                <Plus className="h-4 w-4" />
                Create First Entry
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GeneralLedgerPage;
