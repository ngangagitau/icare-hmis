import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  Brain,
  ChevronLeft,
  ChevronRight,
  Eye,
  Mail,
  Phone,
  RefreshCw,
  Search,
  ShieldCheck,
  UserPlus,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePatients, useSearchPatients } from "@/hooks/usePatients";
import type { Patient } from "@/lib/patientService";
import { PatientMetricCard, PatientPageHeader } from "@/components/patients/PatientPageChrome";

const statusStyle: Record<string, string> = {
  Active: "bg-success/10 text-success border-success/20",
  Inactive: "bg-muted text-muted-foreground border-border",
  Deceased: "bg-destructive/10 text-destructive border-destructive/20",
};

const getAge = (dateOfBirth?: string) => {
  if (!dateOfBirth) return "-";
  const birthDate = new Date(dateOfBirth);
  if (Number.isNaN(birthDate.getTime())) return "-";
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const birthdayPassed =
    today.getMonth() > birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate());
  if (!birthdayPassed) age -= 1;
  return `${Math.max(age, 0)}y`;
};

const formatDate = (date?: string) =>
  date
    ? new Intl.DateTimeFormat(undefined, {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(new Date(date))
    : "Not recorded";

const getCoverage = (insurance: Patient["insurance"]) => {
  if (!insurance) return "Cash / self-pay";
  if (typeof insurance === "string") return insurance || "Cash / self-pay";
  return insurance.provider || "Cash / self-pay";
};

const PatientRegistry = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const hasSearch = search.trim().length >= 2;
  const patientsQuery = usePatients(page, 25);
  const searchQuery = useSearchPatients(search.trim());
  const patients = hasSearch ? searchQuery.data ?? [] : patientsQuery.data?.data ?? [];
  const filteredPatients = status === "all" ? patients : patients.filter((patient) => patient.status === status);
  const pagination = patientsQuery.data?.pagination;
  const isLoading = hasSearch ? searchQuery.isLoading : patientsQuery.isLoading;
  const error = hasSearch ? searchQuery.error : patientsQuery.error;
  const activeCount = patients.filter((patient) => (patient.status || "Active") === "Active").length;

  const summaryStats = [
    {
      label: "Registered patients",
      value: String(pagination?.totalPatients ?? patients.length),
      note: "All active records",
      icon: Users,
      tone: "cyan" as const,
    },
    {
      label: "Active patients",
      value: String(activeCount),
      note: "Currently active",
      icon: ShieldCheck,
      tone: "emerald" as const,
    },
    {
      label: "Results shown",
      value: String(filteredPatients.length),
      note: "Current filter view",
      icon: Activity,
      tone: "blue" as const,
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PatientPageHeader
        title="All Patients"
        icon={Users}
      >
        <Button className="gap-2" onClick={() => navigate("/patients/register")}>
          <UserPlus className="h-4 w-4" />
          Register patient
        </Button>
      </PatientPageHeader>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {summaryStats.map((metric) => (
          <PatientMetricCard key={metric.label} {...metric} />
        ))}
      </div>

      <Card className="border-border shadow-card">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Search name, patient ID, national ID, phone, or email"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
              />
            </div>

            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-full lg:w-44">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
                <SelectItem value="Deceased">Deceased</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="icon"
              onClick={() => (hasSearch ? searchQuery.refetch() : patientsQuery.refetch())}
              aria-label="Refresh patients"
            >
              <RefreshCw className={`h-4 w-4 ${(hasSearch ? searchQuery.isFetching : patientsQuery.isFetching) ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading && <p className="py-12 text-center text-sm text-muted-foreground">Loading patient registry...</p>}
          {error && <p className="py-12 text-center text-sm text-destructive">Unable to load patients. Check the connection and try again.</p>}

          {!isLoading && !error && (
            <>
              <div className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm">
                <Table className="min-w-[760px]">
                  <TableHeader className="bg-muted/50 [&_tr]:border-border/70">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="h-10 text-[11px] font-semibold uppercase text-muted-foreground">Patient</TableHead>
                      <TableHead className="hidden h-10 text-[11px] font-semibold uppercase text-muted-foreground md:table-cell">Contact</TableHead>
                      <TableHead className="hidden h-10 text-[11px] font-semibold uppercase text-muted-foreground lg:table-cell">Identifier</TableHead>
                      <TableHead className="h-10 text-[11px] font-semibold uppercase text-muted-foreground">Coverage</TableHead>
                      <TableHead className="h-10 text-[11px] font-semibold uppercase text-muted-foreground">Status</TableHead>
                      <TableHead className="h-10 text-right text-[11px] font-semibold uppercase text-muted-foreground">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPatients.map((patient) => {
                      const name = `${patient.firstName} ${patient.lastName}`.trim();
                      const initials = name
                        .split(" ")
                        .map((part) => part[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase();
                      const patientStatus = patient.status || "Active";

                      return (
                        <TableRow key={patient._id || patient.patientId} className="border-border/60 transition-colors hover:bg-cyan-500/[0.04]">
                          <TableCell className="py-3">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                                {initials}
                              </div>
                              <div>
                                <p className="font-medium text-foreground">{name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {patient.patientId || "No record ID"} · {getAge(patient.dateOfBirth)} · {patient.gender || "Not recorded"}
                                </p>
                              </div>
                            </div>
                          </TableCell>

                          <TableCell className="hidden py-3 md:table-cell">
                            <div className="space-y-1 text-xs text-muted-foreground">
                              <p className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {patient.phone || "Not recorded"}
                              </p>
                              {patient.email && (
                                <p className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  {patient.email}
                                </p>
                              )}
                            </div>
                          </TableCell>

                          <TableCell className="hidden py-3 text-xs text-muted-foreground lg:table-cell">
                            {patient.idNumber || "Not recorded"}
                          </TableCell>

                          <TableCell className="py-3">
                            <Badge variant="outline" className="text-xs">
                              {getCoverage(patient.insurance)}
                            </Badge>
                          </TableCell>

                          <TableCell className="py-3">
                            <Badge variant="outline" className={`text-[11px] ${statusStyle[patientStatus] || "bg-muted text-foreground border-border"}`}>
                              {patientStatus}
                            </Badge>
                          </TableCell>

                          <TableCell className="py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="sm" className="gap-1" onClick={() => setSelectedPatient(patient)}>
                                <Eye className="h-4 w-4" />
                                View
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="gap-1 text-violet-600 hover:bg-violet-50 hover:text-violet-700"
                                onClick={() => navigate(`/clinical-intelligence?patient=${patient.patientId || patient._id}`)}
                                title="Clinical Intelligence"
                              >
                                <Brain className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}

                    {filteredPatients.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                          No patients match the current search and filters.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {!hasSearch && pagination && (
                <div className="mt-4 flex items-center justify-between border-t border-border pt-4 text-sm text-muted-foreground">
                  <span>
                    Page {pagination.currentPage} of {Math.max(pagination.totalPages, 1)}
                  </span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled={!pagination.hasPrev} onClick={() => setPage((current) => current - 1)}>
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <Button variant="outline" size="sm" disabled={!pagination.hasNext} onClick={() => setPage((current) => current + 1)}>
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedPatient} onOpenChange={(open) => !open && setSelectedPatient(null)}>
        <DialogContent>
          {selectedPatient && (
            <>
              <DialogHeader>
                <DialogTitle>
                  {selectedPatient.firstName} {selectedPatient.lastName}
                </DialogTitle>
                <DialogDescription>Patient profile and registration details</DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Patient ID</p>
                  <p className="font-medium">{selectedPatient.patientId || "Not recorded"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">National ID</p>
                  <p className="font-medium">{selectedPatient.idNumber || "Not recorded"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Date of birth</p>
                  <p className="font-medium">
                    {formatDate(selectedPatient.dateOfBirth)} ({getAge(selectedPatient.dateOfBirth)})
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Gender</p>
                  <p className="font-medium">{selectedPatient.gender || "Not recorded"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Phone</p>
                  <p className="font-medium">{selectedPatient.phone || "Not recorded"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Coverage</p>
                  <p className="font-medium">{getCoverage(selectedPatient.insurance)}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground">Registered</p>
                  <p className="font-medium">{formatDate(selectedPatient.createdAt)}</p>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => navigate(`/patients/search?query=${encodeURIComponent(selectedPatient.patientId || selectedPatient.firstName)}`)}>
                  Find patient for queue
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PatientRegistry;