# Frontend API Integration - Complete Guide

## ✅ What's Done
1. **Core Infrastructure (Already Set Up)**
   - API client with all HTTP methods: GET, POST, PUT, DELETE, PATCH
   - Authentication service with token management
   - React Query integration for state management
   - Custom hooks system for data fetching and mutations

2. **Service Files Created**
   - `patientService.ts` - Patient CRUD operations
   - `appointmentService.ts` - Appointment management
   - `ticketService.ts` - Ticket/Support management
   - `billingService.ts` - Billing and payment operations
   - `queueService.ts` - Queue management

3. **Custom Hooks Created**
   - `usePatients.ts` - Patient queries and mutations
   - `useAppointments.ts` - Appointment queries and mutations
   - `useTickets.ts` - Ticket queries and mutations
   - `useBilling.ts` - Billing queries and mutations
   - `useQueueManagement.ts` - Queue queries and mutations
   - `usePrescriptions.ts` (Already existed - Pharmacy)
   - `usePharmacyOps.ts` (Already existed - Pharmacy operations)

4. **Pages Updated to Use API**
   - `pages/patients/Register.tsx` - Now POSTs patient data to backend
   - `pages/Appointments.tsx` - Now fetches and updates appointments from API
   - `pages/PatientRegistry.tsx` - Already using API (GET patients)
   - `pages/Pharmacy.tsx` - Already using API (OTC sales, prescriptions)

## 📋 How to Use These Services

### For Patients
```tsx
import { usePatients, useCreatePatient, useUpdatePatient, useDeletePatient } from "@/hooks/usePatients";

// In your component:
const { data: patientsData, isLoading, error } = usePatients(page, limit);
const createMutation = useCreatePatient();

// Create patient:
await createMutation.mutateAsync({
  firstName: "John",
  lastName: "Doe",
  // ... other fields
});
```

### For Appointments
```tsx
import { useAppointments, useCreateAppointment, useUpdateAppointment } from "@/hooks/useAppointments";

const { data: appointmentsData } = useAppointments(page, limit, filters);
const updateMutation = useUpdateAppointment();

// Update appointment status:
await updateMutation.mutateAsync({
  id: appointmentId,
  data: { status: "Completed" }
});
```

### For Billing
```tsx
import { useBills, useRecordPayment } from "@/hooks/useBilling";

const { data: billsData } = useBills(page, limit, filters);
const paymentMutation = useRecordPayment();

// Record payment:
await paymentMutation.mutateAsync({
  billId: "bill-id",
  payment: {
    amount: 1000,
    paymentMethod: "Cash",
    reference: "REF-123"
  }
});
```

## 🔧 How to Create Services for Other Modules

### Step 1: Create Service File (e.g., `laboraoryService.ts`)
```typescript
import apiClient from "@/lib/api";

export interface LabTest {
  _id?: string;
  id?: string;
  testName: string;
  testCode: string;
  patient: string;
  status: "Pending" | "In Progress" | "Completed";
  results?: any;
  createdAt?: string;
}

const unwrap = <T,>(response: any): T => {
  if (response && typeof response === "object" && "data" in response && response.data !== undefined) {
    return response.data as T;
  }
  return response as T;
};

export async function fetchLabTests(page = 1, limit = 25): Promise<any> {
  const response = await apiClient.get<any>(`/laboratory?page=${page}&limit=${limit}`);
  return response;
}

export async function getLabTestById(id: string): Promise<LabTest> {
  const response = await apiClient.get<any>(`/laboratory/${id}`);
  return unwrap(response);
}

export async function createLabTest(data: Omit<LabTest, '_id' | 'id'>): Promise<LabTest> {
  const response = await apiClient.post<any>("/laboratory", data);
  return unwrap(response);
}

export async function updateLabTest(id: string, data: Partial<LabTest>): Promise<LabTest> {
  const response = await apiClient.put<any>(`/laboratory/${id}`, data);
  return unwrap(response);
}

export async function deleteLabTest(id: string): Promise<{ success: boolean }> {
  return apiClient.delete<{ success: boolean }>(`/laboratory/${id}`);
}
```

