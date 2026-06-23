import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { AuthProvider } from "@/contexts/AuthContext";
import { ModuleProvider } from "@/contexts/ModuleContext";

// Main module pages
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Appointments from "./pages/Appointments";
import PatientRegistry from "./pages/PatientRegistry";
import Emergency from "./pages/Emergency";
import TriageNursing from "./pages/TriageNursing";
import DoctorModule from "./pages/DoctorModule";
import CashierBilling from "./pages/CashierBilling";
import Finance from "./pages/Finance";
import FinanceDashboard from "./pages/FinanceDashboard";
import BillingPage from "./pages/BillingPage";
import InsuranceClaimsPage from "./pages/InsuranceClaimsPage";
import AccountsReceivablePage from "./pages/AccountsReceivablePage";
import AccountsPayablePage from "./pages/AccountsPayablePage";
import CashOfficePage from "./pages/CashOfficePage";
import GeneralLedgerPage from "./pages/GeneralLedgerPage";
import AssetManagementPage from "./pages/AssetManagementPage";
import BudgetManagementPage from "./pages/BudgetManagementPage";
import Insurance from "./pages/Insurance";
import Laboratory from "./pages/Laboratory";
import Radiology from "./pages/Radiology";
import Pharmacy from "./pages/Pharmacy";
import InPatient from "./pages/InPatient";
import Theatre from "./pages/Theatre";
import BloodBank from "./pages/BloodBank";
import CSSD from "./pages/CSSD";
import Nutrition from "./pages/Nutrition";
import Telemedicine from "./pages/Telemedicine";
import Mortuary from "./pages/Mortuary";
import Procurement from "./pages/Procurement";
import Inventory from "./pages/Inventory";
import AccountsReceivable from "./pages/AccountsReceivable";
import GeneralLedger from "./pages/GeneralLedger";
import FixedAssets from "./pages/FixedAssets";
import HumanResource from "./pages/HumanResource";
import Messaging from "./pages/Messaging";
import Ticketing from "./pages/Ticketing";
import IT from "./pages/IT";
import ITTickets from "./pages/it/Tickets";
import ITHardware from "./pages/it/Hardware";
import ITSoftware from "./pages/it/Software";
import ITAccess from "./pages/it/Access";
import ITNetwork from "./pages/it/Network";
import SuperAdmin from "./pages/SuperAdmin";
import ModuleControl from "./pages/super-admin/ModuleControl";
import SystemHealth from "./pages/super-admin/SystemHealth";
import EmergencyControls from "./pages/super-admin/EmergencyControls";
import GlobalAudit from "./pages/super-admin/GlobalAudit";
import SystemOverride from "./pages/super-admin/SystemOverride";
import Reports from "./pages/Reports";
import Administration from "./pages/Administration";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";

// Dashboard submodules
import Analytics from "./pages/dashboard/Analytics";
import Activity from "./pages/dashboard/Activity";

// Appointment submodules
import BookAppointment from "./pages/appointments/Book";
import DoctorSchedule from "./pages/appointments/DoctorSchedule";
import WalkIn from "./pages/appointments/WalkIn";
import AppointmentHistory from "./pages/appointments/AppointmentHistory";

// Patient submodules
import Register from "./pages/patients/Register";
import SearchPatients from "./pages/patients/SearchPatients";
import Queue from "./pages/patients/Queue";
import Transfers from "./pages/patients/Transfers";

// Emergency submodules
import EmergencyTriage from "./pages/emergency/Triage";
import Trauma from "./pages/emergency/Trauma";
import Resuscitation from "./pages/emergency/Resuscitation";
import EmergencyBilling from "./pages/emergency/EmergencyBilling";

// Triage submodules
import Vitals from "./pages/triage/Vitals";
import NursingProcedures from "./pages/triage/Procedures";
import CareNotes from "./pages/triage/Notes";
import VitalsHistory from "./pages/triage/VitalsHistory";

// Doctor submodules
import IPD from "./pages/doctor/ipd";
import MedicalHistory from "./pages/doctor/MedicalHistory";
import DischargeSummary from "./pages/doctor/DischargeSummary";

