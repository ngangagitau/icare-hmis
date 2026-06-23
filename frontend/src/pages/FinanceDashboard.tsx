import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DollarSign,
  CreditCard,
  TrendingUp,
  FileText,
  AlertCircle,
  Banknote,
  BookOpen,
  Building2,
  BarChart3,
} from "lucide-react";
import { useFinanceSummary } from "@/hooks/useFinance";

const FinanceDashboard = () => {
  const navigate = useNavigate();
  const { data: summaryData } = useFinanceSummary();

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

  const submodules = [
    {
      key: "billing",
      title: "Billing",
      description: "Manage patient billing and invoices",
      icon: CreditCard,
      color: "bg-blue-50 border-blue-200",
      path: "/finance/billing",
    },
    {
      key: "insurance",
      title: "Insurance Claims",
      description: "Process insurance claims and authorizations",
      icon: FileText,
      color: "bg-purple-50 border-purple-200",
      path: "/finance/insurance",
    },
    {
      key: "ar",
      title: "Accounts Receivable",
      description: "Track outstanding receivables and collections",
      icon: TrendingUp,
      color: "bg-green-50 border-green-200",
      path: "/finance/accounts-receivable",
    },
    {
      key: "ap",
      title: "Accounts Payable",
      description: "Manage supplier invoices and payments",
      icon: Banknote,
      color: "bg-orange-50 border-orange-200",
      path: "/finance/accounts-payable",
    },
    {
      key: "cashoffice",
      title: "Cash Office",
      description: "Handle cash receipts and refunds",
      icon: Banknote,
      color: "bg-yellow-50 border-yellow-200",
      path: "/finance/cash-office",
    },
    {
      key: "ledger",
      title: "General Ledger",
      description: "View general ledger accounts and entries",
      icon: BookOpen,
      color: "bg-indigo-50 border-indigo-200",
      path: "/finance/general-ledger",
    },
    {
      key: "assets",
      title: "Asset Management",
      description: "Track fixed assets and depreciation",
      icon: Building2,
      color: "bg-cyan-50 border-cyan-200",
      path: "/finance/assets",
    },
    {
      key: "budget",
      title: "Budget Management",
      description: "Create and monitor budgets",
      icon: BarChart3,
      color: "bg-pink-50 border-pink-200",
      path: "/finance/budget",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Finance Management</h1>
        <p className="text-muted-foreground">
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

      {/* Submodules Grid */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Finance Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {submodules.map((module) => (
            <Card
              key={module.key}
              className={`${module.color} hover:shadow-lg transition-shadow cursor-pointer border-2`}
              onClick={() => navigate(module.path)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <module.icon className="h-5 w-5" />
                  <CardTitle className="text-base">{module.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">{module.description}</p>
                <Button size="sm" className="w-full" onClick={() => navigate(module.path)}>
                  Access Module
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FinanceDashboard;
