# Frontend Database Data Audit

## Goal

Operational records, live counts, and completed actions in the frontend should come from persisted database records or clearly identified configuration. Empty databases and API failures must show empty/error states rather than sample records or success messages.

## Audit Summary

The frontend contains hardcoded operational records across clinical, finance, inventory, HR, patient flow, and administration pages. Some pages use real APIs while nearby pages in the same module still render local sample arrays. In several forms, an action displays success without making a database request. The generic `module_items` API is database-backed, but it only stores generic records and is not a substitute for domain APIs, patient relationships, or transaction rules.

The backend schema initialization creates tables and department-flow configuration, but does not seed patient or operational sample records on application startup. Explicit scripts under `backend/scripts/` do seed demo data when manually run. The inpatient API previously seeded admissions automatically on import; that runtime seeding has been removed.

## Migration Inventory

### Critical clinical workflows

- `frontend/src/pages/doctor/ipd.tsx` and `frontend/src/pages/doctor/ipdSubcomponents.tsx`: fabricated inpatient roster and patient chart datasets; several chart actions only mutate component state. Requires a patient/admission-scoped clinical-record API before replacing the chart safely.
- `frontend/src/pages/Emergency.tsx`, `frontend/src/pages/emergency/Resuscitation.tsx`, `frontend/src/pages/emergency/Trauma.tsx`, and `frontend/src/pages/emergency/EmergencyBilling.tsx`: fabricated emergency cases, bays, and bills. An emergency generic-module API/service exists but its frontend data contract does not match the generic route response and needs an explicit mapping/domain contract.
- `frontend/src/pages/emergency/Triage.tsx`, `frontend/src/pages/triage/Vitals.tsx`, `frontend/src/pages/triage/VitalsHistory.tsx`, `frontend/src/pages/triage/Procedures.tsx`, and `frontend/src/pages/triage/Notes.tsx`: sample patient data or actions that report success without persistence.
- `frontend/src/pages/InPatient.tsx`, `frontend/src/pages/inpatient/Admissions.tsx`, `frontend/src/pages/inpatient/Discharges.tsx`, and `frontend/src/pages/inpatient/InpatientTransfers.tsx`: inpatient database services exist; remove any remaining generated defaults and ensure forms fail closed.

### Billing, finance, inventory, and procurement

- Billing: `frontend/src/pages/CashierBilling.tsx`, `frontend/src/pages/billing/Claims.tsx`, `frontend/src/pages/billing/Invoice.tsx`, `frontend/src/pages/billing/Payments.tsx`, and `frontend/src/pages/billing/Receipts.tsx` contain sample transaction rows or non-persistent actions. Dedicated billing services/routes exist and should be used consistently.
- Finance and receivables: `frontend/src/pages/AccountsReceivable.tsx`, `frontend/src/pages/ar/Statements.tsx`, `frontend/src/pages/ar/Allocations.tsx`, `frontend/src/pages/ar/Journals.tsx`, `frontend/src/pages/GeneralLedger.tsx`, `frontend/src/pages/gl/Bank.tsx`, `frontend/src/pages/gl/GLJournals.tsx`, `frontend/src/pages/gl/TrialBalance.tsx`, `frontend/src/pages/FixedAssets.tsx`, and `frontend/src/pages/assets/Depreciation.tsx` show local sample records. Finance hooks and routes exist for part of this area.
- Inventory and pharmacy stock: `frontend/src/pages/Inventory.tsx`, `frontend/src/pages/inventory/Issue.tsx`, `frontend/src/pages/inventory/Movement.tsx`, `frontend/src/pages/inventory/Receipt.tsx`, `frontend/src/pages/inventory/StockTake.tsx`, `frontend/src/pages/pharmacy/Stock.tsx`, and `frontend/src/pages/pharmacy/Expiry.tsx` contain sample stock or movement data; several actions are not persisted. Inventory and pharmacy APIs/hooks exist but are not consistently used.
- Procurement: `frontend/src/pages/Procurement.tsx`, `frontend/src/pages/procurement/LPO.tsx`, `frontend/src/pages/procurement/Suppliers.tsx`, `frontend/src/pages/procurement/Payables.tsx`, and `frontend/src/pages/procurement/Aging.tsx` show hardcoded order, supplier, and payable records. Backend generic routes exist, but domain persistence/reporting needs to be verified per workflow.

### Other hospital operations