// Billing submodules
import NewInvoice from "./pages/billing/Invoice";
import Payments from "./pages/billing/Payments";
import Receipts from "./pages/billing/Receipts";
import InsuranceClaims from "./pages/billing/Claims";

// Insurance submodules
import InsClaimSubmission from "./pages/insurance/Claims";
import ClaimTracking from "./pages/insurance/Tracking";
import TPA from "./pages/insurance/TPA";
import RateContracts from "./pages/insurance/Rates";

// Lab submodules
import Samples from "./pages/laboratory/Samples";
import LabResults from "./pages/laboratory/Results";
import LabReports from "./pages/laboratory/Reports";
import TestTemplates from "./pages/laboratory/Templates";

// Radiology submodules
import RadiologyImaging from "./pages/radiology/Imaging";
import RadiologyReports from "./pages/radiology/RadiologyReports";
import RadiologyValidation from "./pages/radiology/Validation";

// Pharmacy submodules
import OTCSales from "./pages/pharmacy/OTC";
import PharmacyStock from "./pages/pharmacy/Stock";
import ExpiryTracking from "./pages/pharmacy/Expiry";
import PharmacyReports from "./pages/pharmacy/PharmacyReports";

// InPatient submodules
import Admissions from "./pages/inpatient/Admissions";
import BedManagement from "./pages/inpatient/Beds";
import Discharges from "./pages/inpatient/Discharges";
import InpatientTransfers from "./pages/inpatient/InpatientTransfers";

// Theatre submodules
import SurgeryBooking from "./pages/theatre/Booking";
import PreOp from "./pages/theatre/PreOp";
import OTNotes from "./pages/theatre/OTNotes";
import PostOp from "./pages/theatre/PostOp";
import OTUtilization from "./pages/theatre/Utilization";

// Blood Bank submodules
import DonorRegistration from "./pages/bloodbank/Donors";
import BloodCollection from "./pages/bloodbank/Collection";
import CrossMatch from "./pages/bloodbank/CrossMatch";
import BloodIssue from "./pages/bloodbank/BloodIssue";

// CSSD submodules
import InstrumentTracking from "./pages/cssd/Instruments";
import CycleMonitoring from "./pages/cssd/Cycles";
import QualityControl from "./pages/cssd/Quality";

// Nutrition submodules
import MealOrders from "./pages/nutrition/Meals";
import KitchenManagement from "./pages/nutrition/Kitchen";
import DietaryAssessment from "./pages/nutrition/Assessment";

// Telemedicine submodules
import ScheduleSession from "./pages/telemedicine/Schedule";
import EPrescriptions from "./pages/telemedicine/EPrescriptions";
import PatientPortal from "./pages/telemedicine/Portal";

// Mortuary submodules
import MortuaryAdmission from "./pages/mortuary/Admission";
import MortuaryRelease from "./pages/mortuary/Release";
import DeathCertificates from "./pages/mortuary/Certificates";

// Procurement submodules
import LPOManagement from "./pages/procurement/LPO";
import Suppliers from "./pages/procurement/Suppliers";
import Payables from "./pages/procurement/Payables";
import AgingAnalysis from "./pages/procurement/Aging";

// Inventory submodules
import GoodsReceipt from "./pages/inventory/Receipt";
import Issuance from "./pages/inventory/Issue";
import StockTake from "./pages/inventory/StockTake";
import MovementReport from "./pages/inventory/Movement";

// AR submodules
import ARStatements from "./pages/ar/Statements";
import ARAllocations from "./pages/ar/Allocations";
import ARJournals from "./pages/ar/Journals";

// GL submodules
import GLJournals from "./pages/gl/GLJournals";
import TrialBalance from "./pages/gl/TrialBalance";
import BankReconciliation from "./pages/gl/Bank";
import BankTransfers from "./pages/gl/BankTransfers";

