import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Eye, Edit, Trash2, ChevronLeft } from "lucide-react";
import { useAssets } from "@/hooks/useFinance";

const AssetManagementPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data: assetsData, isLoading: assetsLoading } = useAssets(page, limit);

  const handleCreateNew = () => {
    console.log("Create new asset");
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
          <h1 className="text-2xl font-bold text-foreground">Asset Management</h1>
          <p className="text-sm text-muted-foreground">Track fixed assets and depreciation</p>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {assetsData?.total ? `Total: ${assetsData.total} assets` : "Loading..."}
        </div>
        <Button onClick={handleCreateNew} className="gap-2">
          <Plus className="h-4 w-4" />
          New Asset
        </Button>
      </div>

      {/* Assets Table */}
      <Card>
        <CardHeader>
          <CardTitle>Fixed Assets</CardTitle>
        </CardHeader>
        <CardContent>
          {assetsLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading asset records...</div>
          ) : assetsData?.data?.length > 0 ? (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="pb-2 pr-4">Asset ID</th>
                      <th className="pb-2 pr-4">Purchase Price</th>
                      <th className="pb-2 pr-4">Depreciation</th>
                      <th className="pb-2 pr-4">Book Value</th>
                      <th className="pb-2 pr-4">Status</th>
                      <th className="pb-2 pr-4">Maintenance Schedule</th>
                      <th className="pb-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assetsData.data.map((asset) => (
                      <tr key={asset._id} className="border-b last:border-0">
                        <td className="py-3 pr-4 font-mono text-xs">{asset.data?.assetId}</td>
                        <td className="py-3 pr-4">${Number(asset.data?.purchasePrice || 0).toFixed(2)}</td>
                        <td className="py-3 pr-4">${Number(asset.data?.depreciation || 0).toFixed(2)}</td>
                        <td className="py-3 pr-4">${Number((asset.data?.purchasePrice || 0) - (asset.data?.depreciation || 0)).toFixed(2)}</td>
                        <td className="py-3 pr-4">
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold ${
                              asset.data?.status === "Active"
                                ? "bg-green-100 text-green-800"
                                : asset.data?.status === "Retired"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {asset.data?.status}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-xs">
                          {asset.data?.maintenanceSchedules?.length || 0} scheduled
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
                  disabled={!assetsData?.hasMore}
                >
                  Next
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p className="mb-4">No assets found</p>
              <Button onClick={handleCreateNew} className="gap-2">
                <Plus className="h-4 w-4" />
                Add First Asset
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AssetManagementPage;
