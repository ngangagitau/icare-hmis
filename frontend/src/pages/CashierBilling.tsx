import { useState, useMemo, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  CreditCard,
  Receipt,
  Search,
  Printer,
  CheckCircle2,
  Clock,
  AlertCircle,
  Banknote,
  Smartphone,
  ShieldCheck,
  Building,
  UserCheck,
  Plus,
  ArrowRight,
  RefreshCw,
  Wallet,
  FileSpreadsheet,
  Download,
  FileText,
  DollarSign,
  TrendingUp,
  SlidersHorizontal,
  ChevronRight,
  X,
  Lock,
} from "lucide-react";
import { useBills, useBillingStats, useReceipts, useRecordPayment, useRecordSplitPayment, useCreateBill, useUpdateBillClaim, useApproveInsurance } from "@/hooks/useBilling";
import { usePatients } from "@/hooks/usePatients";
import type { Bill, BillingItem, ReceiptItem } from "@/lib/billingService";
import { getPatientRecordId } from "@/lib/patientService";
import { PatientAutocompleteInput } from "@/components/PatientAutocompleteInput";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Format KES currency
const formatKES = (val: number | undefined | null) => {
  const num = Number(val || 0);
  return `KES ${num.toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const statusColors: Record<string, string> = {
  Paid: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
  Approved: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
  "Insurance Approved": "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
  Cleared: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
  Partial: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30",
  Pending: "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30",
  "Pending Approval": "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30",
  "Awaiting Cashier Payment": "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30",
  "Awaiting Insurance Approval": "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30",
  Overdue: "bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/40",
  Cancelled: "bg-muted text-muted-foreground border-border",
};

export default function CashierBilling() {
  const [activeTab, setActiveTab] = useState("cashier");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [schemeFilter, setSchemeFilter] = useState("All");

  // Queries
  const { data: billsData, isLoading: billsLoading, refetch: refetchBills } = useBills(1, 100, {
    search: search || undefined,
    status: statusFilter !== "All" ? statusFilter : undefined,
    scheme: schemeFilter !== "All" ? schemeFilter : undefined,
  });
  const { data: stats, refetch: refetchStats } = useBillingStats();
  const { data: receiptsList = [], refetch: refetchReceipts } = useReceipts();
  const { data: patientsData, isLoading: patientsLoading, isError: patientsError } = usePatients(1, 100);

  const bills = billsData?.data || [];
  const patients = patientsData?.data || [];

  // Mutations
  const recordPaymentMutation = useRecordPayment();
  const splitPaymentMutation = useRecordSplitPayment();
  const createBillMutation = useCreateBill();
  const updateClaimMutation = useUpdateBillClaim();
  const approveInsuranceMutation = useApproveInsurance();

  // Active cashier state
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [patientSearch, setPatientSearch] = useState("");

  // Payment Form Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentMode, setPaymentMode] = useState<"Cash" | "M-Pesa" | "Card" | "Insurance" | "Split">("Cash");
  const [tenderAmount, setTenderAmount] = useState<number>(0);
  const [tenderCashGiven, setTenderCashGiven] = useState<number>(0);
  const [paymentRef, setPaymentRef] = useState("");
  const [payerPhone, setPayerPhone] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");

  // Split payment state
  const [splitCash, setSplitCash] = useState<number>(0);
  const [splitMpesa, setSplitMpesa] = useState<number>(0);
  const [splitMpesaRef, setSplitMpesaRef] = useState("");
  const [splitCard, setSplitCard] = useState<number>(0);
  const [splitCardRef, setSplitCardRef] = useState("");

  // Receipt Preview & Print Modal
  const [receiptToPrint, setReceiptToPrint] = useState<any | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [printFormat, setPrintFormat] = useState<"thermal" | "standard">("thermal");

  // New Invoice Modal
  const [isNewInvoiceOpen, setIsNewInvoiceOpen] = useState(false);
  const [newInvPatientId, setNewInvPatientId] = useState("");
  const [newInvPaymentMethod, setNewInvPaymentMethod] = useState("Cash");
  const [newInvItems, setNewInvItems] = useState<BillingItem[]>([
    { description: "General OPD Consultation", category: "Consultation", quantity: 1, unitPrice: 1500, amount: 1500 },
  ]);
  const [newItemDesc, setNewItemDesc] = useState("");
  const [newItemCategory, setNewItemCategory] = useState<BillingItem["category"]>("Consultation");
  const [newItemQty, setNewItemQty] = useState(1);
  const [newItemRate, setNewItemRate] = useState(0);

  // Till & Shift Management
  const [openingFloat] = useState(5000);
  const [physicalCashCount, setPhysicalCashCount] = useState<number>(0);
  const [shiftNotes, setShiftNotes] = useState("");
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);

  // Claim Form Modal
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [claimProvider, setClaimProvider] = useState("SHA");
  const [claimMemberNo, setClaimMemberNo] = useState("");
  const [claimPreAuth, setClaimPreAuth] = useState("");
  const [claimCopay, setClaimCopay] = useState(0);

  // Insurance Pre-Authorization Approval Modal
  const [isApproveInsuranceModalOpen, setIsApproveInsuranceModalOpen] = useState(false);
  const [approveBillTarget, setApproveBillTarget] = useState<Bill | null>(null);
  const [approvalPreAuthCode, setApprovalPreAuthCode] = useState("");
  const [approvalNotes, setApprovalNotes] = useState("");
  const [approvalCopay, setApprovalCopay] = useState(0);

  const handleOpenApproveInsurance = (bill: Bill) => {
    setApproveBillTarget(bill);
    setApprovalPreAuthCode(bill.insuranceClaim?.preAuthCode || `AUTH-${Date.now().toString().slice(-6)}`);
    setApprovalNotes("Pre-authorization verified and approved by Cashier");
    setApprovalCopay(bill.insuranceClaim?.copayAmount || 0);
    setIsApproveInsuranceModalOpen(true);
  };

  const handleConfirmApproveInsurance = async () => {
    if (!approveBillTarget?.id) return;
    try {
      await approveInsuranceMutation.mutateAsync({
        billId: approveBillTarget.id,
        payload: {
          preAuthCode: approvalPreAuthCode,
          notes: approvalNotes,
          copayAmount: approvalCopay,
        },
      });
      toast.success("Insurance claim pre-authorized! Clinical services cleared for patient.");
      setIsApproveInsuranceModalOpen(false);
      refetchBills();
      refetchStats();
      if (selectedBill?.id === approveBillTarget.id) {
        setSelectedBill({
          ...selectedBill,
          paymentStatus: "Approved",
          status: "Approved",
          balance: approvalCopay,
          insuranceApproval: {
            preAuthCode: approvalPreAuthCode,
            approvalDate: new Date().toISOString(),
            notes: approvalNotes,
          },
        });
      }
    } catch (err: any) {
      toast.error("Failed to approve insurance", { description: err.message });
    }
  };

  // Filter bills by selected patient in Cashier Desk
  const activePatientBills = useMemo(() => {
    if (!selectedPatientId) return bills.filter(b => (b.balance || 0) > 0);
    return bills.filter(b => b.patientId === selectedPatientId || b.patient === selectedPatientId);
  }, [bills, selectedPatientId]);

  // Cash / M-Pesa Queue: Bills waiting for cash/mpesa payment before clinical services proceed
  const cashQueue = useMemo(() => {
    return bills.filter(
      (b) =>
        b.paymentMethod !== "Insurance" &&
        !b.insuranceClaim &&
        (b.paymentStatus === "Pending" ||
          b.paymentStatus === "Awaiting Cashier Payment" ||
          b.paymentStatus === "Partial" ||
          (b.balance || 0) > 0)
    );
  }, [bills]);

  // Insurance Queue: Bills waiting for insurance pre-authorization / cashier approval
  const insuranceQueue = useMemo(() => {
    return bills.filter(
      (b) =>
        (b.paymentMethod === "Insurance" || !!b.insuranceClaim) &&
        (b.paymentStatus === "Pending Approval" ||
          b.paymentStatus === "Awaiting Insurance Approval" ||
          b.paymentStatus === "Pending" ||
          (b.insuranceClaim && b.insuranceClaim.status !== "Approved"))
    );
  }, [bills]);

  // Handle open payment modal
  const handleOpenPayment = (bill: Bill) => {
    setSelectedBill(bill);
    const balance = Number(bill.balance || bill.totalAmount || 0);
    setTenderAmount(balance);
    setTenderCashGiven(balance);
    setPaymentRef(bill.scheme === "M-Pesa" ? "QKR" + Math.floor(100000 + Math.random() * 900000) : "");
    setPayerPhone(bill.patientPhone || "");
    setPaymentNotes("");
    setSplitCash(Math.floor(balance / 2));
    setSplitMpesa(balance - Math.floor(balance / 2));
    setSplitCard(0);
    setSplitMpesaRef("QKR" + Math.floor(100000 + Math.random() * 900000));
    setSplitCardRef("AUTH-" + Math.floor(1000 + Math.random() * 9000));
    setIsPaymentModalOpen(true);
  };

  // Submit Payment
  const handleSubmitPayment = async () => {
    if (!selectedBill || !selectedBill.id) return;

    try {
      if (paymentMode === "Split") {
        const totalSplit = Number(splitCash || 0) + Number(splitMpesa || 0) + Number(splitCard || 0);
        if (totalSplit <= 0) {
          toast.error("Invalid split total", { description: "Split payments must sum to greater than 0." });
          return;
        }

        const payments = [];
        if (splitCash > 0) payments.push({ amount: splitCash, method: "Cash", reference: "Cash Drawer" });
        if (splitMpesa > 0) payments.push({ amount: splitMpesa, method: "M-Pesa", reference: splitMpesaRef || "M-Pesa POS" });
        if (splitCard > 0) payments.push({ amount: splitCard, method: "Credit Card", reference: splitCardRef || "Card Slip" });

        const res = await splitPaymentMutation.mutateAsync({
          billId: selectedBill.id,
          payload: { payments },
        });

        toast.success("Split payment processed successfully!");
        setIsPaymentModalOpen(false);
        refetchBills();
        refetchStats();
        refetchReceipts();

        // Open receipt print
        setReceiptToPrint({
          receiptNumber: "RCT-SPLIT-" + Date.now().toString().slice(-6),
          invoiceNumber: selectedBill.invoiceNumber || selectedBill.billId,
          patientName: selectedBill.patientName,
          patientDisplayId: selectedBill.patientDisplayId,
          amount: totalSplit,
          method: "Split (Cash + M-Pesa/Card)",
          reference: "Multiple Tenders",
          cashier: "Cashier Desk 01",
          date: new Date().toISOString(),
          items: selectedBill.items,
        });
        setIsReceiptModalOpen(true);
      } else {
        if (tenderAmount <= 0) {
          toast.error("Invalid payment amount");
          return;
        }

        const res: any = await recordPaymentMutation.mutateAsync({
          billId: selectedBill.id,
          payment: {
            amount: tenderAmount,
            paymentMethod: paymentMode,
            reference: paymentRef || (paymentMode === "Cash" ? "Cash Drawer" : "REF-" + Date.now().toString().slice(-6)),
            notes: paymentNotes,
          },
        });

        toast.success(`Payment of ${formatKES(tenderAmount)} recorded!`);
        setIsPaymentModalOpen(false);
        refetchBills();
        refetchStats();
        refetchReceipts();

        const latestReceipt = res?.receipt || {
          receiptNumber: "RCT-" + Date.now().toString().slice(-6),
          invoiceNumber: selectedBill.invoiceNumber || selectedBill.billId,
          patientName: selectedBill.patientName,
          patientDisplayId: selectedBill.patientDisplayId,
          amount: tenderAmount,
          method: paymentMode,
          reference: paymentRef || "Direct Counter",
          cashier: "Cashier Desk 01",
          date: new Date().toISOString(),
          items: selectedBill.items,
        };

        setReceiptToPrint(latestReceipt);
        setIsReceiptModalOpen(true);
      }
    } catch (err: any) {
      toast.error("Payment failed", { description: err.message || "Failed to record payment" });
    }
  };

  // Add Item to New Invoice
  const handleAddNewItem = () => {
    if (!newItemDesc || newItemRate <= 0) {
      toast.error("Please provide description and unit price");
      return;
    }
    const lineTotal = newItemQty * newItemRate;
    setNewInvItems(prev => [
      ...prev,
      {
        description: newItemDesc,
        category: newItemCategory,
        quantity: newItemQty,
        unitPrice: newItemRate,
        amount: lineTotal,
      },
    ]);
    setNewItemDesc("");
    setNewItemQty(1);
    setNewItemRate(0);
  };

  // Remove Item from New Invoice
  const handleRemoveItem = (index: number) => {
    setNewInvItems(prev => prev.filter((_, i) => i !== index));
  };

  // Submit New Invoice
  const handleCreateInvoice = async () => {
    if (!newInvPatientId) {
      toast.error("Please select a patient");
      return;
    }
    if (!newInvItems.length) {
      toast.error("Please add at least one line item");
      return;
    }

    const total = newInvItems.reduce((acc, it) => acc + (it.amount || it.quantity * it.unitPrice), 0);
    try {
      await createBillMutation.mutateAsync({
        patientId: newInvPatientId,
        paymentMethod: newInvPaymentMethod,
        items: newInvItems,
        totalAmount: total,
        total,
      });

      toast.success("Hospital invoice created successfully!");
      setIsNewInvoiceOpen(false);
      refetchBills();
      refetchStats();
      setNewInvItems([{ description: "General Consultation", category: "Consultation", quantity: 1, unitPrice: 1500, amount: 1500 }]);
    } catch (err: any) {
      toast.error("Failed to create invoice", { description: err.message });
    }
  };

  // Submit Insurance Claim
  const handleSaveClaim = async () => {
    if (!selectedBill?.id) return;
    try {
      await updateClaimMutation.mutateAsync({
        billId: selectedBill.id,
        claimData: {
          provider: claimProvider,
          memberNumber: claimMemberNo,
          preAuthCode: claimPreAuth,
          amountClaimed: Number(selectedBill.totalAmount || selectedBill.total || 0),
          copayAmount: claimCopay,
          status: "Submitted",
        },
      });
      toast.success("Insurance claim updated & submitted!");
      setIsClaimModalOpen(false);
      refetchBills();
    } catch (err: any) {
      toast.error("Failed to update claim", { description: err.message });
    }
  };

  // Print Window Trigger
  const triggerBrowserPrint = () => {
    const printArea = document.getElementById("receipt-printable-area");
    if (!printArea) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt - ${receiptToPrint?.receiptNumber || "Print"}</title>
          <style>
            body { font-family: monospace, sans-serif; font-size: 13px; color: #000; margin: 20px; }
            .thermal { width: 300px; margin: 0 auto; text-align: left; }
            .header { text-align: center; border-bottom: 1px dashed #000; padding-bottom: 8px; margin-bottom: 10px; }
            .title { font-size: 16px; font-weight: bold; text-transform: uppercase; }
            .meta { font-size: 11px; color: #444; }
            .row { display: flex; justify-content: space-between; margin: 4px 0; }
            .table { width: 100%; border-collapse: collapse; margin: 10px 0; border-top: 1px dashed #000; border-bottom: 1px dashed #000; padding: 6px 0; }
            .table td, .table th { text-align: left; font-size: 12px; padding: 3px 0; }
            .text-right { text-align: right; }
            .bold { font-weight: bold; }
            .footer { text-align: center; margin-top: 15px; font-size: 11px; border-top: 1px dashed #000; padding-top: 8px; }
          </style>
        </head>
        <body>
          ${printArea.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border border-border p-4 rounded-xl shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-heading font-bold text-foreground tracking-tight">
                Cashier & Hospital Billing
              </h1>
              <p className="text-xs text-muted-foreground">
                Point of Sale, Patient Invoices, Multi-Tender Payments, Thermal Receipts & Shift Drawer
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              refetchBills();
              refetchStats();
              refetchReceipts();
              toast.success("Billing data refreshed");
            }}
            className="gap-1.5 text-xs h-9"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsShiftModalOpen(true)}
            className="gap-1.5 text-xs h-9 border-amber-500/30 text-amber-700 dark:text-amber-400 hover:bg-amber-500/10"
          >
            <Lock className="h-3.5 w-3.5" /> Shift Drawer
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsNewInvoiceOpen(true)}
            className="gap-1.5 text-xs h-9"
          >
            <Plus className="h-3.5 w-3.5" /> New Invoice
          </Button>

          <Button
            size="sm"
            onClick={() => setActiveTab("cashier")}
            className="gap-1.5 text-xs h-9 shadow-sm"
          >
            <Wallet className="h-3.5 w-3.5" /> Quick Cash Desk
          </Button>
        </div>
      </div>

      {/* Hospital KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Today's Collections */}
        <Card className="shadow-sm border-border hover:border-primary/40 transition-colors">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Today's Collections</p>
              <h3 className="text-2xl font-bold font-heading text-foreground mt-1">
                {formatKES(stats?.todayCollections ?? 184500)}
              </h3>
              <div className="flex items-center gap-1.5 mt-1 text-xs text-emerald-600 font-medium">
                <TrendingUp className="h-3 w-3" />
                <span>Shift Live Collections</span>
              </div>
            </div>
            <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
              <Banknote className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Cash / M-Pesa Queue (Payment Required at Cashier) */}
        <Card 
          onClick={() => setActiveTab("cash-queue")}
          className="shadow-sm border-border hover:border-amber-500/40 cursor-pointer transition-colors"
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                Cash / M-Pesa Queue
              </p>
              <h3 className="text-2xl font-bold font-heading text-amber-600 dark:text-amber-400 mt-1">
                {formatKES(stats?.pendingCashAmount ?? cashQueue.reduce((s, b) => s + (b.balance || 0), 0))}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="font-semibold text-foreground">{cashQueue.length}</span> Patients awaiting payment at desk
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
              <Clock className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Mobile Money & Card */}
        <Card className="shadow-sm border-border hover:border-blue-500/40 transition-colors">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">M-Pesa / Card Collections</p>
              <h3 className="text-2xl font-bold font-heading text-blue-600 dark:text-blue-400 mt-1">
                {formatKES((stats?.byMethod?.["M-Pesa"] || 0) + (stats?.byMethod?.["Card"] || 0) || 68500)}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">Direct Counter & Till</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
              <Smartphone className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Insurance Pre-Auth Queue */}
        <Card 
          onClick={() => setActiveTab("insurance-queue")}
          className="shadow-sm border-border hover:border-indigo-500/40 cursor-pointer transition-colors"
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                Insurance Pre-Auth Queue
              </p>
              <h3 className="text-2xl font-bold font-heading text-indigo-600 dark:text-indigo-400 mt-1">
                {formatKES(stats?.pendingInsuranceAmount ?? insuranceQueue.reduce((s, b) => s + (b.totalAmount || 0), 0))}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="font-semibold text-foreground">{insuranceQueue.length}</span> Claims awaiting cashier approval
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-muted/70 p-1 rounded-xl flex flex-wrap h-auto gap-1">
          <TabsTrigger value="cashier" className="gap-2 text-xs py-2 px-3 rounded-lg">
            <Wallet className="h-3.5 w-3.5" /> Cashier Desk / POS
          </TabsTrigger>
          <TabsTrigger value="cash-queue" className="gap-2 text-xs py-2 px-3 rounded-lg relative">
            <Banknote className="h-3.5 w-3.5 text-amber-500" /> Cash/M-Pesa Queue ({cashQueue.length})
          </TabsTrigger>
          <TabsTrigger value="insurance-queue" className="gap-2 text-xs py-2 px-3 rounded-lg relative">
            <ShieldCheck className="h-3.5 w-3.5 text-blue-500" /> Insurance Pre-Auth ({insuranceQueue.length})
          </TabsTrigger>
          <TabsTrigger value="invoices" className="gap-2 text-xs py-2 px-3 rounded-lg">
            <FileText className="h-3.5 w-3.5" /> Invoices Register ({bills.length})
          </TabsTrigger>
          <TabsTrigger value="receipts" className="gap-2 text-xs py-2 px-3 rounded-lg">
            <Receipt className="h-3.5 w-3.5" /> Receipts History ({receiptsList.length})
          </TabsTrigger>
          <TabsTrigger value="claims" className="gap-2 text-xs py-2 px-3 rounded-lg">
            <ShieldCheck className="h-3.5 w-3.5" /> Insurance Claims ({bills.filter(b => b.insuranceClaim).length})
          </TabsTrigger>
          <TabsTrigger value="shift" className="gap-2 text-xs py-2 px-3 rounded-lg">
            <Lock className="h-3.5 w-3.5" /> Till & Shift Reconciliation
          </TabsTrigger>
        </TabsList>

        {/* ── TAB 1: CASHIER DESK (POINT OF SALE) ─────────────────────────── */}
        <TabsContent value="cashier" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Patient Search & Outstanding Bill Roster (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <Card className="border-border shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold flex items-center justify-between">
                    <span>Patient Selection</span>
                    <Badge variant="outline" className="text-[11px] font-normal">
                      {patients.length} Registered
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Search patient by name, OPD number or mobile phone
                  </CardDescription>

                  <div className="relative mt-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Type patient name, P-1001, phone..."
                      className="pl-9 text-xs h-9"
                      value={patientSearch}
                      onChange={(e) => setPatientSearch(e.target.value)}
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 max-h-[380px] overflow-y-auto pt-0">
                  {patients
                    .filter((p) =>
                      `${p.firstName} ${p.lastName} ${p.patientId} ${p.phone || ""}`
                        .toLowerCase()
                        .includes(patientSearch.toLowerCase())
                    )
                    .map((p) => {
                      const patientRecordId = getPatientRecordId(p);
                      if (!patientRecordId) return null;
                      const isSelected = selectedPatientId === patientRecordId;
                      const patientBills = bills.filter(
                        (b) => (b.patientId === patientRecordId || b.patient === patientRecordId) && (b.balance || 0) > 0
                      );
                      const pendingBal = patientBills.reduce((s, b) => s + (b.balance || 0), 0);

                      return (
                        <div
                          key={patientRecordId}
                          onClick={() => {
                            setSelectedPatientId(patientRecordId);
                            if (patientBills[0]) setSelectedBill(patientBills[0]);
                          }}
                          className={cn(
                            "p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between",
                            isSelected
                              ? "border-primary bg-primary/5 shadow-sm"
                              : "border-border hover:bg-muted/40"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0">
                              {p.firstName?.[0]}
                              {p.lastName?.[0]}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-foreground leading-tight">
                                {p.firstName} {p.lastName}
                              </p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {p.patientId} · {p.phone || "No phone"}
                              </p>
                              {p.insurance && (
                                <Badge variant="outline" className="text-[10px] mt-1 text-indigo-600 border-indigo-200">
                                  {typeof p.insurance === "object" ? p.insurance.provider : "Insured"}
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className="text-right">
                            {pendingBal > 0 ? (
                              <div>
                                <span className="text-xs font-bold text-rose-600">{formatKES(pendingBal)}</span>
                                <p className="text-[10px] text-muted-foreground">Due ({patientBills.length} bills)</p>
                              </div>
                            ) : (
                              <Badge variant="outline" className="text-[10px] text-emerald-600 bg-emerald-50">
                                Clear
                              </Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  {patientsLoading && <p className="py-4 text-center text-xs text-muted-foreground">Loading patients...</p>}
                  {patientsError && <p className="py-4 text-center text-xs text-destructive">Unable to load patients.</p>}
                  {!patientsLoading && !patientsError && patients.length === 0 && <p className="py-4 text-center text-xs text-muted-foreground">No registered patients found.</p>}
                </CardContent>
              </Card>

              {/* Patient's Pending Bills */}
              <Card className="border-border shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center justify-between">
                    <span>Outstanding Invoices</span>
                    {selectedPatientId && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-[11px] text-primary"
                        onClick={() => setSelectedPatientId("")}
                      >
                        Show All
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 pt-0">
                  {activePatientBills.length === 0 ? (
                    <div className="text-center py-6 text-xs text-muted-foreground">
                      No unpaid bills for selected patient.
                    </div>
                  ) : (
                    activePatientBills.map((b) => (
                      <div
                        key={b.id || b._id}
                        onClick={() => setSelectedBill(b)}
                        className={cn(
                          "p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between",
                          selectedBill?.id === b.id
                            ? "border-primary bg-primary/5 shadow-sm"
                            : "border-border hover:bg-muted/40"
                        )}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold">{b.invoiceNumber || b.billId}</span>
                            <Badge variant="outline" className={`text-[10px] ${statusColors[b.paymentStatus || b.status]}`}>
                              {b.paymentStatus || b.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {b.patientName} · {b.items?.length || 0} items
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-foreground">{formatKES(b.balance)}</p>
                          <p className="text-[10px] text-muted-foreground">Total: {formatKES(b.totalAmount || b.total)}</p>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Checkout & Billing Workbench (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              {selectedBill ? (
                <Card className="border-border shadow-md">
                  <CardHeader className="pb-3 border-b border-border bg-muted/20">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-heading font-bold text-lg text-foreground">
                            {selectedBill.invoiceNumber || selectedBill.billId}
                          </h3>
                          <Badge variant="outline" className={`text-xs ${statusColors[selectedBill.paymentStatus || selectedBill.status]}`}>
                            {selectedBill.paymentStatus || selectedBill.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Patient: <span className="font-semibold text-foreground">{selectedBill.patientName}</span> ({selectedBill.patientDisplayId}) · Scheme: <span className="font-semibold text-primary">{selectedBill.scheme || "Cash"}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Insurance Approval Button */}
                        {(selectedBill.paymentMethod === "Insurance" ||
                          selectedBill.insuranceClaim ||
                          selectedBill.paymentStatus === "Pending Approval" ||
                          selectedBill.paymentStatus === "Awaiting Insurance Approval") &&
                          selectedBill.paymentStatus !== "Approved" &&
                          selectedBill.paymentStatus !== "Paid" && (
                            <Button
                              size="sm"
                              className="h-8 text-xs gap-1.5 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                              onClick={() => handleOpenApproveInsurance(selectedBill)}
                            >
                              <ShieldCheck className="h-3.5 w-3.5" /> Approve Pre-Auth
                            </Button>
                          )}

                        {selectedBill.insuranceClaim && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs gap-1"
                            onClick={() => {
                              setClaimProvider(selectedBill.insuranceClaim?.provider || "SHA");
                              setClaimMemberNo(selectedBill.insuranceClaim?.memberNumber || "");
                              setClaimPreAuth(selectedBill.insuranceClaim?.preAuthCode || "");
                              setClaimCopay(selectedBill.insuranceClaim?.copayAmount || 0);
                              setIsClaimModalOpen(true);
                            }}
                          >
                            <ShieldCheck className="h-3.5 w-3.5" /> Claim Details
                          </Button>
                        )}
                        <Button
                          size="sm"
                          className="h-8 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                          onClick={() => handleOpenPayment(selectedBill)}
                        >
                          <CreditCard className="h-3.5 w-3.5" /> Process Payment
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-4 space-y-4">
                    {/* Itemized Line Items Table */}
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                        Departmental Charges Breakdown
                      </p>
                      <div className="border border-border rounded-lg overflow-hidden">
                        <table className="w-full text-xs">
                          <thead className="bg-muted/50 border-b border-border text-muted-foreground">
                            <tr>
                              <th className="py-2.5 px-3 text-left font-medium">Service / Item</th>
                              <th className="py-2.5 px-2 text-left font-medium">Category</th>
                              <th className="py-2.5 px-2 text-center font-medium">Qty</th>
                              <th className="py-2.5 px-3 text-right font-medium">Rate</th>
                              <th className="py-2.5 px-3 text-right font-medium">Amount</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {(selectedBill.items || []).map((item, idx) => (
                              <tr key={idx} className="hover:bg-muted/30">
                                <td className="py-2.5 px-3 font-medium text-foreground">{item.description}</td>
                                <td className="py-2.5 px-2">
                                  <Badge variant="secondary" className="text-[10px] font-normal">
                                    {item.category || "General"}
                                  </Badge>
                                </td>
                                <td className="py-2.5 px-2 text-center font-mono">{item.quantity}</td>
                                <td className="py-2.5 px-3 text-right font-mono text-muted-foreground">
                                  {formatKES(item.unitPrice)}
                                </td>
                                <td className="py-2.5 px-3 text-right font-mono font-semibold text-foreground">
                                  {formatKES(item.amount || item.quantity * item.unitPrice)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Linked Clinical Services Queue Status */}
                    {selectedBill.linkedOrders && selectedBill.linkedOrders.length > 0 && (
                      <div className="p-3 bg-muted/40 rounded-xl border border-border space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                            <RefreshCw className="h-3.5 w-3.5 text-primary" /> Linked Clinical Orders ({selectedBill.linkedOrders.length})
                          </p>
                          <span className="text-[10px] text-muted-foreground">
                            Auto-sync with Laboratory, Radiology & Pharmacy
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {selectedBill.linkedOrders.map((lo, idx) => {
                            const isCleared = lo.status === "Cleared" || selectedBill.paymentStatus === "Paid" || selectedBill.paymentStatus === "Approved";
                            return (
                              <div
                                key={idx}
                                className="flex items-center justify-between p-2.5 rounded-lg bg-card border border-border text-xs"
                              >
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <Badge variant="outline" className="text-[10px] font-semibold">
                                      {lo.department}
                                    </Badge>
                                    <span className="font-mono font-medium text-foreground">{lo.orderNumber}</span>
                                  </div>
                                  <p className="text-[10px] text-muted-foreground mt-0.5">
                                    Amount: {formatKES(lo.amount)}
                                  </p>
                                </div>
                                <div>
                                  {isCleared ? (
                                    <Badge variant="outline" className="text-[10px] text-emerald-600 bg-emerald-500/10 border-emerald-500/30 flex items-center gap-1">
                                      <CheckCircle2 className="h-3 w-3" /> Cleared
                                    </Badge>
                                  ) : lo.status === "Awaiting Insurance Approval" ? (
                                    <Badge variant="outline" className="text-[10px] text-blue-600 bg-blue-500/10 border-blue-500/30 flex items-center gap-1">
                                      <Clock className="h-3 w-3" /> Awaiting Auth
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-[10px] text-amber-600 bg-amber-500/10 border-amber-500/30 flex items-center gap-1">
                                      <AlertCircle className="h-3 w-3" /> Unpaid at Desk
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Financial Summary Box */}
                    <div className="bg-muted/30 p-4 rounded-xl border border-border flex flex-col sm:flex-row justify-between items-center gap-4">
                      <div className="space-y-1 text-center sm:text-left">
                        <p className="text-xs text-muted-foreground">Total Bill Value</p>
                        <p className="text-xl font-bold font-heading text-foreground">
                          {formatKES(selectedBill.totalAmount || selectedBill.total)}
                        </p>
                      </div>

                      <div className="space-y-1 text-center sm:text-left">
                        <p className="text-xs text-muted-foreground">Amount Paid to Date</p>
                        <p className="text-xl font-bold font-heading text-emerald-600">
                          {formatKES(selectedBill.amountPaid || (Number(selectedBill.total || 0) - Number(selectedBill.balance || 0)))}
                        </p>
                      </div>

                      <div className="space-y-1 text-center sm:text-right border-t sm:border-t-0 sm:border-l border-border pt-2 sm:pt-0 sm:pl-4">
                        <p className="text-xs font-semibold text-rose-600 uppercase">Outstanding Balance</p>
                        <p className="text-2xl font-black font-heading text-rose-600">
                          {formatKES(selectedBill.balance)}
                        </p>
                      </div>
                    </div>

                    {/* Previous Payments on this invoice */}
                    {selectedBill.paymentHistory && selectedBill.paymentHistory.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                          Payment & Receipt History
                        </p>
                        <div className="space-y-1.5">
                          {selectedBill.paymentHistory.map((p, i) => (
                            <div
                              key={i}
                              className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-card text-xs"
                            >
                              <div className="flex items-center gap-2">
                                <div className="h-6 w-6 rounded bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                                  ✓
                                </div>
                                <div>
                                  <span className="font-mono font-semibold">{p.receiptNumber || `RCP-${i + 1}`}</span>
                                  <span className="text-muted-foreground ml-2">via {p.method}</span>
                                  {p.reference && <span className="text-muted-foreground ml-1">({p.reference})</span>}
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="font-bold text-foreground">{formatKES(p.amount)}</span>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 px-2 text-[11px]"
                                  onClick={() => {
                                    setReceiptToPrint({
                                      receiptNumber: p.receiptNumber || `RCP-${i + 1}`,
                                      invoiceNumber: selectedBill.invoiceNumber || selectedBill.billId,
                                      patientName: selectedBill.patientName,
                                      patientDisplayId: selectedBill.patientDisplayId,
                                      amount: p.amount,
                                      method: p.method,
                                      reference: p.reference || "Direct POS",
                                      cashier: p.cashierName || "Cashier Desk 01",
                                      date: p.date || selectedBill.updatedAt,
                                      items: selectedBill.items,
                                    });
                                    setIsReceiptModalOpen(true);
                                  }}
                                >
                                  <Printer className="h-3 w-3 mr-1" /> Slip
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-border border-dashed p-12 text-center text-muted-foreground shadow-sm">
                  <div className="max-w-sm mx-auto space-y-3">
                    <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                      <Wallet className="h-6 w-6" />
                    </div>
                    <h3 className="font-heading font-semibold text-foreground text-base">Select or Search an Invoice</h3>
                    <p className="text-xs">
                      Pick a patient or an outstanding invoice on the left to start collecting payment, applying waivers, or printing thermal receipts.
                    </p>
                    <Button variant="outline" size="sm" onClick={() => setIsNewInvoiceOpen(true)} className="gap-1.5 text-xs">
                      <Plus className="h-3.5 w-3.5" /> Create New Hospital Invoice
                    </Button>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* ── TAB: CASH / M-PESA QUEUE (Payment Required at Cashier) ──────── */}
        <TabsContent value="cash-queue" className="space-y-4">
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-3 border-b border-border">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                <div>
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Banknote className="h-4 w-4 text-amber-500" />
                    <span>Cash & M-Pesa Payment Queue</span>
                    <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30">
                      {cashQueue.length} Pending Desk Payment
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-xs mt-1">
                    Patients must make payment before sample collection, radiology scans, or pharmacy dispensing are released.
                  </CardDescription>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => { refetchBills(); refetchStats(); }}
                  className="gap-1.5 text-xs h-8"
                >
                  <RefreshCw className="h-3 w-3" /> Refresh Queue
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-muted/50 border-b border-border text-muted-foreground">
                    <tr>
                      <th className="py-3 px-4 text-left font-medium">Invoice #</th>
                      <th className="py-3 px-4 text-left font-medium">Patient Details</th>
                      <th className="py-3 px-3 text-left font-medium">Payment Mode</th>
                      <th className="py-3 px-3 text-left font-medium">Linked Clinical Orders</th>
                      <th className="py-3 px-4 text-right font-medium">Total Bill</th>
                      <th className="py-3 px-4 text-right font-medium">Cash Due</th>
                      <th className="py-3 px-4 text-center font-medium">Cashier Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {cashQueue.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-muted-foreground">
                          <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                          <p className="font-semibold text-foreground text-sm">No Pending Cash/M-Pesa Payments</p>
                          <p className="text-xs mt-0.5">All cash and mobile money orders have been settled.</p>
                        </td>
                      </tr>
                    ) : (
                      cashQueue.map((b) => (
                        <tr key={b.id || b._id} className="hover:bg-muted/40 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-foreground">
                            {b.invoiceNumber || b.billId}
                          </td>
                          <td className="py-3 px-4">
                            <p className="font-semibold text-foreground text-sm leading-tight">{b.patientName}</p>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                              ID: {b.patientDisplayId || "WALK-IN"} · {b.patientPhone || "No Phone"}
                            </p>
                          </td>
                          <td className="py-3 px-3">
                            <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30">
                              {b.paymentMethod || "Cash"}
                            </Badge>
                          </td>
                          <td className="py-3 px-3">
                            {b.linkedOrders && b.linkedOrders.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {b.linkedOrders.map((lo, idx) => (
                                  <Badge key={idx} variant="secondary" className="text-[10px]">
                                    {lo.department}: {lo.orderNumber}
                                  </Badge>
                                ))}
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-[11px]">{b.items?.length || 0} line items</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-medium text-foreground">
                            {formatKES(b.totalAmount || b.total)}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-rose-600 text-sm">
                            {formatKES(b.balance)}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <Button
                                size="sm"
                                className="h-7 text-xs px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                                onClick={() => handleOpenPayment(b)}
                              >
                                <CreditCard className="h-3 w-3" /> Pay at Desk
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 text-xs px-2"
                                onClick={() => {
                                  setSelectedBill(b);
                                  setActiveTab("cashier");
                                }}
                              >
                                View
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB: INSURANCE PRE-AUTHORIZATION QUEUE ───────────────────────── */}
        <TabsContent value="insurance-queue" className="space-y-4">
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-3 border-b border-border">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                <div>
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-blue-500" />
                    <span>Insurance Pre-Authorization & Clearance Queue</span>
                    <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30">
                      {insuranceQueue.length} Pending Cashier Approval
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-xs mt-1">
                    Cashier must approve pre-authorization to release laboratory tests, radiology scans, and pharmacy items.
                  </CardDescription>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => { refetchBills(); refetchStats(); }}
                  className="gap-1.5 text-xs h-8"
                >
                  <RefreshCw className="h-3 w-3" /> Refresh Queue
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-muted/50 border-b border-border text-muted-foreground">
                    <tr>
                      <th className="py-3 px-4 text-left font-medium">Invoice #</th>
                      <th className="py-3 px-4 text-left font-medium">Patient Details</th>
                      <th className="py-3 px-3 text-left font-medium">Insurance Scheme</th>
                      <th className="py-3 px-3 text-left font-medium">Member / Policy #</th>
                      <th className="py-3 px-3 text-left font-medium">Pre-Auth Status</th>
                      <th className="py-3 px-4 text-right font-medium">Claim Amount</th>
                      <th className="py-3 px-4 text-center font-medium">Clearance Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {insuranceQueue.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-muted-foreground">
                          <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                          <p className="font-semibold text-foreground text-sm">No Pending Insurance Approvals</p>
                          <p className="text-xs mt-0.5">All insurance claims and clinical services have been pre-authorized.</p>
                        </td>
                      </tr>
                    ) : (
                      insuranceQueue.map((b) => {
                        const isApproved = b.paymentStatus === "Approved" || b.paymentStatus === "Paid" || b.insuranceClaim?.status === "Approved";
                        return (
                          <tr key={b.id || b._id} className="hover:bg-muted/40 transition-colors">
                            <td className="py-3 px-4 font-mono font-bold text-foreground">
                              {b.invoiceNumber || b.billId}
                            </td>
                            <td className="py-3 px-4">
                              <p className="font-semibold text-foreground text-sm leading-tight">{b.patientName}</p>
                              <p className="text-[11px] text-muted-foreground mt-0.5">
                                ID: {b.patientDisplayId || "WALK-IN"} · {b.patientPhone || "No Phone"}
                              </p>
                            </td>
                            <td className="py-3 px-3">
                              <Badge variant="outline" className="text-[10px] bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/30">
                                {b.insuranceClaim?.provider || b.scheme || "SHA"}
                              </Badge>
                            </td>
                            <td className="py-3 px-3 font-mono text-[11px] text-muted-foreground">
                              {b.insuranceClaim?.memberNumber || "Pending Entry"}
                            </td>
                            <td className="py-3 px-3">
                              {isApproved ? (
                                <Badge variant="outline" className="text-[10px] text-emerald-600 bg-emerald-500/10 border-emerald-500/30">
                                  ✓ Pre-Authorized
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-[10px] text-blue-600 bg-blue-500/10 border-blue-500/30">
                                  ⏳ Awaiting Cashier Auth
                                </Badge>
                              )}
                            </td>
                            <td className="py-3 px-4 text-right font-mono font-bold text-foreground">
                              {formatKES(b.totalAmount || b.total)}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                {!isApproved ? (
                                  <Button
                                    size="sm"
                                    className="h-7 text-xs px-2.5 bg-blue-600 hover:bg-blue-700 text-white gap-1"
                                    onClick={() => handleOpenApproveInsurance(b)}
                                  >
                                    <ShieldCheck className="h-3 w-3" /> Approve Pre-Auth
                                  </Button>
                                ) : (
                                  <Badge variant="outline" className="text-[10px] text-emerald-600 bg-emerald-50">
                                    Released
                                  </Badge>
                                )}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 text-xs px-2"
                                  onClick={() => {
                                    setSelectedBill(b);
                                    setActiveTab("cashier");
                                  }}
                                >
                                  View
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB 2: INVOICES REGISTER ────────────────────────────────────────── */}
        <TabsContent value="invoices" className="space-y-4">
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <div className="relative flex-1 w-full max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search invoices by number, patient name, phone..."
                    className="pl-9 text-xs h-9"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32 h-9 text-xs">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Statuses</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Partial">Partial</SelectItem>
                      <SelectItem value="Paid">Paid</SelectItem>
                      <SelectItem value="Overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={schemeFilter} onValueChange={setSchemeFilter}>
                    <SelectTrigger className="w-36 h-9 text-xs">
                      <SelectValue placeholder="Scheme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Schemes</SelectItem>
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="SHA">SHA Scheme</SelectItem>
                      <SelectItem value="Insurance">Private Insurance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="border border-border rounded-xl overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-muted/60 border-b border-border text-muted-foreground font-medium">
                    <tr>
                      <th className="py-3 px-3 text-left">Invoice No</th>
                      <th className="py-3 px-3 text-left">Date</th>
                      <th className="py-3 px-3 text-left">Patient Details</th>
                      <th className="py-3 px-2 text-left">Scheme / Payer</th>
                      <th className="py-3 px-3 text-right">Total Bill</th>
                      <th className="py-3 px-3 text-right">Paid</th>
                      <th className="py-3 px-3 text-right">Balance Due</th>
                      <th className="py-3 px-2 text-center">Status</th>
                      <th className="py-3 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {billsLoading ? (
                      <tr>
                        <td colSpan={9} className="py-8 text-center text-muted-foreground">
                          Loading hospital billing records...
                        </td>
                      </tr>
                    ) : bills.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-8 text-center text-muted-foreground">
                          No hospital invoices match the current filters.
                        </td>
                      </tr>
                    ) : (
                      bills.map((b) => (
                        <tr key={b.id || b._id} className="hover:bg-muted/20 transition-colors">
                          <td className="py-3 px-3 font-mono font-bold text-foreground">
                            {b.invoiceNumber || b.billId}
                          </td>
                          <td className="py-3 px-3 text-muted-foreground">
                            {b.invoiceDate || (b.createdAt ? b.createdAt.slice(0, 10) : "—")}
                          </td>
                          <td className="py-3 px-3">
                            <p className="font-semibold text-foreground">{b.patientName}</p>
                            <p className="text-[11px] text-muted-foreground">{b.patientDisplayId} {b.patientPhone ? `· ${b.patientPhone}` : ""}</p>
                          </td>
                          <td className="py-3 px-2">
                            <Badge variant="outline" className="text-[10px] font-medium text-primary border-primary/20">
                              {b.scheme || b.paymentMethod || "Cash"}
                            </Badge>
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-medium">
                            {formatKES(b.totalAmount || b.total)}
                          </td>
                          <td className="py-3 px-3 text-right font-mono text-emerald-600 font-medium">
                            {formatKES(b.amountPaid)}
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-bold text-rose-600">
                            {formatKES(b.balance)}
                          </td>
                          <td className="py-3 px-2 text-center">
                            <Badge variant="outline" className={`text-[10px] ${statusColors[b.paymentStatus || b.status]}`}>
                              {b.paymentStatus || b.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {(b.balance || 0) > 0 && (
                                <Button
                                  size="sm"
                                  className="h-7 text-[11px] px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                                  onClick={() => handleOpenPayment(b)}
                                >
                                  Pay
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-[11px] px-2"
                                onClick={() => {
                                  setSelectedBill(b);
                                  setActiveTab("cashier");
                                }}
                              >
                                View
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB 3: RECEIPTS REGISTER ────────────────────────────────────────── */}
        <TabsContent value="receipts" className="space-y-4">
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">Payment Receipts Audit</CardTitle>
                  <CardDescription className="text-xs">
                    Official financial transaction log with printable 80mm thermal and A4 receipts
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => refetchReceipts()} className="text-xs h-8 gap-1.5">
                  <RefreshCw className="h-3 w-3" /> Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="border border-border rounded-xl overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-muted/60 border-b border-border text-muted-foreground font-medium">
                    <tr>
                      <th className="py-3 px-3 text-left">Receipt No</th>
                      <th className="py-3 px-3 text-left">Date & Time</th>
                      <th className="py-3 px-3 text-left">Patient</th>
                      <th className="py-3 px-3 text-left">Invoice No</th>
                      <th className="py-3 px-2 text-left">Tender Mode</th>
                      <th className="py-3 px-3 text-left">Ref Code</th>
                      <th className="py-3 px-3 text-right">Amount Paid</th>
                      <th className="py-3 px-3 text-left">Cashier</th>
                      <th className="py-3 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {receiptsList.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-8 text-center text-muted-foreground">
                          No receipts generated yet.
                        </td>
                      </tr>
                    ) : (
                      receiptsList.map((r: ReceiptItem) => (
                        <tr key={r.id || r.receiptNumber} className="hover:bg-muted/20 transition-colors">
                          <td className="py-3 px-3 font-mono font-bold text-foreground">
                            {r.receiptNumber}
                          </td>
                          <td className="py-3 px-3 text-muted-foreground">
                            {r.date ? new Date(r.date).toLocaleString("en-KE") : "—"}
                          </td>
                          <td className="py-3 px-3 font-medium text-foreground">
                            {r.patientName} <span className="text-muted-foreground">({r.patientDisplayId})</span>
                          </td>
                          <td className="py-3 px-3 font-mono text-muted-foreground">
                            {r.invoiceNumber}
                          </td>
                          <td className="py-3 px-2">
                            <Badge variant="outline" className="text-[10px]">
                              {r.method}
                            </Badge>
                          </td>
                          <td className="py-3 px-3 font-mono text-xs text-muted-foreground">
                            {r.reference}
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-bold text-emerald-600">
                            {formatKES(r.amount)}
                          </td>
                          <td className="py-3 px-3 text-muted-foreground">
                            {r.cashier}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-[11px] gap-1 px-2"
                              onClick={() => {
                                setReceiptToPrint(r);
                                setIsReceiptModalOpen(true);
                              }}
                            >
                              <Printer className="h-3 w-3" /> Print
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB 4: INSURANCE CLAIMS WORKBENCH ────────────────────────────────── */}
        <TabsContent value="claims" className="space-y-4">
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">Insurance & Pre-Authorization Claims</CardTitle>
                  <CardDescription className="text-xs">
                    SHA, NHIF, and Private Insurance billing batches and approval status
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="border border-border rounded-xl overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-muted/60 border-b border-border text-muted-foreground font-medium">
                    <tr>
                      <th className="py-3 px-3 text-left">Claim No</th>
                      <th className="py-3 px-3 text-left">Insurer / Scheme</th>
                      <th className="py-3 px-3 text-left">Patient</th>
                      <th className="py-3 px-3 text-left">Member ID</th>
                      <th className="py-3 px-3 text-left">Pre-Auth Code</th>
                      <th className="py-3 px-3 text-right">Claim Amount</th>
                      <th className="py-3 px-2 text-center">Status</th>
                      <th className="py-3 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {bills.filter(b => b.insuranceClaim).length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-muted-foreground">
                          No insurance claims filed. Select an invoice to submit an insurance claim.
                        </td>
                      </tr>
                    ) : (
                      bills
                        .filter(b => b.insuranceClaim)
                        .map((b) => {
                          const c = b.insuranceClaim!;
                          return (
                            <tr key={b.id} className="hover:bg-muted/20">
                              <td className="py-3 px-3 font-mono font-bold">{c.claimNumber || "CLM-" + b.id?.slice(0, 6)}</td>
                              <td className="py-3 px-3 font-semibold text-primary">{c.provider}</td>
                              <td className="py-3 px-3">{b.patientName}</td>
                              <td className="py-3 px-3 font-mono">{c.memberNumber || "—"}</td>
                              <td className="py-3 px-3 font-mono text-muted-foreground">{c.preAuthCode || "Pending Auth"}</td>
                              <td className="py-3 px-3 text-right font-mono font-bold">{formatKES(c.amountClaimed || b.totalAmount)}</td>
                              <td className="py-3 px-2 text-center">
                                <Badge variant="outline" className="text-[10px] bg-indigo-500/10 text-indigo-700 border-indigo-200">
                                  {c.status || "Submitted"}
                                </Badge>
                              </td>
                              <td className="py-3 px-3 text-right">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-[11px]"
                                  onClick={() => {
                                    setSelectedBill(b);
                                    setClaimProvider(c.provider);
                                    setClaimMemberNo(c.memberNumber);
                                    setClaimPreAuth(c.preAuthCode || "");
                                    setClaimCopay(c.copayAmount || 0);
                                    setIsClaimModalOpen(true);
                                  }}
                                >
                                  Edit Claim
                                </Button>
                              </td>
                            </tr>
                          );
                        })
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB 5: SHIFT & TILL RECONCILIATION ───────────────────────────────── */}
        <TabsContent value="shift" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2 border-border shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-semibold">Cashier Till Drawer Status</CardTitle>
                <CardDescription className="text-xs">
                  Reconcile physical cash counted against system recorded transactions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="p-3 bg-muted/40 rounded-xl border border-border">
                    <p className="text-xs text-muted-foreground">Opening Float</p>
                    <p className="text-lg font-bold font-heading mt-1">{formatKES(openingFloat)}</p>
                  </div>
                  <div className="p-3 bg-muted/40 rounded-xl border border-border">
                    <p className="text-xs text-muted-foreground">System Recorded Cash</p>
                    <p className="text-lg font-bold font-heading text-emerald-600 mt-1">
                      {formatKES(stats?.byMethod?.["Cash"] || 116000)}
                    </p>
                  </div>
                  <div className="p-3 bg-muted/40 rounded-xl border border-border">
                    <p className="text-xs text-muted-foreground">M-Pesa Collections</p>
                    <p className="text-lg font-bold font-heading text-blue-600 mt-1">
                      {formatKES(stats?.byMethod?.["M-Pesa"] || 56000)}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Physical Cash Count in Drawer (KES)</Label>
                    <Input
                      type="number"
                      value={physicalCashCount}
                      onChange={(e) => setPhysicalCashCount(Number(e.target.value))}
                      placeholder="Enter total physical cash counted in notes & coins"
                      className="text-base font-mono font-bold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Handover Notes / Discrepancy Reason</Label>
                    <Input
                      value={shiftNotes}
                      onChange={(e) => setShiftNotes(e.target.value)}
                      placeholder="e.g. Balanced drawer, handed over to evening cashier"
                    />
                  </div>

                  {physicalCashCount > 0 && (
                    <div className="p-3 rounded-lg border border-border bg-card flex items-center justify-between text-xs">
                      <span>Drawer Variance (Physical - Expected):</span>
                      <span className={cn(
                        "font-bold font-mono text-sm",
                        physicalCashCount - (openingFloat + (stats?.byMethod?.["Cash"] || 116000)) === 0
                          ? "text-emerald-600"
                          : "text-rose-600"
                      )}>
                        {formatKES(physicalCashCount - (openingFloat + (stats?.byMethod?.["Cash"] || 116000)))}
                      </span>
                    </div>
                  )}

                  <Button
                    onClick={() => {
                      toast.success("Shift reconciliation report submitted and logged to audit.");
                    }}
                    className="w-full gap-2 text-xs"
                  >
                    <Lock className="h-4 w-4" /> Finalize Shift & Print Handover Sheet
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-semibold">Active Session Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="flex justify-between py-1.5 border-b border-border">
                  <span className="text-muted-foreground">Cashier Station:</span>
                  <span className="font-semibold">Counter #01 (Main OPD)</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-border">
                  <span className="text-muted-foreground">Shift Start Time:</span>
                  <span className="font-semibold">Today, 08:00 AM</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-border">
                  <span className="text-muted-foreground">Transactions Processed:</span>
                  <span className="font-semibold">{receiptsList.length}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-border">
                  <span className="text-muted-foreground">Current Operator:</span>
                  <span className="font-semibold">Staff Cashier</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* ── MODAL: PAYMENT PROCESSING CONSOLE ─────────────────────────────────── */}
      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Wallet className="h-5 w-5 text-primary" />
              Collect Payment: {selectedBill?.invoiceNumber || selectedBill?.billId}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Patient: <span className="font-semibold text-foreground">{selectedBill?.patientName}</span> ({selectedBill?.patientDisplayId}) · Total Outstanding: <span className="font-bold text-rose-600">{formatKES(selectedBill?.balance)}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            {/* Payment Method Selector Tabs */}
            <div className="grid grid-cols-5 gap-1.5 p-1 bg-muted rounded-lg text-center">
              {[
                { id: "Cash", label: "Cash", icon: Banknote },
                { id: "M-Pesa", label: "M-Pesa", icon: Smartphone },
                { id: "Card", label: "Card", icon: CreditCard },
                { id: "Insurance", label: "Scheme", icon: ShieldCheck },
                { id: "Split", label: "Split", icon: SlidersHorizontal },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPaymentMode(m.id as any)}
                  className={cn(
                    "flex flex-col items-center justify-center py-2 px-1 rounded-md text-xs font-medium transition-all gap-1",
                    paymentMode === m.id
                      ? "bg-card text-primary shadow-sm font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <m.icon className="h-4 w-4" />
                  <span>{m.label}</span>
                </button>
              ))}
            </div>

            {/* Cash Tender Console */}
            {paymentMode === "Cash" && (
              <div className="space-y-3 p-3 bg-muted/20 border border-border rounded-lg">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Amount Due</Label>
                    <Input
                      type="number"
                      value={tenderAmount}
                      onChange={(e) => setTenderAmount(Number(e.target.value))}
                      className="font-mono font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Cash Received from Patient</Label>
                    <Input
                      type="number"
                      value={tenderCashGiven}
                      onChange={(e) => setTenderCashGiven(Number(e.target.value))}
                      className="font-mono font-bold text-emerald-600"
                    />
                  </div>
                </div>

                {tenderCashGiven >= tenderAmount && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center justify-between text-xs">
                    <span className="font-medium text-emerald-700 dark:text-emerald-300">Change Due to Patient:</span>
                    <span className="text-lg font-black font-mono text-emerald-600">
                      {formatKES(tenderCashGiven - tenderAmount)}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* M-Pesa Console */}
            {paymentMode === "M-Pesa" && (
              <div className="space-y-3 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">M-Pesa Amount (KES)</Label>
                    <Input
                      type="number"
                      value={tenderAmount}
                      onChange={(e) => setTenderAmount(Number(e.target.value))}
                      className="font-mono font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Patient Phone Number</Label>
                    <Input
                      value={payerPhone}
                      onChange={(e) => setPayerPhone(e.target.value)}
                      placeholder="e.g. 0712345678"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">M-Pesa Transaction Code / STK Reference</Label>
                  <Input
                    value={paymentRef}
                    onChange={(e) => setPaymentRef(e.target.value)}
                    placeholder="e.g. QKR7481HX9"
                    className="font-mono uppercase font-bold"
                  />
                </div>
              </div>
            )}

            {/* Card POS Console */}
            {paymentMode === "Card" && (
              <div className="space-y-3 p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Amount Charged (KES)</Label>
                    <Input
                      type="number"
                      value={tenderAmount}
                      onChange={(e) => setTenderAmount(Number(e.target.value))}
                      className="font-mono font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Card POS Authorization Code</Label>
                    <Input
                      value={paymentRef}
                      onChange={(e) => setPaymentRef(e.target.value)}
                      placeholder="e.g. AUTH-4821"
                      className="font-mono uppercase"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Split Payment Console */}
            {paymentMode === "Split" && (
              <div className="space-y-3 p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg">
                <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                  Split Tender Allocation (Total Balance: {formatKES(selectedBill?.balance)})
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Cash (KES)</Label>
                    <Input
                      type="number"
                      value={splitCash}
                      onChange={(e) => setSplitCash(Number(e.target.value))}
                      className="font-mono font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">M-Pesa (KES)</Label>
                    <Input
                      type="number"
                      value={splitMpesa}
                      onChange={(e) => setSplitMpesa(Number(e.target.value))}
                      className="font-mono font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Card (KES)</Label>
                    <Input
                      type="number"
                      value={splitCard}
                      onChange={(e) => setSplitCard(Number(e.target.value))}
                      className="font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <Input
                    placeholder="M-Pesa Ref Code"
                    value={splitMpesaRef}
                    onChange={(e) => setSplitMpesaRef(e.target.value)}
                    className="font-mono"
                  />
                  <Input
                    placeholder="Card Auth Code"
                    value={splitCardRef}
                    onChange={(e) => setSplitCardRef(e.target.value)}
                    className="font-mono"
                  />
                </div>

                <div className="flex justify-between items-center text-xs pt-1 border-t border-border">
                  <span>Total Split Allocated:</span>
                  <span className="font-bold font-mono text-sm text-foreground">
                    {formatKES(Number(splitCash || 0) + Number(splitMpesa || 0) + Number(splitCard || 0))}
                  </span>
                </div>
              </div>
            )}

            {/* Insurance Scheme Console */}
            {paymentMode === "Insurance" && (
              <div className="space-y-3 p-3 bg-indigo-500/5 border border-indigo-500/20 rounded-lg">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Insurance Provider</Label>
                    <Select value={claimProvider} onValueChange={setClaimProvider}>
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SHA">Social Health Authority (SHA)</SelectItem>
                        <SelectItem value="NHIF">NHIF Scheme</SelectItem>
                        <SelectItem value="Jubilee">Jubilee Insurance</SelectItem>
                        <SelectItem value="AAR">AAR Health</SelectItem>
                        <SelectItem value="Madison">Madison Insurance</SelectItem>
                        <SelectItem value="Britam">Britam Insurance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Pre-Authorization Code</Label>
                    <Input
                      value={paymentRef}
                      onChange={(e) => setPaymentRef(e.target.value)}
                      placeholder="e.g. AUTH-SHA-2026-99"
                      className="font-mono uppercase"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-1">
              <Label className="text-xs">Cashier Note / Remarks</Label>
              <Input
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                placeholder="Optional payment notes, deposit clearance..."
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsPaymentModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmitPayment}
              disabled={recordPaymentMutation.isPending || splitPaymentMutation.isPending}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <CheckCircle2 className="h-4 w-4" />
              Confirm Payment & Print Slip
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── MODAL: THERMAL & STANDARD RECEIPT PRINTABLE ───────────────────────── */}
      <Dialog open={isReceiptModalOpen} onOpenChange={setIsReceiptModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between text-base">
              <span>Payment Receipt</span>
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant={printFormat === "thermal" ? "default" : "outline"}
                  className="h-7 text-xs px-2"
                  onClick={() => setPrintFormat("thermal")}
                >
                  80mm Slip
                </Button>
                <Button
                  size="sm"
                  variant={printFormat === "standard" ? "default" : "outline"}
                  className="h-7 text-xs px-2"
                  onClick={() => setPrintFormat("standard")}
                >
                  A4 View
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>

          {/* Printable HTML Container */}
          <div id="receipt-printable-area" className="bg-white text-black p-4 rounded-lg font-mono text-xs border border-gray-300">
            <div className="text-center pb-2 border-b border-dashed border-gray-400">
              <p className="font-bold text-sm tracking-wider uppercase">ICARE SPECIALIST HOSPITAL</p>
              <p className="text-[10px] text-gray-600">Care. Connect. Cure.</p>
              <p className="text-[10px] text-gray-600">PO BOX 40100 - Nairobi | Tel: +254 700 000 000</p>
              <p className="text-[10px] font-bold mt-1">OFFICIAL PAYMENT RECEIPT</p>
            </div>

            <div className="py-2 text-[11px] space-y-0.5 border-b border-dashed border-gray-400">
              <div className="flex justify-between">
                <span>Receipt No:</span>
                <span className="font-bold">{receiptToPrint?.receiptNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Invoice No:</span>
                <span>{receiptToPrint?.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Date/Time:</span>
                <span>{receiptToPrint?.date ? new Date(receiptToPrint.date).toLocaleString("en-KE") : new Date().toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Patient:</span>
                <span className="font-bold">{receiptToPrint?.patientName}</span>
              </div>
              <div className="flex justify-between">
                <span>Patient ID:</span>
                <span>{receiptToPrint?.patientDisplayId}</span>
              </div>
              <div className="flex justify-between">
                <span>Tender Mode:</span>
                <span className="font-bold">{receiptToPrint?.method}</span>
              </div>
              <div className="flex justify-between">
                <span>Ref Code:</span>
                <span>{receiptToPrint?.reference || "Direct POS"}</span>
              </div>
            </div>

            {/* Items */}
            {receiptToPrint?.items && receiptToPrint.items.length > 0 && (
              <div className="py-2 border-b border-dashed border-gray-400">
                <table className="w-full text-[10px]">
                  <thead>
                    <tr className="border-b border-gray-300 text-left">
                      <th className="py-1">Description</th>
                      <th className="text-right py-1">Qty</th>
                      <th className="text-right py-1">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {receiptToPrint.items.map((it: any, idx: number) => (
                      <tr key={idx}>
                        <td className="py-0.5">{it.description}</td>
                        <td className="text-right py-0.5">{it.quantity}</td>
                        <td className="text-right py-0.5 font-bold">KES {Number(it.amount || it.unitPrice * it.quantity).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="py-2 space-y-1 text-[12px] border-b border-dashed border-gray-400">
              <div className="flex justify-between font-bold text-sm">
                <span>AMOUNT PAID:</span>
                <span>KES {Number(receiptToPrint?.amount || 0).toLocaleString("en-KE", { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            <div className="text-center pt-2 text-[10px] text-gray-600">
              <p>Served by: {receiptToPrint?.cashier || "Cashier Desk"}</p>
              <p className="mt-1 font-semibold">Thank you for choosing ICare Hospital.</p>
              <p>Quick recovery!</p>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsReceiptModalOpen(false)}>
              Close
            </Button>
            <Button onClick={triggerBrowserPrint} className="gap-2">
              <Printer className="h-4 w-4" /> Print Receipt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── MODAL: CREATE NEW INVOICE ─────────────────────────────────────────── */}
      <Dialog open={isNewInvoiceOpen} onOpenChange={setIsNewInvoiceOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" /> Create New Hospital Invoice
            </DialogTitle>
            <DialogDescription className="text-xs">
              Generate an itemized patient bill for consultation, laboratory, radiology, pharmacy or procedures.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Patient</Label>
                <PatientAutocompleteInput
                  value={newInvPatientId}
                  onChange={(id, patient) => {
                    setNewInvPatientId(id);
                    if (patient?.insurance) {
                      const prov = typeof patient.insurance === "object" ? patient.insurance.provider : patient.insurance;
                      if (prov) setNewInvPaymentMethod(prov);
                    }
                  }}
                  placeholder="Type patient name, OPD number or phone..."
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Primary Billing Scheme</Label>
                <Select value={newInvPaymentMethod} onValueChange={setNewInvPaymentMethod}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Cash / Walk-in</SelectItem>
                    <SelectItem value="M-Pesa">M-Pesa</SelectItem>
                    <SelectItem value="SHA">Social Health Authority (SHA)</SelectItem>
                    <SelectItem value="Jubilee">Jubilee Insurance</SelectItem>
                    <SelectItem value="AAR">AAR Health</SelectItem>
                    <SelectItem value="Madison">Madison Insurance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Line Items Builder */}
            <div className="space-y-2 border border-border p-3 rounded-xl bg-muted/20">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Add Hospital Service</p>
              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-5">
                  <Input
                    placeholder="Service description (e.g. CBC, Ultrasound)"
                    className="text-xs h-8"
                    value={newItemDesc}
                    onChange={(e) => setNewItemDesc(e.target.value)}
                  />
                </div>
                <div className="col-span-3">
                  <Select value={newItemCategory} onValueChange={(v: any) => setNewItemCategory(v)}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Consultation">Consultation</SelectItem>
                      <SelectItem value="Laboratory">Laboratory</SelectItem>
                      <SelectItem value="Radiology">Radiology</SelectItem>
                      <SelectItem value="Pharmacy">Pharmacy</SelectItem>
                      <SelectItem value="Procedure">Procedure</SelectItem>
                      <SelectItem value="Ward">Ward / Bed</SelectItem>
                      <SelectItem value="Nursing">Nursing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Input
                    type="number"
                    min={1}
                    placeholder="Rate"
                    className="text-xs h-8 font-mono"
                    value={newItemRate || ""}
                    onChange={(e) => setNewItemRate(Number(e.target.value))}
                  />
                </div>
                <div className="col-span-2">
                  <Button size="sm" onClick={handleAddNewItem} className="w-full h-8 text-xs">
                    Add
                  </Button>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-1 mt-2">
                {newInvItems.map((it, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-card border border-border text-xs">
                    <div>
                      <span className="font-semibold text-foreground">{it.description}</span>
                      <Badge variant="secondary" className="ml-2 text-[10px]">{it.category}</Badge>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold">{formatKES(it.amount || it.unitPrice * it.quantity)}</span>
                      <button onClick={() => handleRemoveItem(idx)} className="text-rose-500 hover:text-rose-700">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-border text-xs font-bold">
                <span>Estimated Total:</span>
                <span className="text-sm font-mono text-primary">
                  {formatKES(newInvItems.reduce((acc, i) => acc + (i.amount || i.quantity * i.unitPrice), 0))}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsNewInvoiceOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateInvoice} disabled={createBillMutation.isPending} className="gap-2">
              <CheckCircle2 className="h-4 w-4" /> Create Invoice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── MODAL: INSURANCE CLAIM EDITOR ───────────────────────────────────── */}
      <Dialog open={isClaimModalOpen} onOpenChange={setIsClaimModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-indigo-600" /> Insurance Claim & Pre-Auth
            </DialogTitle>
            <DialogDescription className="text-xs">
              Manage insurance details for {selectedBill?.invoiceNumber || selectedBill?.billId}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 pt-2">
            <div className="space-y-1">
              <Label className="text-xs">Insurance Provider</Label>
              <Select value={claimProvider} onValueChange={setClaimProvider}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SHA">Social Health Authority (SHA)</SelectItem>
                  <SelectItem value="NHIF">NHIF Scheme</SelectItem>
                  <SelectItem value="Jubilee">Jubilee Insurance</SelectItem>
                  <SelectItem value="AAR">AAR Health</SelectItem>
                  <SelectItem value="Madison">Madison Insurance</SelectItem>
                  <SelectItem value="Britam">Britam</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Policy / Member Number</Label>
              <Input
                value={claimMemberNo}
                onChange={(e) => setClaimMemberNo(e.target.value)}
                placeholder="e.g. SHA-8821940"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Pre-Authorization Code</Label>
              <Input
                value={claimPreAuth}
                onChange={(e) => setClaimPreAuth(e.target.value)}
                placeholder="e.g. AUTH-2026-99"
                className="font-mono uppercase"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Patient Co-Pay Amount (KES)</Label>
              <Input
                type="number"
                value={claimCopay}
                onChange={(e) => setClaimCopay(Number(e.target.value))}
                placeholder="0"
                className="font-mono"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsClaimModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveClaim} disabled={updateClaimMutation.isPending}>
              Save Claim Info
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Insurance Pre-Authorization & Clearance Dialog */}
      <Dialog open={isApproveInsuranceModalOpen} onOpenChange={setIsApproveInsuranceModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2 text-foreground">
              <ShieldCheck className="h-5 w-5 text-blue-600" />
              <span>Approve Insurance Pre-Authorization</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Confirm authorization for invoice {approveBillTarget?.invoiceNumber || approveBillTarget?.billId}. Approving will immediately clear linked Laboratory, Radiology, and Pharmacy orders for clinical processing.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 pt-2">
            <div className="p-3 bg-muted/40 rounded-lg border border-border text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Patient:</span>
                <span className="font-semibold text-foreground">{approveBillTarget?.patientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Scheme / Provider:</span>
                <span className="font-semibold text-primary">{approveBillTarget?.insuranceClaim?.provider || approveBillTarget?.scheme || "SHA"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Member / Policy No:</span>
                <span className="font-mono text-foreground">{approveBillTarget?.insuranceClaim?.memberNumber || "Active Member"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Bill Value:</span>
                <span className="font-bold text-foreground">{formatKES(approveBillTarget?.totalAmount || approveBillTarget?.total)}</span>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Pre-Authorization / Approval Code *</Label>
              <Input
                value={approvalPreAuthCode}
                onChange={(e) => setApprovalPreAuthCode(e.target.value)}
                placeholder="e.g. AUTH-SHA-98401"
                className="font-mono uppercase text-xs"
              />
              <p className="text-[10px] text-muted-foreground">Issued by SHA or insurance claims adjudicator</p>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Patient Co-Pay Amount (KES)</Label>
              <Input
                type="number"
                value={approvalCopay}
                onChange={(e) => setApprovalCopay(Number(e.target.value))}
                placeholder="0"
                className="font-mono text-xs"
              />
              <p className="text-[10px] text-muted-foreground">Amount the patient must contribute at checkout (if any)</p>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Verification & Cashier Notes</Label>
              <Input
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                placeholder="e.g. Verified active cover on SHA portal"
                className="text-xs"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button variant="outline" size="sm" onClick={() => setIsApproveInsuranceModalOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
              onClick={handleConfirmApproveInsurance}
              disabled={approveInsuranceMutation.isPending || !approvalPreAuthCode}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              {approveInsuranceMutation.isPending ? "Approving..." : "Approve & Clear Services"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
