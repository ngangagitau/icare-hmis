import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  CreditCard,
  FileText,
  FlaskConical,
  IdCard,
  Info,
  Mail,
  MapPin,
  Phone,
  Pill,
  RotateCcw,
  Shield,
  ShieldCheck,
  Stethoscope,
  User,
  UserCheck,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { useCreatePatient } from "@/hooks/usePatients";
import { addToQueue, SERVICE_TO_DEPARTMENT, type QueueDepartment, type QueuePriority } from "@/lib/queueService";

const services = [
  {
    id: "triage",
    label: "Triage & Vitals Assessment",
    dept: "Triage",
    duration: "10 min",
    icon: Activity,
    badge: "Recommended First",
  },
  {
    id: "outpatient",
    label: "Outpatient Consultation (OPD)",
    dept: "Outpatient",
    duration: "25 min",
    icon: Stethoscope,
    badge: "General Doctor",
  },
  {
    id: "doctor",
    label: "Specialist Physician",
    dept: "Doctor",
    duration: "30 min",
    icon: UserCheck,
    badge: "Direct Specialist",
  },
  {
    id: "lab",
    label: "Laboratory Diagnostics",
    dept: "Laboratory",
    duration: "15 min",
    icon: FlaskConical,
    badge: "Tests & Panels",
  },
  {
    id: "pharmacy",
    label: "Pharmacy Dispensation",
    dept: "Pharmacy",
    duration: "10 min",
    icon: Pill,
    badge: "Prescription",
  },
  {
    id: "radiology",
    label: "Radiology & Imaging",
    dept: "Radiology",
    duration: "40 min",
    icon: FileText,
    badge: "X-Ray / Ultrasound",
  },
];

