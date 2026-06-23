import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Eye, Edit, Trash2, ChevronLeft } from "lucide-react";
import { useBudgets } from "@/hooks/useFinance";

const BudgetManagementPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data: budgetsData, isLoading: budgetsLoading } = useBudgets(page, limit);

  const handleCreateNew = () => {
    console.log("Create new budget");
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
          <h1 className="text-2xl font-bold text-foreground">Budget Management</h1>
          <p className="text-sm text-muted-foreground">Create and monitor departmental budgets</p>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {budgetsData?.total ? `Total: ${budgetsData.total} budgets` : "Loading..."}
        </div>
        <Button onClick={handleCreateNew} className="gap-2">
          <Plus className="h-4 w-4" />
          New Budget
        </Button>
      </div>

      {/* Budgets Table */}
      <Card>
        <CardHeader>
          <CardTitle>Department Budgets</CardTitle>
        </CardHeader>
        <CardContent>
          {budgetsLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading budget records...</div>
          ) : budgetsData?.data?.length > 0 ? (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="pb-2 pr-4">Budget Year</th>
                      <th className="pb-2 pr-4">Department</th>
                      <th className="pb-2 pr-4">Allocated</th>
                      <th className="pb-2 pr-4">Utilized</th>
                      <th className="pb-2 pr-4">Balance</th>
                      <th className="pb-2 pr-4">Utilization %</th>
                      <th className="pb-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {budgetsData.data.map((budget) => {
                      const allocated = Number(budget.data?.allocatedAmount || 0);
                      const utilized = Number(budget.data?.utilizedAmount || 0);
                      const percentage = allocated > 0 ? ((utilized / allocated) * 100).toFixed(1) : 0;

                      return (
                        <tr key={budget._id} className="border-b last:border-0">
                          <td className="py-3 pr-4 font-mono text-xs">{budget.data?.budgetYear}</td>
                          <td className="py-3 pr-4">{budget.data?.department}</td>
                          <td className="py-3 pr-4">${allocated.toFixed(2)}</td>
                          <td className="py-3 pr-4">${utilized.toFixed(2)}</td>
                          <td className="py-3 pr-4">${(allocated - utilized).toFixed(2)}</td>
                          <td className="py-3 pr-4">
                            <div className="flex items-center gap-2">
                              <div className="w-12 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className={`h-full transition-all ${
                                    Number(percentage) <= 50
                                      ? "bg-green-500"
                                      : Number(percentage) <= 80
                                        ? "bg-yellow-500"
                                        : "bg-red-500"
                                  }`}
                                  style={{ width: `${Math.min(Number(percentage), 100)}%` }}
                                />
                              </div>
                              <span className="text-xs font-semibold">{percentage}%</span>
                            </div>
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
                      );
                    })}
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
                  disabled={!budgetsData?.hasMore}
                >
                  Next
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p className="mb-4">No budgets found</p>
              <Button onClick={handleCreateNew} className="gap-2">
                <Plus className="h-4 w-4" />
                Create First Budget
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BudgetManagementPage;