// Fixed Assets submodules
import AssetAcquisitions from "./pages/assets/Acquisitions";
import Depreciation from "./pages/assets/Depreciation";
import AssetDisposal from "./pages/assets/Disposal";

// HR submodules
import LeaveManagement from "./pages/hr/Leave";
import Attendance from "./pages/hr/Attendance";
import Payroll from "./pages/hr/Payroll";
import TaxBenefits from "./pages/hr/Tax";

// Messaging submodules
import Compose from "./pages/messaging/Compose";
import Broadcasts from "./pages/messaging/Broadcasts";
import Notifications from "./pages/messaging/Notifications";

// Reports submodules
import ClinicalReports from "./pages/reports/Clinical";
import InventoryReports from "./pages/reports/InventoryReports";
import PayrollReports from "./pages/reports/PayrollReports";
import ExportReports from "./pages/reports/Export";

// Admin submodules
import Roles from "./pages/admin/Roles";
import AuditTrail from "./pages/admin/Audit";
import SystemSettings from "./pages/admin/Settings";
import AccessControl from "./pages/admin/AccessControl";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ModuleProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
          <Routes>
          {/* Auth Routes - Outside AppLayout */}
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Main App Routes - Inside AppLayout */}
          <Route
            path="/*"
            element={
              <AppLayout>
                <Routes>
                  {/* Home / Dashboard */}
                  <Route path="/" element={<Index />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/dashboard/analytics" element={<Analytics />} />
                  <Route path="/dashboard/activity" element={<Activity />} />

            {/* Appointments / OPD */}
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/appointments/book" element={<BookAppointment />} />
            <Route path="/appointments/doctor-schedule" element={<DoctorSchedule />} />
            <Route path="/appointments/walkin" element={<WalkIn />} />
            <Route path="/appointments/history" element={<AppointmentHistory />} />

            {/* Patient Registry */}
            <Route path="/patients" element={<PatientRegistry />} />
            <Route path="/patients/register" element={<Register />} />
            <Route path="/patients/search" element={<SearchPatients />} />
            <Route path="/patients/queue" element={<Queue />} />
            <Route path="/patients/transfers" element={<Transfers />} />

            {/* Emergency */}
            <Route path="/emergency" element={<Emergency />} />
            <Route path="/emergency/triage" element={<EmergencyTriage />} />
            <Route path="/emergency/trauma" element={<Trauma />} />
            <Route path="/emergency/resuscitation" element={<Resuscitation />} />
            <Route path="/emergency/billing" element={<EmergencyBilling />} />

            {/* Triage & Nursing */}
            <Route path="/triage" element={<TriageNursing />} />
            <Route path="/triage/vitals" element={<Vitals />} />
            <Route path="/triage/procedures" element={<NursingProcedures />} />
            <Route path="/triage/notes" element={<CareNotes />} />
            <Route path="/triage/history" element={<VitalsHistory />} />

            {/* Doctor */}
            <Route path="/doctor" element={<DoctorModule />} />
            <Route path="/doctor/ipd" element={<IPD />} />

            {/* Billing */}
            <Route path="/billing" element={<CashierBilling />} />
            <Route path="/billing/invoice" element={<NewInvoice />} />
            <Route path="/billing/payments" element={<Payments />} />
            <Route path="/billing/receipts" element={<Receipts />} />
            <Route path="/billing/claims" element={<InsuranceClaims />} />

            {/* Finance (Consolidated Module) */}
            <Route path="/finance" element={<FinanceDashboard />} />
            <Route path="/finance/billing" element={<BillingPage />} />
            <Route path="/finance/insurance" element={<InsuranceClaimsPage />} />
            <Route path="/finance/accounts-receivable" element={<AccountsReceivablePage />} />
            <Route path="/finance/accounts-payable" element={<AccountsPayablePage />} />
            <Route path="/finance/cash-office" element={<CashOfficePage />} />
            <Route path="/finance/general-ledger" element={<GeneralLedgerPage />} />
            <Route path="/finance/assets" element={<AssetManagementPage />} />
            <Route path="/finance/budget" element={<BudgetManagementPage />} />

            {/* Insurance & TPA */}
            <Route path="/insurance" element={<Insurance />} />
            <Route path="/insurance/claims" element={<InsClaimSubmission />} />
            <Route path="/insurance/tracking" element={<ClaimTracking />} />
            <Route path="/insurance/tpa" element={<TPA />} />
            <Route path="/insurance/rates" element={<RateContracts />} />

            {/* Laboratory */}
            <Route path="/laboratory" element={<Laboratory />} />
            <Route path="/laboratory/samples" element={<Samples />} />
            <Route path="/laboratory/results" element={<LabResults />} />
            <Route path="/laboratory/reports" element={<LabReports />} />
            <Route path="/laboratory/templates" element={<TestTemplates />} />

            {/* Radiology */}
            <Route path="/radiology" element={<Radiology />} />
            <Route path="/radiology/imaging" element={<RadiologyImaging />} />
            <Route path="/radiology/reports" element={<RadiologyReports />} />
            <Route path="/radiology/validation" element={<RadiologyValidation />} />

            {/* Pharmacy */}
            <Route path="/pharmacy" element={<Pharmacy />} />
            <Route path="/pharmacy/otc" element={<OTCSales />} />
            <Route path="/pharmacy/stock" element={<PharmacyStock />} />
            <Route path="/pharmacy/expiry" element={<ExpiryTracking />} />
            <Route path="/pharmacy/reports" element={<PharmacyReports />} />

            {/* In-Patient */}
            <Route path="/inpatient" element={<InPatient />} />
            <Route path="/inpatient/admissions" element={<Admissions />} />
            <Route path="/inpatient/beds" element={<BedManagement />} />
            <Route path="/inpatient/discharges" element={<Discharges />} />
            <Route path="/inpatient/transfers" element={<InpatientTransfers />} />

            {/* Operation Theatre */}
            <Route path="/theatre" element={<Theatre />} />
            <Route path="/theatre/booking" element={<SurgeryBooking />} />
            <Route path="/theatre/preop" element={<PreOp />} />
            <Route path="/theatre/notes" element={<OTNotes />} />
            <Route path="/theatre/postop" element={<PostOp />} />
            <Route path="/theatre/utilization" element={<OTUtilization />} />

            {/* Blood Bank */}
            <Route path="/blood-bank" element={<BloodBank />} />
            <Route path="/blood-bank/donors" element={<DonorRegistration />} />
            <Route path="/blood-bank/collection" element={<BloodCollection />} />
            <Route path="/blood-bank/crossmatch" element={<CrossMatch />} />
            <Route path="/blood-bank/issue" element={<BloodIssue />} />

            {/* CSSD */}
            <Route path="/cssd" element={<CSSD />} />
            <Route path="/cssd/instruments" element={<InstrumentTracking />} />
            <Route path="/cssd/cycles" element={<CycleMonitoring />} />
            <Route path="/cssd/quality" element={<QualityControl />} />

            {/* Nutrition */}
            <Route path="/nutrition" element={<Nutrition />} />
            <Route path="/nutrition/meals" element={<MealOrders />} />
            <Route path="/nutrition/kitchen" element={<KitchenManagement />} />
            <Route path="/nutrition/assessment" element={<DietaryAssessment />} />

            {/* Telemedicine */}
            <Route path="/telemedicine" element={<Telemedicine />} />
            <Route path="/telemedicine/schedule" element={<ScheduleSession />} />
            <Route path="/telemedicine/prescriptions" element={<EPrescriptions />} />
            <Route path="/telemedicine/portal" element={<PatientPortal />} />

            {/* Mortuary */}
            <Route path="/mortuary" element={<Mortuary />} />
            <Route path="/mortuary/admission" element={<MortuaryAdmission />} />
            <Route path="/mortuary/release" element={<MortuaryRelease />} />
            <Route path="/mortuary/certificates" element={<DeathCertificates />} />

            {/* Procurement */}
            <Route path="/procurement" element={<Procurement />} />
            <Route path="/procurement/lpo" element={<LPOManagement />} />
            <Route path="/procurement/suppliers" element={<Suppliers />} />
            <Route path="/procurement/payables" element={<Payables />} />
            <Route path="/procurement/aging" element={<AgingAnalysis />} />

            {/* Inventory */}
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/inventory/receipt" element={<GoodsReceipt />} />
            <Route path="/inventory/issue" element={<Issuance />} />
            <Route path="/inventory/stocktake" element={<StockTake />} />
            <Route path="/inventory/movement" element={<MovementReport />} />

            {/* Accounts Receivable */}
            <Route path="/accounts-receivable" element={<AccountsReceivable />} />
            <Route path="/accounts-receivable/statements" element={<ARStatements />} />
            <Route path="/accounts-receivable/allocations" element={<ARAllocations />} />
            <Route path="/accounts-receivable/journals" element={<ARJournals />} />

            {/* General Ledger */}
            <Route path="/general-ledger" element={<GeneralLedger />} />
            <Route path="/general-ledger/journals" element={<GLJournals />} />
            <Route path="/general-ledger/trial-balance" element={<TrialBalance />} />
            <Route path="/general-ledger/bank" element={<BankReconciliation />} />
            <Route path="/general-ledger/transfers" element={<BankTransfers />} />

            {/* Fixed Assets */}
            <Route path="/fixed-assets" element={<FixedAssets />} />
            <Route path="/fixed-assets/acquisitions" element={<AssetAcquisitions />} />
            <Route path="/fixed-assets/depreciation" element={<Depreciation />} />
            <Route path="/fixed-assets/disposal" element={<AssetDisposal />} />

            {/* HR */}
            <Route path="/hr" element={<HumanResource />} />
            <Route path="/hr/leave" element={<LeaveManagement />} />
            <Route path="/hr/attendance" element={<Attendance />} />
            <Route path="/hr/payroll" element={<Payroll />} />
            <Route path="/hr/tax" element={<TaxBenefits />} />

            {/* Messaging */}
            <Route path="/messaging" element={<Messaging />} />
            <Route path="/messaging/compose" element={<Compose />} />
            <Route path="/messaging/broadcasts" element={<Broadcasts />} />
            <Route path="/messaging/notifications" element={<Notifications />} />

            {/* Ticketing */}
            <Route path="/ticketing/*" element={<Ticketing />} />

            {/* IT & Support */}
            <Route path="/it" element={<IT />} />
            <Route path="/it/tickets" element={<ITTickets />} />
            <Route path="/it/hardware" element={<ITHardware />} />
            <Route path="/it/software" element={<ITSoftware />} />
            <Route path="/it/access" element={<ITAccess />} />
            <Route path="/it/network" element={<ITNetwork />} />

            {/* Super Admin */}
            <Route path="/super-admin" element={<SuperAdmin />} />
            <Route path="/super-admin/modules" element={<ModuleControl />} />
            <Route path="/super-admin/health" element={<SystemHealth />} />
            <Route path="/super-admin/emergency" element={<EmergencyControls />} />
            <Route path="/super-admin/audit" element={<GlobalAudit />} />
            <Route path="/super-admin/override" element={<SystemOverride />} />

            {/* Reports */}
            <Route path="/reports" element={<Reports />} />
            <Route path="/reports/clinical" element={<ClinicalReports />} />
            <Route path="/reports/inventory" element={<InventoryReports />} />
            <Route path="/reports/payroll" element={<PayrollReports />} />
            <Route path="/reports/export" element={<ExportReports />} />

            {/* Administration */}
            <Route path="/admin" element={<Administration />} />
            <Route path="/admin/roles" element={<Roles />} />
            <Route path="/admin/access-control" element={<AccessControl />} />
            <Route path="/admin/audit" element={<AuditTrail />} />
            <Route path="/admin/settings" element={<SystemSettings />} />

                  <Route path="*" element={<NotFound />} />
                </Routes>
              </AppLayout>
            }
          />
        </Routes>
      </BrowserRouter>
      </TooltipProvider>
      </ModuleProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