export default function Register() {
  const navigate = useNavigate();
  const createPatientMutation = useCreatePatient();

  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    dob: "",
    gender: "",
    maritalStatus: "",
    nationality: "Kenya",
    idNumber: "",
    phone: "",
    email: "",
    occupation: "",
    bloodType: "",
    height: "",
    weight: "",
    address: "",
    county: "",
    town: "",
    paymentMode: "cash",
    insuranceProvider: "",
    insuranceMemberNumber: "",
    employer: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    relationship: "",
    allergies: "",
    medicalHistory: "",
    currentMedications: "",
  });

  const [activeTab, setActiveTab] = useState<"demographics" | "contact" | "billing">("demographics");
  const [viewMode, setViewMode] = useState<"stepper" | "all">("stepper");
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [selectedService, setSelectedService] = useState<string | null>("triage");
  const [queuePriority, setQueuePriority] = useState<QueuePriority>("Normal");
  const [chiefComplaint, setChiefComplaint] = useState("");
  const [registeredPatient, setRegisteredPatient] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Helper calculation: dynamic age from date of birth
  const calculatedAge = useMemo(() => {
    if (!formData.dob) return null;
    const birthDate = new Date(formData.dob);
    if (isNaN(birthDate.getTime())) return null;
    const today = new Date();
    let years = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      years--;
    }
    return years >= 0 ? `${years} yrs` : null;
  }, [formData.dob]);

  // Required field checks & progress
  const requiredFields = [
    { key: "firstName", label: "First Name", filled: Boolean(formData.firstName.trim()) },
    { key: "lastName", label: "Last Name", filled: Boolean(formData.lastName.trim()) },
    { key: "dob", label: "Date of Birth", filled: Boolean(formData.dob) },
    { key: "gender", label: "Gender", filled: Boolean(formData.gender) },
    { key: "idNumber", label: "National ID", filled: Boolean(formData.idNumber.trim()) },
    { key: "phone", label: "Phone Number", filled: Boolean(formData.phone.trim()) },
  ];

  const completedRequiredCount = requiredFields.filter((f) => f.filled).length;
  const progressPercent = Math.round((completedRequiredCount / requiredFields.length) * 100);

  const clearForm = () => {
    setFormData({
      firstName: "",
      middleName: "",
      lastName: "",
      dob: "",
      gender: "",
      maritalStatus: "",
      nationality: "Kenya",
      idNumber: "",
      phone: "",
      email: "",
      occupation: "",
      bloodType: "",
      height: "",
      weight: "",
      address: "",
      county: "",
      town: "",
      paymentMode: "cash",
      insuranceProvider: "",
      insuranceMemberNumber: "",
      employer: "",
      emergencyContactName: "",
      emergencyContactPhone: "",
      relationship: "",
      allergies: "",
      medicalHistory: "",
      currentMedications: "",
    });
    setSelectedService("triage");
    setActiveTab("demographics");
    toast.info("Registration form cleared");
  };

  const handleRegisterPatient = async () => {
    const missing = requiredFields.filter((f) => !f.filled).map((f) => f.label);
    if (missing.length > 0) {
      toast.error(`Please complete required fields: ${missing.join(", ")}`);
      if (!formData.firstName || !formData.lastName || !formData.dob || !formData.gender || !formData.idNumber) {
        setActiveTab("demographics");
      } else if (!formData.phone) {
        setActiveTab("contact");
      }
      return;
    }

    try {
      setIsLoading(true);

      const patientData = {
        firstName: formData.firstName.trim(),
        middleName: formData.middleName.trim(),
        lastName: formData.lastName.trim(),
        dateOfBirth: formData.dob,
        gender: formData.gender,
        maritalStatus: formData.maritalStatus,
        nationality: formData.nationality,
        idNumber: formData.idNumber.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        occupation: formData.occupation.trim(),
        bloodType: formData.bloodType,
        height: formData.height ? Number(formData.height) : null,
        weight: formData.weight ? Number(formData.weight) : null,
        address: {
          line: formData.address,
          town: formData.town,
          county: formData.county,
          country: formData.nationality || "Kenya",
        },
        insurance:
          formData.paymentMode === "insurance"
            ? {
                provider: formData.insuranceProvider || "Private Insurance",
                memberNumber: formData.insuranceMemberNumber,
                employer: formData.employer,
                paymentMode: formData.paymentMode,
              }
            : {
                provider: formData.paymentMode === "corporate" ? formData.employer || "Corporate" : "Cash / Self-Pay",
                paymentMode: formData.paymentMode || "cash",
              },
        allergies: formData.allergies ? formData.allergies.split(",").map((s) => s.trim()).filter(Boolean) : [],
        medicalHistory: formData.medicalHistory ? formData.medicalHistory.split(",").map((s) => s.trim()).filter(Boolean) : [],
        currentMedications: formData.currentMedications ? formData.currentMedications.split(",").map((s) => s.trim()).filter(Boolean) : [],
        emergencyContact: {
          name: formData.emergencyContactName,
          phone: formData.emergencyContactPhone,
          relationship: formData.relationship,
        },
      };

      const createdPatient = await createPatientMutation.mutateAsync(patientData);

      const newPatient = {
        _id: createdPatient._id || (createdPatient as any).id,
        patientId: createdPatient.patientId,
        name: `${formData.firstName} ${formData.middleName ? formData.middleName + " " : ""}${formData.lastName}`,
        idNo: formData.idNumber,
        phone: formData.phone,
        dob: formData.dob,
        gender: formData.gender,
        scheme:
          formData.paymentMode === "insurance"
            ? formData.insuranceProvider || "Insurance"
            : formData.paymentMode === "corporate"
            ? `Corporate (${formData.employer || "Corporate"})`
            : "Cash / Self-Pay",
        email: formData.email,
        bloodType: formData.bloodType,
      };

      setRegisteredPatient(newPatient);
      setShowBookingDialog(true);
      toast.success("Patient created successfully! Proceed with service routing.");
    } catch (error: any) {
      toast.error(error?.message || "Failed to register patient");
      console.error("Registration error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookService = async () => {
    if (!selectedService || !registeredPatient) return;

    try {
      setIsLoading(true);
      const service = services.find((s) => s.id === selectedService);
      const department = SERVICE_TO_DEPARTMENT[selectedService] || (selectedService as QueueDepartment);

      await addToQueue({
        patientId: registeredPatient._id,
        department: department as QueueDepartment,
        serviceName: service?.label,
        priority: queuePriority,
        complaint: chiefComplaint.trim(),
      });

      toast.success(`${registeredPatient.name} routed to ${service?.dept} (${queuePriority} Priority)`);

      clearForm();
      setShowBookingDialog(false);
      setRegisteredPatient(null);
      setChiefComplaint("");
    } catch (error: any) {
      toast.error(error?.message || "Failed to add patient to queue");
      console.error("Queue error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Steps configuration
  const steps = [
    { id: "demographics", label: "Demographics", icon: User, requiredRemaining: !formData.firstName || !formData.lastName || !formData.dob || !formData.gender || !formData.idNumber },
    { id: "contact", label: "Contact & Residence", icon: Phone, requiredRemaining: !formData.phone },
    { id: "billing", label: "Insurance & Billing", icon: CreditCard, requiredRemaining: false },
  ];

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Main Grid: Form Work Area (Left) + Real-time Patient ID Card Preview (Right) */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Left Column: Form & Stepper (8 cols on lg) */}
        <div className="space-y-6 lg:col-span-7 xl:col-span-8">
          {/* Mode Switcher & Tab Stepper */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-xl border border-border/70 bg-card p-2 shadow-xs">
            {/* Step Pills */}
            <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
              {steps.map((step, idx) => {
                const Icon = step.icon;
                const isActive = activeTab === step.id;
                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => setActiveTab(step.id as any)}
                    className={`group flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-muted-foreground/15 text-muted-foreground group-hover:bg-muted-foreground/25"
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <Icon className="h-3.5 w-3.5" />
                    <span>{step.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Stepper vs Express Toggle */}
            <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/40 p-1 shrink-0 self-end sm:self-center">
              <button
                type="button"
                onClick={() => setViewMode("stepper")}
                className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all ${
                  viewMode === "stepper" ? "bg-card shadow-xs text-foreground font-semibold" : "text-muted-foreground"
                }`}
              >
                Guided
              </button>
              <button
                type="button"
                onClick={() => setViewMode("all")}
                className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all ${
                  viewMode === "all" ? "bg-card shadow-xs text-foreground font-semibold" : "text-muted-foreground"
                }`}
              >
                Express (All)
              </button>
            </div>
          </div>

          {/* Form Content */}
          <div className="space-y-6">
            {/* SECTION 1: Demographics & Identity */}
            {(viewMode === "all" || activeTab === "demographics") && (
              <Card className="border-border/80 shadow-card transition-all hover:border-primary/30">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <User className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-heading">Patient Identity & Demographics</CardTitle>
                        <CardDescription className="text-xs">Primary personal legal details</CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs bg-muted/50">
                      Step 1 of 3
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5">
                  {/* Name Fields */}
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold flex items-center justify-between">
                        <span>First Name <span className="text-destructive">*</span></span>
                      </Label>
                      <Input
                        placeholder="e.g., Amina"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                        className="bg-background/50 focus:bg-background transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-muted-foreground">Middle Name</Label>
                      <Input
                        placeholder="e.g., Wanjiku"
                        value={formData.middleName}
                        onChange={(e) => handleInputChange("middleName", e.target.value)}
                        className="bg-background/50 focus:bg-background transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold flex items-center justify-between">
                        <span>Last Name <span className="text-destructive">*</span></span>
                      </Label>
                      <Input
                        placeholder="e.g., Kamau"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                        className="bg-background/50 focus:bg-background transition-all"
                      />
                    </div>
                  </div>

                  {/* DOB & Gender */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-semibold">
                          Date of Birth <span className="text-destructive">*</span>
                        </Label>
                        {calculatedAge && (
                          <span className="text-[11px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                            {calculatedAge}
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <Input
                          type="date"
                          value={formData.dob}
                          onChange={(e) => handleInputChange("dob", e.target.value)}
                          className="bg-background/50 focus:bg-background transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">
                        Gender <span className="text-destructive">*</span>
                      </Label>
                      <div className="grid grid-cols-3 gap-2">
                        {["Male", "Female", "Other"].map((g) => {
                          const isSelected = formData.gender === g;
                          return (
                            <button
                              key={g}
                              type="button"
                              onClick={() => handleInputChange("gender", g)}
                              className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg border text-xs font-medium transition-all ${
                                isSelected
                                  ? "border-primary bg-primary/10 text-primary shadow-xs font-semibold"
                                  : "border-border bg-background hover:bg-muted/50 text-muted-foreground"
                              }`}
                            >
                              <User className="h-3.5 w-3.5" />
                              {g}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Identification & Marital Status */}
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">
                        ID / Passport Number <span className="text-destructive">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          placeholder="National ID or Passport"
                          value={formData.idNumber}
                          onChange={(e) => handleInputChange("idNumber", e.target.value)}
                          className="bg-background/50 focus:bg-background transition-all font-mono"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">Marital Status</Label>
                      <Select
                        value={formData.maritalStatus}
                        onValueChange={(value) => handleInputChange("maritalStatus", value)}
                      >
                        <SelectTrigger className="bg-background/50">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Single">Single</SelectItem>
                          <SelectItem value="Married">Married</SelectItem>
                          <SelectItem value="Divorced">Divorced</SelectItem>
                          <SelectItem value="Widowed">Widowed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">Nationality</Label>
                      <Input
                        placeholder="Kenya"
                        value={formData.nationality}
                        onChange={(e) => handleInputChange("nationality", e.target.value)}
                        className="bg-background/50 focus:bg-background transition-all"
                      />
                    </div>
                  </div>

                  {/* Occupation */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">Occupation / Profession</Label>
                    <Input
                      placeholder="e.g., Teacher, Software Engineer, Business Owner"
                      value={formData.occupation}
                      onChange={(e) => handleInputChange("occupation", e.target.value)}
                      className="bg-background/50 focus:bg-background transition-all"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* SECTION 2: Contact, Location & Emergency */}
            {(viewMode === "all" || activeTab === "contact") && (
              <Card className="border-border/80 shadow-card transition-all hover:border-primary/30">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-info/10 text-info">
                        <Phone className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-heading">Contact & Physical Residence</CardTitle>
                        <CardDescription className="text-xs">Channels of communication & primary dwelling</CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs bg-muted/50">
                      Step 2 of 3
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">
                        Primary Phone Number <span className="text-destructive">*</span>
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="+254 7XX XXX XXX"
                          value={formData.phone}
                          onChange={(e) => handleInputChange("phone", e.target.value)}
                          className="pl-9 font-mono bg-background/50 focus:bg-background"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="email"
                          placeholder="patient@example.com"
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          className="pl-9 bg-background/50 focus:bg-background"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Physical Address */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Residential Street Address / Estate</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Textarea
                        rows={2}
                        placeholder="e.g., Kilimani Estate, Ring Road Apt 4C"
                        value={formData.address}
                        onChange={(e) => handleInputChange("address", e.target.value)}
                        className="pl-9 bg-background/50 focus:bg-background resize-none"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">County / Province</Label>
                      <Input
                        placeholder="e.g., Nairobi, Kiambu, Mombasa"
                        value={formData.county}
                        onChange={(e) => handleInputChange("county", e.target.value)}
                        className="bg-background/50 focus:bg-background"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">Town / Sub-county</Label>
                      <Input
                        placeholder="e.g., Westlands, Karen, Thika"
                        value={formData.town}
                        onChange={(e) => handleInputChange("town", e.target.value)}
                        className="bg-background/50 focus:bg-background"
                      />
                    </div>
                  </div>

                  <Separator className="my-2" />

                  {/* Emergency Contact Block */}
                  <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 space-y-3">
                    <div className="flex items-center gap-2 text-destructive font-semibold text-xs uppercase tracking-wider">
                      <AlertCircle className="h-4 w-4" />
                      Next of Kin / Emergency Contact
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium">Contact Full Name</Label>
                        <Input
                          placeholder="e.g., David Kamau"
                          value={formData.emergencyContactName}
                          onChange={(e) => handleInputChange("emergencyContactName", e.target.value)}
                          className="bg-background"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium">Contact Phone</Label>
                        <Input
                          placeholder="+254 7XX XXX XXX"
                          value={formData.emergencyContactPhone}
                          onChange={(e) => handleInputChange("emergencyContactPhone", e.target.value)}
                          className="bg-background font-mono"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium">Relationship</Label>
                        <Input
                          placeholder="e.g., Spouse, Parent, Sibling"
                          value={formData.relationship}
                          onChange={(e) => handleInputChange("relationship", e.target.value)}
                          className="bg-background"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* SECTION 3: Insurance & Payment Mode */}
            {(viewMode === "all" || activeTab === "billing") && (
              <Card className="border-border/80 shadow-card transition-all hover:border-primary/30">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-success/10 text-success">
                        <ShieldCheck className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-heading">Billing & Health Insurance Scheme</CardTitle>
                        <CardDescription className="text-xs">Financial guarantor and coverage verification</CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs bg-muted/50">
                      Step 3 of 3
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5">
                  {/* Payment Mode Visual Cards */}
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold">Payment Scheme</Label>
                    <div className="grid gap-3 sm:grid-cols-3">
                      {[
                        {
                          id: "cash",
                          label: "Cash / Self-Pay",
                          desc: "Direct M-Pesa, card, or cash payment",
                          icon: Wallet,
                        },
                        {
                          id: "insurance",
                          label: "Insurance (SHA / NHIF)",
                          desc: "Pre-authorized insurance coverage",
                          icon: ShieldCheck,
                        },
                        {
                          id: "corporate",
                          label: "Corporate Billing",
                          desc: "Employer direct invoice account",
                          icon: Building2,
                        },
                      ].map((mode) => {
                        const Icon = mode.icon;
                        const isSelected = formData.paymentMode === mode.id;
                        return (
                          <div
                            key={mode.id}
                            onClick={() => handleInputChange("paymentMode", mode.id)}
                            className={`cursor-pointer rounded-xl border p-3.5 transition-all flex flex-col justify-between gap-2 ${
                              isSelected
                                ? "border-primary bg-primary/5 ring-1 ring-primary shadow-xs"
                                : "border-border bg-background hover:bg-muted/40"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div
                                className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                                  isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                                }`}
                              >
                                <Icon className="h-4 w-4" />
                              </div>
                              {isSelected && <Check className="h-4 w-4 text-primary" />}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-foreground">{mode.label}</p>
                              <p className="text-[11px] text-muted-foreground mt-0.5">{mode.desc}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Conditional Insurance Fields */}
                  {formData.paymentMode === "insurance" && (
                    <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-4 animate-fade-in">
                      <div className="flex items-center gap-2 text-primary font-semibold text-xs uppercase tracking-wider">
                        <Shield className="h-4 w-4" />
                        Insurance Policy Details
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-medium">Insurance Provider</Label>
                          <Input
                            placeholder="e.g., SHA / NHIF, Jubilee, AAR, APA, CIC"
                            value={formData.insuranceProvider}
                            onChange={(e) => handleInputChange("insuranceProvider", e.target.value)}
                            className="bg-background"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs font-medium">Member / Policy Number</Label>
                          <Input
                            placeholder="e.g., SHA-982143-KE"
                            value={formData.insuranceMemberNumber}
                            onChange={(e) => handleInputChange("insuranceMemberNumber", e.target.value)}
                            className="bg-background font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Corporate or Employer Details */}
                  {(formData.paymentMode === "corporate" || formData.paymentMode === "insurance") && (
                    <div className="space-y-1.5 animate-fade-in">
                      <Label className="text-xs font-medium">Employer / Corporate Organization</Label>
                      <Input
                        placeholder="e.g., Safaricom PLC, Equity Group, Ministry of Health"
                        value={formData.employer}
                        onChange={(e) => handleInputChange("employer", e.target.value)}
                        className="bg-background/50 focus:bg-background"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

          </div>

          {/* Stepper Navigation Footer */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={clearForm}
              className="w-full sm:w-auto text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Clear Form
            </Button>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              {viewMode === "stepper" && activeTab !== "demographics" && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const order: Array<typeof activeTab> = ["demographics", "contact", "billing"];
                    const currentIdx = order.indexOf(activeTab);
                    if (currentIdx > 0) setActiveTab(order[currentIdx - 1]);
                  }}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>
              )}

              {viewMode === "stepper" && activeTab !== "billing" ? (
                <Button
                  type="button"
                  onClick={() => {
                    const order: Array<typeof activeTab> = ["demographics", "contact", "billing"];
                    const currentIdx = order.indexOf(activeTab);
                    if (currentIdx < order.length - 1) setActiveTab(order[currentIdx + 1]);
                  }}
                  className="bg-primary hover:bg-primary/90 shadow-sm"
                >
                  Next Step
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleRegisterPatient}
                  disabled={isLoading}
                  className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 shadow-md"
                >
                  {isLoading ? (
                    <>
                      <span className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Registering Patient...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Register & Book Queue
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Live Digital Patient ID Card Preview (5 cols on lg) */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-4 lg:sticky lg:top-6">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <IdCard className="h-4 w-4 text-primary" />
              Live Hospital ID Preview
            </span>
            <Badge variant="outline" className="text-[10px] bg-primary/5 text-primary border-primary/20">
              Auto-Syncing
            </Badge>
          </div>

          {/* Digital Patient ID Badge */}
          <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-br from-card via-card/95 to-muted/40 p-5 shadow-elevated transition-all">
            {/* Background Medical Cross Pattern */}
            <div className="absolute right-0 top-0 -mr-6 -mt-6 h-32 w-32 rounded-full bg-primary/5 blur-xl pointer-events-none" />

            {/* Header / Brand */}
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-xs">
                  +
                </div>
                <div>
                  <p className="text-[11px] font-extrabold tracking-tight text-foreground font-heading">ICARE CLINICAL HMIS</p>
                  <p className="text-[9px] text-muted-foreground font-mono">PATIENT INTAKE DOSSIER</p>
                </div>
              </div>
              <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] font-semibold">
                ACTIVE
              </Badge>
            </div>

            {/* Identity Banner */}
            <div className="mt-4 flex items-start gap-3.5">
              {/* Avatar Graphic */}
              <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary to-accent text-white font-heading font-bold text-xl shadow-sm ring-2 ring-primary/20">
                {formData.firstName ? formData.firstName.charAt(0).toUpperCase() : "?"}
                {formData.lastName ? formData.lastName.charAt(0).toUpperCase() : ""}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-base font-heading font-bold text-foreground truncate">
                  {formData.firstName || formData.lastName
                    ? `${formData.firstName} ${formData.middleName ? formData.middleName + " " : ""}${formData.lastName}`
                    : "Patient Full Name"}
                </h3>
                <p className="text-xs font-mono text-muted-foreground mt-0.5">
                  ID: {formData.idNumber || "Pending National ID"}
                </p>

                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  {calculatedAge && (
                    <Badge variant="secondary" className="text-[10px] px-2 py-0">
                      {calculatedAge}
                    </Badge>
                  )}
                  {formData.gender && (
                    <Badge variant="outline" className="text-[10px] px-2 py-0">
                      {formData.gender}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Key Data Cards inside ID */}
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-xl border border-border/60 bg-muted/40 p-2.5">
                <span className="text-[10px] text-muted-foreground uppercase font-semibold block">Phone</span>
                <span className="font-mono text-foreground font-medium truncate block mt-0.5">
                  {formData.phone || "Not recorded"}
                </span>
              </div>

              <div className="rounded-xl border border-border/60 bg-muted/40 p-2.5">
                <span className="text-[10px] text-muted-foreground uppercase font-semibold block">Coverage</span>
                <span className="text-foreground font-medium truncate block mt-0.5">
                  {formData.paymentMode === "insurance"
                    ? formData.insuranceProvider || "Insurance"
                    : formData.paymentMode === "corporate"
                    ? formData.employer || "Corporate"
                    : "Cash / Self-Pay"}
                </span>
              </div>
            </div>

            {/* Simulated Barcode & Chip */}
            <div className="mt-4 pt-3 border-t border-dashed border-border flex items-center justify-between">
              <div className="flex flex-col">
                <div className="h-5 flex items-center gap-0.5 opacity-70">
                  <div className="w-1 h-full bg-foreground" />
                  <div className="w-0.5 h-full bg-foreground" />
                  <div className="w-2 h-full bg-foreground" />
                  <div className="w-1 h-full bg-foreground" />
                  <div className="w-0.5 h-full bg-foreground" />
                  <div className="w-1.5 h-full bg-foreground" />
                  <div className="w-0.5 h-full bg-foreground" />
                  <div className="w-2 h-full bg-foreground" />
                </div>
                <span className="text-[9px] font-mono text-muted-foreground mt-1">
                  SYS-{formData.idNumber ? formData.idNumber.slice(0, 6) : "NEW-REG"}
                </span>
              </div>

              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                <span>Verified Intake</span>
              </div>
            </div>
          </div>

          {/* Quick Intake Guidelines Card */}
          <div className="rounded-xl border border-border bg-card p-4 space-y-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5 text-foreground font-semibold">
              <Info className="h-4 w-4 text-primary" />
              Reception Protocol
            </div>
            <p className="text-[11px] leading-relaxed">
              Verify legal government identity before assigning insurance cover. All newly registered patients default to Triage for initial blood pressure & temperature logging.
            </p>
          </div>
        </div>
      </div>

      {/* Upgraded Post-Registration Service Booking Modal */}
      <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto border-border/80 shadow-elevated">
          <DialogHeader className="space-y-2">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-semibold uppercase tracking-wider">
              <CheckCircle2 className="h-4 w-4" />
              Patient Successfully Registered
            </div>
            <DialogTitle className="text-xl font-heading font-bold">Route Patient to Service Queue</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Assign an immediate service point to dispatch the patient to the relevant department ledger.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-1">
            {/* Patient Summary Header */}
            <div className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold text-base shadow-xs">
                {registeredPatient?.name?.charAt(0) || "P"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-heading font-bold text-sm text-foreground truncate">{registeredPatient?.name}</p>
                <p className="text-xs text-muted-foreground font-mono mt-0.5">
                  ID: {registeredPatient?.idNo} • {registeredPatient?.scheme}
                </p>
              </div>
            </div>

            {/* Selectable Service Points */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Target Service Station</Label>
              <div className="grid grid-cols-2 gap-2">
                {services.map((service) => {
                  const Icon = service.icon;
                  const isSelected = selectedService === service.id;
                  return (
                    <div
                      key={service.id}
                      onClick={() => setSelectedService(service.id)}
                      className={`cursor-pointer rounded-xl border p-3 transition-all flex flex-col justify-between gap-2 ${
                        isSelected
                          ? "border-primary bg-primary/5 ring-1 ring-primary shadow-xs"
                          : "border-border bg-background hover:bg-muted/40"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div
                          className={`flex h-6 w-6 items-center justify-center rounded-lg ${
                            isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                          }`}
                        >
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                        <span className="text-[10px] font-mono text-muted-foreground">{service.duration}</span>
                      </div>

                      <div>
                        <p className="text-[11px] font-bold text-foreground line-clamp-1">{service.label}</p>
                        <span className="text-[10px] text-primary font-medium">{service.badge}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Queue Priority Selector */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Queue Priority</Label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { level: "Normal", color: "border-border" },
                  { level: "Urgent", color: "border-amber-500 text-amber-600" },
                  { level: "Emergency", color: "border-rose-500 text-rose-600" },
                ].map(({ level }) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setQueuePriority(level as QueuePriority)}
                    className={`py-1.5 px-3 rounded-lg border text-xs font-medium transition-all ${
                      queuePriority === level
                        ? "bg-foreground text-background font-bold shadow-xs"
                        : "bg-background text-muted-foreground hover:bg-muted/50 border-border"
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Chief Complaint / Notes */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Chief Complaint / Initial Remark (Optional)</Label>
              <Input
                placeholder="e.g., Acute migraine for 2 days, follow-up check..."
                value={chiefComplaint}
                onChange={(e) => setChiefComplaint(e.target.value)}
                className="bg-background text-xs"
              />
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2 sm:justify-between items-center pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowBookingDialog(false);
                setRegisteredPatient(null);
                clearForm();
              }}
              className="text-xs w-full sm:w-auto"
            >
              Skip Queue Booking
            </Button>
            <Button
              type="button"
              onClick={handleBookService}
              disabled={!selectedService || isLoading}
              className="text-xs w-full sm:w-auto bg-primary hover:bg-primary/90 font-semibold"
            >
              <CheckCircle2 className="mr-1.5 h-4 w-4" />
              Confirm & Dispatch to Queue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
