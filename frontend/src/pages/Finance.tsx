import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  DollarSign,
  CreditCard,
  TrendingUp,
  FileText,
  Plus,
  Eye,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { useFinanceSummary, useBillings, useInsuranceClaims, useAccountsReceivable, useAccountsPayable } from "@/hooks/useFinance";

const Finance = () => {
  const [activeTab, setActiveTab] = useState("billing");
  
  // Fetch finance summary
  const { data: summaryData } = useFinanceSummary();

  // Fetch billing records
  const { data: billingData, isLoading: billingLoading } = useBillings(1, 10);

  // Fetch insurance records
  const { data: insuranceData, isLoading: insuranceLoading } = useInsuranceClaims(1, 10);

  // Fetch accounts receivable
  const { data: arData, isLoading: arLoading } = useAccountsReceivable(1, 10);

  // Fetch accounts payable
  const { data: apData, isLoading: apLoading } = useAccountsPayable(1, 10);

  const summary = summaryData?.summary || {};

  const summaryCards = [
    {
      title: "Total Billings",
      value: `$${Number(summary.totalBillings || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: "text-blue-600",
    },
    {
      title: "Collections",
      value: `$${Number(summary.totalCollections || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
      icon: TrendingUp,
      color: "text-green-600",
    },
    {
      title: "Outstanding AR",
      value: `$${Number(summary.outstandingReceivables || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
      icon: AlertCircle,
      color: "text-yellow-600",
    },
    {
      title: "Accounts Payable",
      value: `$${Number(summary.accountsPayable || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
      icon: FileText,
      color: "text-red-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Finance Management</h1>
        <p className="text-muted-foreground text-sm">
          Comprehensive financial module covering billing, insurance, accounts, and budget management
        </p>
      </div>

      {/* Summary Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card) => (
          <Card key={card.title}>
            <CardContent className="p-4 flex items-center gap-3">
              <card.icon className={`h-8 w-8 ${card.color}`} />
              <div>
                <p className="text-lg font-bold">{card.value}</p>
                <p className="text-xs text-muted-foreground">{card.title}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Finance Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Finance Operations</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-8 lg:grid-cols-4">
              <TabsTrigger value="billing">Billing</TabsTrigger>
              <TabsTrigger value="insurance">Insurance</TabsTrigger>
              <TabsTrigger value="ar">Accounts Receivable</TabsTrigger>
              <TabsTrigger value="ap">Accounts Payable</TabsTrigger>
              <TabsTrigger value="cashoffice">Cash Office</TabsTrigger>
              <TabsTrigger value="ledger">General Ledger</TabsTrigger>
              <TabsTrigger value="assets">Assets</TabsTrigger>
              <TabsTrigger value="budget">Budget</TabsTrigger>
            </TabsList>

            {/* BILLING TAB */}
            <TabsContent value="billing" className="space-y-4 mt-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">Billing Management</h3>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  New Bill
                </Button>
              </div>

              {billingLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading billing records...</div>
              ) : billingData?.data?.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-muted-foreground">
                        <th className="pb-2 pr-4">Bill ID</th>
                        <th className="pb-2 pr-4">Type</th>
                        <th className="pb-2 pr-4">Amount</th>
                        <th className="pb-2 pr-4">Status</th>
                        <th className="pb-2 pr-4">Balance</th>
                        <th className="pb-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {billingData.data.map((bill) => (
                        <tr key={bill._id} className="border-b last:border-0">
                          <td className="py-3 pr-4 font-mono">{bill.data?.billId}</td>
                          <td className="py-3 pr-4">{bill.data?.billType || "N/A"}</td>
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
                            <button className="p-1 hover:bg-muted rounded">
                              <Eye className="h-4 w-4" />
                            </button>
                            <button className="p-1 hover:bg-muted rounded">
                              <Edit className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">No billing records found</div>
              )}
            </TabsContent>

            {/* INSURANCE TAB */}
            <TabsContent value="insurance" className="space-y-4 mt-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">Insurance Management</h3>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  New Claim
                </Button>
              </div>

              {insuranceLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading insurance records...</div>
              ) : insuranceData?.data?.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-muted-foreground">
                        <th className="pb-2 pr-4">Provider</th>
                        <th className="pb-2 pr-4">Claim Number</th>
                        <th className="pb-2 pr-4">Amount</th>
                        <th className="pb-2 pr-4">Status</th>
                        <th className="pb-2 pr-4">Auth Number</th>
                      </tr>
                    </thead>
                    <tbody>
                      {insuranceData.data.map((claim) => (
                        <tr key={claim._id} className="border-b last:border-0">
                          <td className="py-3 pr-4">{claim.data?.provider}</td>
                          <td className="py-3 pr-4 font-mono">{claim.data?.claimNumber}</td>
                          <td className="py-3 pr-4">${Number(claim.data?.claimAmount || 0).toFixed(2)}</td>
                          <td className="py-3 pr-4">
                            <span
                              className={`px-2 py-1 rounded text-xs font-semibold ${
                                claim.data?.claimStatus === "Approved"
                                  ? "bg-green-100 text-green-800"
                                  : claim.data?.claimStatus === "Pending"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                              }`}
                            >
                              {claim.data?.claimStatus}
                            </span>
                          </td>
                          <td className="py-3 pr-4">{claim.data?.authorizationNumber}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">No insurance records found</div>
              )}
            </TabsContent>

            {/* ACCOUNTS RECEIVABLE TAB */}
            <TabsContent value="ar" className="space-y-4 mt-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">Accounts Receivable</h3>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  New Debtor
                </Button>
              </div>

              {arLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading AR records...</div>
              ) : arData?.data?.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-muted-foreground">
                        <th className="pb-2 pr-4">Debtor ID</th>
                        <th className="pb-2 pr-4">Outstanding</th>
                        <th className="pb-2 pr-4">Age</th>
                        <th className="pb-2 pr-4">Follow-up</th>
                        <th className="pb-2 pr-4">Collection</th>
                      </tr>
                    </thead>
                    <tbody>
                      {arData.data.map((ar) => (
                        <tr key={ar._id} className="border-b last:border-0">
                          <td className="py-3 pr-4 font-mono">{ar.data?.debtorId}</td>
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
                          <td className="py-3 pr-4">{ar.data?.followUpStatus}</td>
                          <td className="py-3 pr-4">
                            <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                              {ar.data?.collectionStatus}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">No AR records found</div>
              )}
            </TabsContent>

            {/* ACCOUNTS PAYABLE TAB */}
            <TabsContent value="ap" className="space-y-4 mt-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">Accounts Payable</h3>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  New Invoice
                </Button>
              </div>

              {apLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading AP records...</div>
              ) : apData?.data?.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-muted-foreground">
                        <th className="pb-2 pr-4">Invoice</th>
                        <th className="pb-2 pr-4">Supplier</th>
                        <th className="pb-2 pr-4">Amount</th>
                        <th className="pb-2 pr-4">Status</th>
                        <th className="pb-2 pr-4">Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {apData.data.map((ap) => (
                        <tr key={ap._id} className="border-b last:border-0">
                          <td className="py-3 pr-4 font-mono">{ap.data?.invoiceNumber}</td>
                          <td className="py-3 pr-4">{ap.data?.supplier}</td>
                          <td className="py-3 pr-4">${Number(ap.data?.amount || 0).toFixed(2)}</td>
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
                          <td className="py-3 pr-4">${Number(ap.data?.balance || 0).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">No AP records found</div>
              )}
            </TabsContent>

            {/* CASH OFFICE TAB */}
            <TabsContent value="cashoffice" className="space-y-4 mt-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">Cash Office Operations</h3>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  New Receipt
                </Button>
              </div>
              <div className="text-center py-8 text-muted-foreground">Cash office records will appear here</div>
            </TabsContent>

            {/* GENERAL LEDGER TAB */}
            <TabsContent value="ledger" className="space-y-4 mt-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">General Ledger</h3>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  New Entry
                </Button>
              </div>
              <div className="text-center py-8 text-muted-foreground">General ledger records will appear here</div>
            </TabsContent>

            {/* ASSETS TAB */}
            <TabsContent value="assets" className="space-y-4 mt-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">Asset Management</h3>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  New Asset
                </Button>
              </div>
              <div className="text-center py-8 text-muted-foreground">Asset records will appear here</div>
            </TabsContent>

            {/* BUDGET TAB */}
            <TabsContent value="budget" className="space-y-4 mt-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">Budget Management</h3>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  New Budget
                </Button>
              </div>
              <div className="text-center py-8 text-muted-foreground">Budget records will appear here</div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Finance;
