import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Eye, Edit, Trash2, ChevronLeft } from "lucide-react";
import { useInsuranceClaims } from "@/hooks/useFinance";

const InsuranceClaimsPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data: insuranceData, isLoading: insuranceLoading } = useInsuranceClaims(page, limit);

  const handleCreateNew = () => {
    console.log("Create new insurance claim");
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
          <h1 className="text-2xl font-bold text-foreground">Insurance Claims Management</h1>
          <p className="text-sm text-muted-foreground">Process and track insurance claims</p>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {insuranceData?.total ? `Total: ${insuranceData.total} claims` : "Loading..."}
        </div>
        <Button onClick={handleCreateNew} className="gap-2">
          <Plus className="h-4 w-4" />
          New Claim
        </Button>
      </div>

      {/* Insurance Claims Table */}
      <Card>
        <CardHeader>
          <CardTitle>Insurance Claims</CardTitle>
        </CardHeader>
        <CardContent>
          {insuranceLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading insurance records...</div>
          ) : insuranceData?.data?.length > 0 ? (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="pb-2 pr-4">Provider</th>
                      <th className="pb-2 pr-4">Claim Number</th>
                      <th className="pb-2 pr-4">Amount</th>
                      <th className="pb-2 pr-4">Status</th>
                      <th className="pb-2 pr-4">Auth Number</th>
                      <th className="pb-2 pr-4">Reconciliation</th>
                      <th className="pb-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {insuranceData.data.map((claim) => (
                      <tr key={claim._id} className="border-b last:border-0">
                        <td className="py-3 pr-4">{claim.data?.provider}</td>
                        <td className="py-3 pr-4 font-mono text-xs">{claim.data?.claimNumber}</td>
                        <td className="py-3 pr-4">${Number(claim.data?.claimAmount || 0).toFixed(2)}</td>
                        <td className="py-3 pr-4">
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold ${
                              claim.data?.claimStatus === "Approved"
                                ? "bg-green-100 text-green-800"
                                : claim.data?.claimStatus === "Submitted"
                                  ? "bg-blue-100 text-blue-800"
                                  : claim.data?.claimStatus === "Rejected"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {claim.data?.claimStatus}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-xs">{claim.data?.authorizationNumber}</td>
                        <td className="py-3 pr-4 text-xs">{claim.data?.reconciliationStatus}</td>
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
                  disabled={!insuranceData?.hasMore}
                >
                  Next
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p className="mb-4">No insurance claims found</p>
              <Button onClick={handleCreateNew} className="gap-2">
                <Plus className="h-4 w-4" />
                Create First Claim
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InsuranceClaimsPage;
