import { useMemo } from "react";
import { Navigate, Outlet, useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { admittedPatients } from "./ipd";
import {
  FileText,
  FilePlus,
  Search,
  ShoppingBag,
  Hospital,
  Pill,
  CheckCircle,
  HeartPulse,
  BarChart3,
  Droplet,
  Archive,
  CreditCard,
  AlertOctagon,
  Layers,
  Eye,
  Paperclip,
  TestTube2,
  ListChecks,
  ArrowRightLeft,
  DoorOpen,
  Printer,
  Brain,
} from "lucide-react";

const submodules = [
  { key: "notes", label: "Notes", icon: FileText },
  { key: "note-create", label: "Note Create", icon: FilePlus },
  { key: "note-finder", label: "Note Finder", icon: Search },
  { key: "consumable-requisition", label: "Consumable Requisition", icon: ShoppingBag },
  { key: "vital-sign-graph", label: "Vital Sign Graph", icon: BarChart3 },
  { key: "prescribed-medicine", label: "Prescribed Medicine", icon: Pill },
  { key: "mar", label: "MAR", icon: Layers },
  { key: "ipd-services", label: "IPD Services", icon: Hospital },
  { key: "procedures", label: "Procedures", icon: HeartPulse },
  { key: "final-diagnosis", label: "Final Diagnosis", icon: CheckCircle },
  { key: "doctor-visit", label: "Doctor Visit", icon: Eye },
  { key: "vital-sign-chart", label: "Vital Sign Chart", icon: HeartPulse },
  { key: "blood-transfusion", label: "Blood Transfusion", icon: Droplet },
  { key: "blood-transfusion-record", label: "Blood Transfusion Record", icon: Archive },
  { key: "billing", label: "Billing", icon: CreditCard },
  { key: "patient-allergy", label: "Patient Allergy", icon: AlertOctagon },
  { key: "med-return-requisition", label: "Med. Return Requisition", icon: DoorOpen },
  { key: "view-requisition", label: "View Requisition", icon: ListChecks },
  { key: "sample-collection", label: "Sample Collection", icon: TestTube2 },
  { key: "investigation-view", label: "Investigation View", icon: Search },
  { key: "blood-request", label: "Blood Request", icon: Droplet },
  { key: "pre-op-checklist", label: "Pre-Op Checklist", icon: CheckCircle },
  { key: "room-shift", label: "Room Shift", icon: ArrowRightLeft },
  { key: "discharge", label: "Discharge", icon: DoorOpen },
  { key: "view-uploaded-document", label: "View/Uploaded Document", icon: Paperclip },
  { key: "intake-output-chart", label: "Intake Output Chart", icon: BarChart3 },
  { key: "transfer-to-mortuary", label: "Transfer To Mortuary", icon: Hospital },
  { key: "ot-trainer", label: "OT Trainer", icon: Brain },
  { key: "bill-print", label: "Bill Print", icon: Printer },
  { key: "neurological-exam", label: "Neurological Exam", icon: Brain },
];

export default function PatientDetails() {
  const { id, submodule } = useParams();
  const navigate = useNavigate();

  const patient = useMemo(
    () => admittedPatients.find((item) => item.id === id) ?? admittedPatients[0],
    [id]
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-[1600px] px-4 py-4">
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex justify-end px-6 pt-5">
            <Button variant="outline" size="sm" onClick={() => navigate("/doctor/ipd")}>Back To Search</Button>
          </div>
          <div className="border-b border-slate-200 px-6 py-5 text-sm text-slate-800">
            <div className="grid gap-4 text-slate-700 sm:grid-cols-2">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3 text-slate-700">
                  <span className="uppercase tracking-[0.18em] text-[10px]">Patient Name :</span>
                  <span className="font-semibold text-slate-900">{patient.name}</span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-slate-700">
                  <span className="uppercase tracking-[0.18em] text-[10px]">Billing Doctor :</span>
                  <span className="font-semibold text-slate-900">{patient.billingDoctor}</span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-slate-700">
                  <span className="uppercase tracking-[0.18em] text-[10px]">Treatment Team :</span>
                  <span className="font-semibold text-slate-900">{patient.treatmentTeam}</span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-slate-700">
                  <span className="uppercase tracking-[0.18em] text-[10px]">Admit Date :</span>
                  <span className="font-semibold text-slate-900">{patient.admissionDate}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3 text-slate-700">
                  <span className="uppercase tracking-[0.18em] text-[10px]">Gender :</span>
                  <span className="font-semibold text-slate-900">{patient.gender}</span>
                  <span className="uppercase tracking-[0.18em] text-[10px] ml-2">Age :</span>
                  <span className="font-semibold text-slate-900">{patient.age}.0 YRS</span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-slate-700">
                  <span className="uppercase tracking-[0.18em] text-[10px]">UHID :</span>
                  <span className="font-semibold text-slate-900">{patient.uhid}</span>
                  <span className="uppercase tracking-[0.18em] text-[10px] ml-2">IPD No :</span>
                  <span className="font-semibold text-slate-900">{patient.pid}</span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-slate-700">
                  <span className="uppercase tracking-[0.18em] text-[10px]">Panel :</span>
                  <span className="font-semibold text-slate-900">{patient.panel}</span>
                  <span className="uppercase tracking-[0.18em] text-[10px] ml-2">Pat. Code :</span>
                  <span className="font-semibold text-slate-900">{patient.patientCode}</span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-slate-700">
                  <span className="uppercase tracking-[0.18em] text-[10px]">Ward :</span>
                  <span className="font-semibold text-slate-900">{patient.ward}</span>
                  <span className="uppercase tracking-[0.18em] text-[10px] ml-2">Id Proof :</span>
                  <span className="font-semibold text-slate-900">{patient.idProof}</span>
                </div>
              </div>
            </div>
          </div>

        </section>

        <div className="grid gap-4 xl:grid-cols-[1.85fr_300px] mt-4 items-start">
          <main className="space-y-4">
            <section className="min-h-[60vh] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col h-full">
                <div className="px-6 py-4">
                  <div className="mb-3 text-[10px] uppercase tracking-[0.3em] text-slate-500">WORK AREA</div>
                </div>
                <div className="flex-1 px-6 pb-6">
                  <div className="h-full rounded-2xl border border-dashed border-slate-200 bg-white p-4 text-sm text-slate-700 overflow-auto">
                    <Outlet />
                  </div>
                </div>
              </div>
            </section>
          </main>

          <aside className="space-y-4">
            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm sticky top-6">
              <div className="border-b border-slate-200 px-4 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-slate-600">
                Patient Vitals
              </div>
              <div className="space-y-3 p-4 text-sm text-slate-800 max-h-[60vh] overflow-auto">
                {Object.entries(patient.vitals ?? {}).map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
                    <span className="text-slate-500 capitalize">{label.replace(/([A-Z])/g, " $1")}</span>
                    <span className="font-semibold text-slate-900">{value}</span>
                  </div>
                ))}
              </div>
            </section>
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sticky top-[420px]">
              <Button className="mb-3 w-full">Outstanding</Button>
              <Button variant="outline" className="w-full">Set Co-Payment</Button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