### Step 2: Create Hook File (e.g., `useLaboratory.ts`)
```typescript
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchLabTests,
  getLabTestById,
  createLabTest,
  updateLabTest,
  deleteLabTest,
  type LabTest,
} from "@/lib/laboratoryService";

const keys = {
  all: ["lab-tests"] as const,
  list: (page?: number, limit?: number) => [...keys.all, "list", page ?? 1, limit ?? 25] as const,
  detail: (id: string) => [...keys.all, "detail", id] as const,
};

export function useLabTests(page = 1, limit = 25) {
  return useQuery({
    queryKey: keys.list(page, limit),
    queryFn: () => fetchLabTests(page, limit),
  });
}

export function useLabTest(id: string) {
  return useQuery({
    queryKey: keys.detail(id),
    queryFn: () => getLabTestById(id),
    enabled: !!id,
  });
}

export function useCreateLabTest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof createLabTest>[0]) => createLabTest(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
  });
}

export function useUpdateLabTest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<LabTest> }) => updateLabTest(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: keys.detail(id) });
      qc.invalidateQueries({ queryKey: keys.all });
    },
  });
}

export function useDeleteLabTest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteLabTest(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
  });
}
```

### Step 3: Use in Your Page Component
```tsx
import { useLabTests, useCreateLabTest, useUpdateLabTest } from "@/hooks/useLaboratory";

export default function Laboratory() {
  const { data: testsData, isLoading } = useLabTests(1, 25);
  const createMutation = useCreateLabTest();

  const handleCreateTest = async (testData) => {
    try {
      await createMutation.mutateAsync(testData);
      toast.success("Test created successfully");
    } catch (error) {
      toast.error("Failed to create test");
    }
  };

  return (
    // Your component JSX
  );
}
```

## 📚 Available Backend Endpoints for ALL Modules

### Standard CRUD Pattern (All These Modules Support It)
- `/api/emergency` - Emergency management
- `/api/triage` - Triage nursing
- `/api/doctor` - Doctor management
- `/api/laboratory` - Lab tests
- `/api/radiology` - Radiology imaging
- `/api/pharmacy` - Pharmacy inventory
- `/api/inpatient` - In-patient management
- `/api/theatre` - Operating theatre
- `/api/blood-bank` - Blood bank
- `/api/cssd` - CSSD sterilization
- `/api/nutrition` - Nutrition management
- `/api/telemedicine` - Telemedicine
- `/api/mortuary` - Mortuary
- `/api/procurement` - Procurement
- `/api/inventory` - Inventory management
- `/api/accounts-receivable` - AR
- `/api/general-ledger` - GL
- `/api/fixed-assets` - Assets
- `/api/hr` - Human resources
- `/api/messaging` - Messaging
- `/api/it` - IT module
- `/api/admin` - Admin settings

Each endpoint supports:
- `GET /endpoint` - List with pagination
- `GET /endpoint/:id` - Get by ID
- `POST /endpoint` - Create new
- `PUT /endpoint/:id` - Update
- `DELETE /endpoint/:id` - Delete

## 🚀 Quick Start for Remaining Pages

### For Emergency Module
```tsx
// 1. Create: lib/emergencyService.ts (using the template above)
// 2. Create: hooks/useEmergency.ts
// 3. Update: pages/Emergency.tsx to use the hooks
```

### For Radiology Module
```tsx
// 1. Create: lib/radiologyService.ts
// 2. Create: hooks/useRadiology.ts
// 3. Update: pages/Radiology.tsx to use the hooks
```

**Follow the same pattern for all other modules!**

## ✅ Checklist for Full Integration

- [x] Core API infrastructure
- [x] Patients module (service, hooks, page updated)
- [x] Appointments module (service, hooks, page updated)
- [x] Billing module (service, hooks created)
- [x] Tickets module (service, hooks created)
- [x] Queue module (service, hooks created)
- [x] Pharmacy module (hooks already existed)
- [ ] Emergency module - Create service & hooks, update page
- [ ] Triage module - Create service & hooks, update page
- [ ] Laboratory module - Create service & hooks, update page
- [ ] Radiology module - Create service & hooks, update page
- [ ] Theatre module - Create service & hooks, update page
- [ ] Blood Bank module - Create service & hooks, update page
- [ ] And so on for all 20+ remaining modules...

## 🔐 Authentication
All API calls automatically include the JWT token from localStorage. If a request returns 401, the user is automatically redirected to login.

## 📊 Error Handling
All hooks include proper error handling with React Query. Errors are automatically shown via toast notifications in components that use the `useToast()` hook.

## 🔄 Data Caching & Refetching
- Data is cached by React Query with smart invalidation
- Create/Update/Delete mutations automatically invalidate affected cache
- Some hooks (like Queue, Pharmacy) refetch every 10 seconds for real-time updates
- You can customize refetch behavior when creating hooks

## 🎯 Next Steps
1. Create services and hooks for remaining modules (follow the template)
2. Update all page components to use the hooks instead of hardcoded data
3. Add forms for CREATE and UPDATE operations on pages that need them
4. Test all POST/PUT/DELETE operations with the backend
5. Implement proper validation and error handling