- Blood bank: `frontend/src/pages/BloodBank.tsx`, `frontend/src/pages/bloodbank/Collection.tsx`, and `frontend/src/pages/bloodbank/BloodIssue.tsx` show static records; donor and cross-match forms also report success without persistence.
- CSSD and theatre: `frontend/src/pages/CSSD.tsx`, `frontend/src/pages/cssd/Cycles.tsx`, `frontend/src/pages/cssd/Instruments.tsx`, `frontend/src/pages/cssd/Quality.tsx`, `frontend/src/pages/Theatre.tsx`, `frontend/src/pages/theatre/Utilization.tsx`, and `frontend/src/pages/theatre/PostOp.tsx` contain fabricated operational rows; booking, pre-op, and OT notes include non-persistent actions.
- Radiology, nutrition, telemedicine, and mortuary: `frontend/src/pages/Radiology.tsx`, `frontend/src/pages/radiology/Imaging.tsx`, `frontend/src/pages/radiology/RadiologyReports.tsx`, `frontend/src/pages/radiology/Validation.tsx`, `frontend/src/pages/Nutrition.tsx`, `frontend/src/pages/nutrition/Meals.tsx`, `frontend/src/pages/Telemedicine.tsx`, `frontend/src/pages/telemedicine/EPrescriptions.tsx`, `frontend/src/pages/Mortuary.tsx`, and `frontend/src/pages/mortuary/Certificates.tsx` display sample records. Related entry forms include toast-only actions.
- HR and insurance: `frontend/src/pages/HumanResource.tsx`, `frontend/src/pages/hr/Attendance.tsx`, `frontend/src/pages/hr/Leave.tsx`, `frontend/src/pages/hr/Payroll.tsx`, `frontend/src/pages/hr/Tax.tsx`, `frontend/src/pages/insurance/Claims.tsx`, `frontend/src/pages/insurance/Rates.tsx`, and `frontend/src/pages/insurance/TPA.tsx` use static records or master lists.
- Messaging and IT: `frontend/src/pages/Messaging.tsx`, `frontend/src/pages/messaging/Broadcasts.tsx`, `frontend/src/pages/messaging/Notifications.tsx`, `frontend/src/pages/it/Tickets.tsx`, `frontend/src/pages/it/Hardware.tsx`, `frontend/src/pages/it/Software.tsx`, `frontend/src/pages/it/Access.tsx`, and `frontend/src/pages/it/Network.tsx` use static rows; message sending is not persisted in the compose page.

### Dashboard, reports, and administration

- `frontend/src/pages/dashboard/Activity.tsx` labels fabricated entries as a live feed; `frontend/src/pages/dashboard/Analytics.tsx` uses invented chart points and KPIs.
- `frontend/src/pages/Reports.tsx` shows fabricated report history; report-type lists are configuration and can remain static.
- `frontend/src/pages/Administration.tsx`, `frontend/src/pages/super-admin/GlobalAudit.tsx`, and `frontend/src/pages/super-admin/SystemHealth.tsx` display invented users, audit rows, or service telemetry. Some admin pages such as `frontend/src/pages/admin/Roles.tsx` and `frontend/src/pages/admin/Audit.tsx` already call APIs.
- `frontend/src/pages/patients/Transfers.tsx` has a fabricated cross-department transfer log. The existing inpatient transfer endpoint is specifically for ward transfers, so this workflow needs its own appropriate persistence contract.

## Completed in This Pass

- Removed inpatient admission auto-seeding from `backend/routes/inpatient.js`.
- Removed frontend fallback admissions and made inpatient API failures/empty results visible in `frontend/src/pages/InPatient.tsx`.
- Removed fabricated patient choices and false-success admission handling from `frontend/src/pages/inpatient/Admissions.tsx`; an admission must resolve to a registered patient.
- Removed fabricated transfer rows and fallback field values from the inpatient transfer API.
- Removed generated discharge bill totals and fallback patient/ward/date/doctor details; discharge invoice totals now come from the patient's persisted billing rows and are labeled as patient-level invoices.
- Removed fabricated ward-summary fallbacks in `frontend/src/lib/inpatientService.ts`.

## Recommended Order

1. Clinical records, emergency, triage, and inpatient workflows: connect patient-scoped data to domain APIs and remove every success path that does not await a database mutation.
2. Billing, finance, pharmacy, and inventory: reuse existing dedicated hooks/services; add APIs only where a domain contract is missing.
3. HR, procurement, blood bank, CSSD, theatre, radiology, nutrition, telemedicine, mortuary, and messaging: define persistence contracts and migrate page-by-page.
4. Dashboard, analytics, audit, health, and report history: calculate from stored records or label unavailable/configuration-only data accurately.
5. Remove remaining sample seeding from explicit setup scripts for deployments that should start with an empty production database; retain demo scripts only as opt-in developer tooling.

## Validation Notes

The changed inpatient frontend files report no editor diagnostics. A full frontend TypeScript check currently encounters unrelated syntax errors in the placeholder file `frontend/src/hooks/TEMPLATE_use[ModuleName].ts`. The PowerShell terminal does not expose `node` directly, so `node --check backend/routes/inpatient.js` could not be run there.