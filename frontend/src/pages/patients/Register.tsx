import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useCreatePatient } from "@/hooks/usePatients";
import { addToQueue, SERVICE_TO_DEPARTMENT, type QueueDepartment } from "@/lib/queueService";

const services = [
  { id: "outpatient", label: "Outpatient Consultation", dept: "Outpatient", duration: "30 min" },
  { id: "lab", label: "Laboratory Test", dept: "Laboratory", duration: "15 min" },
  { id: "pharmacy", label: "Pharmacy Collection", dept: "Pharmacy", duration: "10 min" },
  { id: "radiology", label: "Radiology Scan", dept: "Radiology", duration: "45 min" },
  { id: "doctor", label: "Doctor Consultation", dept: "Doctor", duration: "20 min" },
  { id: "triage", label: "Triage Nursing", dept: "Triage", duration: "10 min" },
];

export default function Register() {
  const navigate = useNavigate();
  const createPatientMutation = useCreatePatient();
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dob: "",
    gender: "",
    idNumber: "",
    phone: "",
    email: "",
    address: "",
    paymentMode: "",
    insuranceProvider: "",
    insuranceMemberNumber: "",
    employer: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    relationship: "",
    allergies: "",
  });

  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [registeredPatient, setRegisteredPatient] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const clearForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      dob: "",
      gender: "",
      idNumber: "",
      phone: "",
      email: "",
      address: "",
      paymentMode: "",
      insuranceProvider: "",
      insuranceMemberNumber: "",
      employer: "",
      emergencyContactName: "",
      emergencyContactPhone: "",
      relationship: "",
      allergies: "",
    });
    setSelectedService(null);
  };

  const handleRegisterPatient = async () => {
    if (!formData.firstName || !formData.lastName || !formData.dob || !formData.gender || !formData.idNumber || !formData.phone) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setIsLoading(true);
      const patientData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth: formData.dob,
        gender: formData.gender,
        idNumber: formData.idNumber,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        insurance: formData.insuranceProvider,
        allergies: formData.allergies,
        emergencyContact: formData.emergencyContactName,
      };

      const createdPatient = await createPatientMutation.mutateAsync(patientData);
      
      const newPatient = {
        _id: createdPatient._id || createdPatient.id,
        name: `${formData.firstName} ${formData.lastName}`,
        idNo: formData.idNumber,
        phone: formData.phone,
        dob: formData.dob,
        gender: formData.gender,
        scheme: formData.paymentMode === "insurance" ? (formData.insuranceProvider || "Insurance") : formData.paymentMode,
        email: formData.email,
      };

      setRegisteredPatient(newPatient);
      setShowBookingDialog(true);
      toast.success("Patient registered successfully! Now book a service.");
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
      const service = services.find(s => s.id === selectedService);
      const department = SERVICE_TO_DEPARTMENT[selectedService] || selectedService;
      
      await addToQueue({
        patientId: registeredPatient._id,
        department: department as QueueDepartment,
        serviceName: service?.label,
        complaint: "",
      });

      toast.success(`${registeredPatient.name} added to ${service?.dept} queue`);
      
      clearForm();
      setShowBookingDialog(false);
      setRegisteredPatient(null);
    } catch (error: any) {
      toast.error(error?.message || "Failed to add patient to queue");
      console.error("Queue error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">New Patient Registration</h1>
        <p className="text-muted-foreground text-sm">Register a new patient into the system</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Personal Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name *</Label>
                <Input 
                  placeholder="First name" 
                  value={formData.firstName}
                  onChange={e => handleInputChange("firstName", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Last Name *</Label>
                <Input 
                  placeholder="Last name"
                  value={formData.lastName}
                  onChange={e => handleInputChange("lastName", e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date of Birth *</Label>
                <Input 
                  type="date"
                  value={formData.dob}
                  onChange={e => handleInputChange("dob", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Gender *</Label>
                <Select value={formData.gender} onValueChange={value => handleInputChange("gender", value)}>
                  <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>ID / Passport Number *</Label>
                <Input 
                  placeholder="National ID"
                  value={formData.idNumber}
                  onChange={e => handleInputChange("idNumber", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Phone Number *</Label>
                <Input 
                  placeholder="+254..."
                  value={formData.phone}
                  onChange={e => handleInputChange("phone", e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input 
                type="email" 
                placeholder="email@example.com"
                value={formData.email}
                onChange={e => handleInputChange("email", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Physical Address</Label>
              <Textarea 
                placeholder="Residential address"
                value={formData.address}
                onChange={e => handleInputChange("address", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Insurance & Emergency</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Payment Mode</Label>
              <Select value={formData.paymentMode} onValueChange={value => handleInputChange("paymentMode", value)}>
                <SelectTrigger><SelectValue placeholder="Select payment mode" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="insurance">Insurance</SelectItem>
                  <SelectItem value="corporate">Corporate</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Insurance Provider</Label>
              <Input 
                placeholder="e.g., NHIF, AAR, Jubilee"
                value={formData.insuranceProvider}
                onChange={e => handleInputChange("insuranceProvider", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Insurance Member Number</Label>
              <Input 
                placeholder="Member number"
                value={formData.insuranceMemberNumber}
                onChange={e => handleInputChange("insuranceMemberNumber", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Employer</Label>
              <Input 
                placeholder="Employer name"
                value={formData.employer}
                onChange={e => handleInputChange("employer", e.target.value)}
              />
            </div>
            <hr className="my-2" />
            <div className="space-y-2">
              <Label>Emergency Contact Name</Label>
              <Input 
                placeholder="Contact name"
                value={formData.emergencyContactName}
                onChange={e => handleInputChange("emergencyContactName", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Contact Phone</Label>
                <Input 
                  placeholder="+254..."
                  value={formData.emergencyContactPhone}
                  onChange={e => handleInputChange("emergencyContactPhone", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Relationship</Label>
                <Input 
                  placeholder="e.g., Spouse"
                  value={formData.relationship}
                  onChange={e => handleInputChange("relationship", e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Allergies / Notes</Label>
              <Textarea 
                placeholder="Known allergies or notes"
                value={formData.allergies}
                onChange={e => handleInputChange("allergies", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="flex gap-3 justify-end">
        <Button variant="outline" onClick={clearForm}>Clear Form</Button>
        <Button onClick={handleRegisterPatient}>Register Patient</Button>
      </div>

      {/* Book Service Dialog */}
      <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Book a Service</DialogTitle>
            <DialogDescription>
              Select a service for the newly registered patient
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="p-3 rounded-lg bg-success/10 border border-success/20 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Patient Registered</p>
                <p className="font-semibold text-sm">{registeredPatient?.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{registeredPatient?.id} • {registeredPatient?.scheme}</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Select Service</label>
              <Select value={selectedService || ""} onValueChange={setSelectedService}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a service..." />
                </SelectTrigger>
                <SelectContent>
                  {services.map(service => (
                    <SelectItem key={service.id} value={service.id}>
                      <div className="flex flex-col">
                        <span>{service.label}</span>
                        <span className="text-xs text-muted-foreground">{service.dept} • {service.duration}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedService && (
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-xs text-muted-foreground">Service Details</p>
                <p className="font-semibold text-sm mt-1">
                  {services.find(s => s.id === selectedService)?.label}
                </p>
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <span>{services.find(s => s.id === selectedService)?.dept}</span>
                  <span className="text-primary font-medium">{services.find(s => s.id === selectedService)?.duration}</span>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowBookingDialog(false);
                setRegisteredPatient(null);
              }}
            >
              Skip
            </Button>
            <Button
              onClick={handleBookService}
              disabled={!selectedService}
              className="gap-2"
            >
              <CheckCircle2 className="h-4 w-4" />
              Add to Queue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
