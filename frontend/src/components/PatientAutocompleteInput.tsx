import React, { useState, useEffect, useRef, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, X, Check, User, Phone, ShieldCheck, Loader2 } from "lucide-react";
import { usePatients, useSearchPatients } from "@/hooks/usePatients";
import { type Patient, getPatientRecordId } from "@/lib/patientService";
import { cn } from "@/lib/utils";

interface PatientAutocompleteInputProps {
  value: string;
  onChange: (patientId: string, patient?: Patient | null) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  autoFocus?: boolean;
}

export function PatientAutocompleteInput({
  value,
  onChange,
  placeholder = "Type patient name, MRN/OPD number, or phone...",
  disabled = false,
  className,
  autoFocus = false,
}: PatientAutocompleteInputProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch initial list of patients
  const { data: patientsData, isLoading: initialLoading } = usePatients(1, 100);
  const allPatients = useMemo(() => patientsData?.data || [], [patientsData]);

  // Debounced search for API search
  const [debouncedQuery, setDebouncedQuery] = useState("");
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchTerm.trim());
    }, 200);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const { data: searchedPatients, isFetching: searchLoading } = useSearchPatients(
    debouncedQuery.length >= 2 ? debouncedQuery : ""
  );

  // Find currently selected patient object
  const selectedPatient = useMemo(() => {
    if (!value) return null;
    return allPatients.find(
      (p) => getPatientRecordId(p) === value || p.id === value || p._id === value || p.patientId === value
    ) || null;
  }, [value, allPatients]);

  // Combined matching results: Filter from cached allPatients + searchedPatients
  const matchingPatients = useMemo(() => {
    if (!searchTerm.trim()) {
      return [];
    }

    const term = searchTerm.toLowerCase().trim();
    const map = new Map<string, Patient>();

    // 1. Check loaded patients
    allPatients.forEach((p) => {
      const id = getPatientRecordId(p);
      if (!id) return;
      const fullName = `${p.firstName || ""} ${p.lastName || ""}`.toLowerCase();
      const pId = String(p.patientId || "").toLowerCase();
      const phone = String(p.phone || "").toLowerCase();
      const idNo = String(p.idNumber || "").toLowerCase();

      if (fullName.includes(term) || pId.includes(term) || phone.includes(term) || idNo.includes(term)) {
        map.set(id, p);
      }
    });

    // 2. Add any from server search
    if (Array.isArray(searchedPatients)) {
      searchedPatients.forEach((p) => {
        const id = getPatientRecordId(p);
        if (id) map.set(id, p);
      });
    }

    return Array.from(map.values()).slice(0, 10);
  }, [searchTerm, allPatients, searchedPatients]);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleSelect = (patient: Patient) => {
    const id = getPatientRecordId(patient) || patient.id || patient.patientId || "";
    onChange(id, patient);
    setSearchTerm("");
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange("", null);
    setSearchTerm("");
    setIsOpen(false);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  // If a patient is selected, display the selected chip
  if (value && selectedPatient) {
    const insuranceProvider =
      typeof selectedPatient.insurance === "object"
        ? selectedPatient.insurance?.provider
        : selectedPatient.insurance;

    return (
      <div
        className={cn(
          "flex items-center justify-between p-2.5 rounded-lg border border-primary/40 bg-primary/5 text-xs transition-all",
          className
        )}
      >
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
            <User className="h-4 w-4" />
          </div>
          <div className="truncate">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-semibold text-foreground text-sm">
                {selectedPatient.firstName} {selectedPatient.lastName}
              </span>
              <Badge variant="outline" className="text-[10px] font-mono px-1.5 py-0 bg-background">
                {selectedPatient.patientId || "OPD"}
              </Badge>
              {insuranceProvider && (
                <Badge variant="outline" className="text-[10px] text-blue-600 bg-blue-500/10 border-blue-500/20 px-1.5 py-0 flex items-center gap-0.5">
                  <ShieldCheck className="h-2.5 w-2.5" />
                  {insuranceProvider}
                </Badge>
              )}
            </div>
            <div className="text-[11px] text-muted-foreground flex items-center gap-2 mt-0.5">
              <span>{selectedPatient.gender || "Patient"}</span>
              {selectedPatient.phone && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-0.5">
                    <Phone className="h-2.5 w-2.5" />
                    {selectedPatient.phone}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {!disabled && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground shrink-0 rounded-full"
            title="Change Patient"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
        <Input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            if (searchTerm.trim()) setIsOpen(true);
          }}
          placeholder={placeholder}
          disabled={disabled}
          autoFocus={autoFocus}
          className="pl-8 pr-8 h-9 text-xs"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => {
              setSearchTerm("");
              setIsOpen(false);
            }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
        {searchLoading && (
          <Loader2 className="absolute right-8 top-1/2 -translate-y-1/2 h-3.5 w-3.5 animate-spin text-muted-foreground" />
        )}
      </div>

      {/* Autopopulated Suggestions Dropdown */}
      {isOpen && searchTerm.trim().length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-popover text-popover-foreground shadow-lg outline-none animate-in fade-in-0 zoom-in-95 max-h-60 overflow-y-auto">
          {matchingPatients.length === 0 ? (
            <div className="py-4 px-3 text-center text-xs text-muted-foreground">
              {searchLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                  <span>Searching patient records...</span>
                </div>
              ) : (
                <p>No patients found matching "{searchTerm}".</p>
              )}
            </div>
          ) : (
            <div className="p-1">
              <div className="px-2 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Matching Patients ({matchingPatients.length})
              </div>
              {matchingPatients.map((p) => {
                const id = getPatientRecordId(p);
                const insuranceProvider =
                  typeof p.insurance === "object" ? p.insurance?.provider : p.insurance;

                return (
                  <div
                    key={id}
                    onClick={() => handleSelect(p)}
                    className="flex items-center justify-between px-2.5 py-2 rounded-sm cursor-pointer hover:bg-accent hover:text-accent-foreground text-xs transition-colors"
                  >
                    <div className="overflow-hidden">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold text-foreground">
                          {p.firstName} {p.lastName}
                        </span>
                        <Badge variant="outline" className="text-[10px] font-mono px-1 py-0">
                          {p.patientId || "OPD"}
                        </Badge>
                        {insuranceProvider && (
                          <Badge
                            variant="outline"
                            className="text-[10px] text-blue-600 bg-blue-500/10 border-blue-500/20 px-1 py-0"
                          >
                            {insuranceProvider}
                          </Badge>
                        )}
                      </div>
                      <div className="text-[11px] text-muted-foreground flex items-center gap-2 mt-0.5">
                        <span>{p.gender || "Patient"}</span>
                        {p.phone && <span>• Phone: {p.phone}</span>}
                        {p.idNumber && <span>• ID: {p.idNumber}</span>}
                      </div>
                    </div>

                    <Check className="h-3.5 w-3.5 text-primary opacity-0 group-hover:opacity-100 shrink-0" />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
