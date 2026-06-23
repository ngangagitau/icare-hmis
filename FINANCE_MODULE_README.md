# Finance Module - Comprehensive Documentation

## Overview
The Finance Module is a unified, enterprise-grade financial management system that consolidates all finance-related operations into a single, cohesive platform. It integrates billing, insurance management, accounts receivable, accounts payable, general ledger, asset management, and budget management into one powerful module.

## Module Structure

### Backend Components
- **Model**: `backend/models/Finance.js`
- **Routes**: `backend/routes/finance.js`
- **API Endpoints**: `/api/finance/*`

### Frontend Components
- **Page**: `frontend/src/pages/Finance.tsx`
- **Hooks**: `frontend/src/hooks/useFinance.ts`

---

## Feature Set

### 1. BILLING MANAGEMENT

#### Billing Types
- **Cash Billing**: Direct cash payment from patients
- **Insurance Billing**: Claims submitted to insurance providers
- **Corporate Billing**: Billing for corporate entities with agreements
- **Credit Billing**: Credit terms extended to patients
- **Package Billing**: Pre-arranged package billing for services

#### Key Features
- Bill ID generation with unique tracking
- Itemized billing with quantity and unit pricing
- Automatic calculation of subtotal, tax, and total
- Discount management
- Payment method tracking
- Payment status monitoring (Pending, Partial, Paid, Overdue, Cancelled)
- Payment history logging
- Insurance information attachment
- Notes and references

#### API Endpoints
```
GET    /api/finance/billing              - List all bills
POST   /api/finance/billing              - Create new bill
GET    /api/finance/:id                  - Get bill details
PUT    /api/finance/billing/:id          - Update bill
```

#### Data Structure
```javascript
{
  billId: "BILL-123456",
  billType: "Cash|Insurance|Corporate|Credit|Package",
  patient: ObjectId,
  appointment: ObjectId,
  billDate: Date,
  dueDate: Date,
  items: [{
    description: String,
    quantity: Number,
    unitPrice: Number,
    total: Number
  }],
  subtotal: Number,
  discount: Number,
  tax: Number,
  total: Number,
  amountPaid: Number,
  balance: Number,
  paymentMethod: String,
  paymentStatus: String,
  insuranceInfo: Object,
  paymentHistory: Array,
  notes: String
}
```

---

### 2. CASH OFFICE OPERATIONS

#### Receipts
- Receipt ID generation
- Receipt date tracking
- Amount recording
- Payment method documentation
- Payment reference tracking
- Cashier identification
- Related bill linking
- Notes and comments

#### Refunds
- Refund amount processing
- Refund reason documentation
- Original bill reference
- Cashier tracking
- Refund authorization
- Payment method for refund

#### Shift Balancing
- Daily cash reconciliation
- Opening balance tracking
- Closing balance calculation
- Variance identification
- Shift reports

#### Cashier Reports
- Daily transaction reports
- Payment method breakdown
- Discrepancy reporting
- Audit trails

#### API Endpoints
```
GET    /api/finance/cash-office          - List cash office records
POST   /api/finance/cash-office          - Create receipt/refund
```

#### Data Structure
```javascript
{
  receiptId: String,
  date: Date,
  type: "Receipt|Refund",
  amount: Number,
  paymentMethod: String,
  reference: String,
  relatedBill: ObjectId,
  cashier: ObjectId,
  notes: String
}
```

---

### 3. INSURANCE MANAGEMENT

#### Pre-authorizations
- Authorization number generation
- Authorization limit setting
- Patient verification
- Service validation
- Valid period tracking
- Coverage confirmation

#### Claim Generation
- Automatic claim ID generation
- Service date tracking
- Claim amount calculation
- Supporting documentation attachment
- Claim packaging and submission preparation

#### Claim Tracking
- Real-time claim status updates
- Status history logging
- Approval/rejection tracking
- Payment tracking
- Follow-up scheduling

#### Reconciliation
- Claims vs. payments matching
- Discrepancy identification
- Adjustment processing
- Settlement verification
- Dispute tracking

#### Features
- Multiple insurance provider support
- Coverage plan management
- Deductible tracking
- Co-insurance percentage management
- Copay management
- Pre-authorization tracking

#### API Endpoints
```
GET    /api/finance/insurance            - List insurance claims
POST   /api/finance/insurance            - Create insurance claim
PUT    /api/finance/:id                  - Update claim status
```

#### Data Structure
```javascript
{
  provider: String,
  preAuthId: String,
  patient: ObjectId,
  claimNumber: String,
  claimStatus: "Draft|Submitted|Approved|Rejected|Paid|Pending",
  claimAmount: Number,
  approvedAmount: Number,
  serviceDate: Date,
  submissionDate: Date,
  authorizationNumber: String,
  authorizationLimit: Number,
  coinsurancePercentage: Number,
  copayAmount: Number,
  deductible: Number,
  reconciliationStatus: "Pending|Reconciled|Disputed"
}
```

---

### 4. ACCOUNTS RECEIVABLE

#### Outstanding Balances
- Debtor identification
- Outstanding amount tracking
- Invoice date recording
- Due date tracking
- Aging analysis

#### Debtor Aging
- Age categorization (Current, 30-60 days, 60-90 days, 90+ days)
- Aging bucket analysis
- Risk assessment
- Collection priority

#### Follow-up Reports
- Contact history logging
- Follow-up scheduling
- Communication tracking
- Payment plan setup
- Dispute handling

#### Collections Management
- Active/Inactive status tracking
- Collection status (Active, Inactive, Collected, Written Off)
- Payment plan tracking
- Recovery scheduling
- Collections metrics

#### Features
- Automatic aging calculations
- Collection status management
- Payment plan support
- Dispute tracking
- Write-off processing

#### API Endpoints
```
GET    /api/finance/accounts-receivable  - List AR records
POST   /api/finance/accounts-receivable  - Create AR record
PUT    /api/finance/:id                  - Update AR
```

#### Data Structure
```javascript
{
  debtorId: String,
  patient: ObjectId,
  outstandingBalance: Number,
  invoiceDate: Date,
  dueDate: Date,
  daysPastDue: Number,
  ageCategory: "Current|30-60 days|60-90 days|90+ days",
  followUpStatus: "Not Contacted|Contacted|Payment Plan|Dispute",
  followUpDate: Date,
  collectionStatus: "Active|Inactive|Collected|Written Off"
}
```

---

### 5. GENERAL LEDGER

#### Chart of Accounts
- Account code management
- Account name tracking
- Account type classification
- Account subtype specification
- Hierarchical structure support

#### Account Types
- **Assets**: Resources owned by the hospital
- **Liabilities**: Obligations and debts
- **Equity**: Owner's stake in the business
- **Revenue**: Income from operations
- **Expense**: Operating costs

#### Journal Entries
- Entry date tracking
- Description recording
- Debit/Credit amounts
- Reference tracking
- Automatic balance calculations
- Transaction logging

#### Trial Balance
- Account-wise balance summary
- Debit/Credit totals
- Balance verification
- Error identification

#### Balance Sheet
- Asset totals
- Liability totals
- Equity calculation
- Net worth determination

#### Income Statement
- Revenue totals
- Expense totals
- Net income/loss calculation
- Period-wise analysis

#### API Endpoints
```
GET    /api/finance/general-ledger       - List GL accounts
POST   /api/finance/general-ledger       - Create GL entry
PUT    /api/finance/:id                  - Update GL account
```

#### Data Structure
```javascript
{
  accountCode: String,
  accountName: String,
  accountType: "Asset|Liability|Equity|Revenue|Expense",
  accountSubtype: String,
  openingBalance: Number,
  debit: Number,
  credit: Number,
  balance: Number,
  journalEntries: [{
    entryDate: Date,
    description: String,
    debitAmount: Number,
    creditAmount: Number,
    reference: String
  }]
}
```

---

### 6. ASSET MANAGEMENT

#### Asset Register
- Unique asset ID generation
- Asset name and category
- Location tracking
- Purchase date
- Purchase price
- Current location

#### Depreciation
- Depreciation method (Straight-line, Declining Balance)
- Depreciation rate setting
- Accumulated depreciation tracking
- Book value calculation
- Useful life specification
- Salvage value estimation

#### Maintenance Schedules
- Maintenance date tracking
- Maintenance type recording
- Maintenance cost tracking
- Service provider information
- Maintenance notes

#### Asset Status
- Active/Inactive/Retired/Sold tracking
- Life cycle management
- Disposal tracking
- Write-off processing

#### Features
- Depreciation calculations
- Maintenance scheduling
- Asset lifecycle tracking
- Multi-location support
- Asset valuation

#### API Endpoints
```
GET    /api/finance/assets               - List assets
POST   /api/finance/assets               - Create asset
PUT    /api/finance/:id                  - Update asset
```

#### Data Structure
```javascript
{
  assetId: String,
  assetName: String,
  category: String,
  location: String,
  purchaseDate: Date,
  purchasePrice: Number,
  depreciation: {
    method: "Straight-line|Declining Balance",
    rate: Number,
    accumulatedDepreciation: Number
  },
  bookValue: Number,
  maintenanceSchedules: [{
    date: Date,
    type: String,
    cost: Number,
    notes: String
  }],
  salvageValue: Number,
  usefulLife: Number,
  status: "Active|Inactive|Retired|Sold"
}
```

---

### 7. ACCOUNTS PAYABLE

#### Supplier Invoices
- Invoice number (unique)
- Supplier identification
- Invoice date
- Due date
- Item details
- Invoice amount

#### Purchase Orders
- PO reference linking
- Item tracking
- Quantity verification
- Price validation

#### Payments
- Payment scheduling
- Payment date tracking
- Payment amount
- Payment reference
- Multiple payment support

#### Reconciliation
- Invoice vs. delivery matching
- Quantity variance tracking
- Price variance analysis
- Settlement verification
- Dispute management

#### Features
- Payment status tracking
- Payment history logging
- Due date monitoring
- Discount capture
- Multi-currency support (future)

#### API Endpoints
```
GET    /api/finance/accounts-payable     - List AP records
POST   /api/finance/accounts-payable     - Create AP record
PUT    /api/finance/:id                  - Update AP
```

#### Data Structure
```javascript
{
  invoiceNumber: String,
  supplier: String,
  invoiceDate: Date,
  dueDate: Date,
  purchaseOrder: String,
  items: [{
    description: String,
    quantity: Number,
    unitPrice: Number,
    total: Number
  }],
  amount: Number,
  amountPaid: Number,
  balance: Number,
  paymentStatus: "Pending|Partial|Paid|Overdue",
  paymentHistory: [{
    date: Date,
    amount: Number,
    reference: String
  }],
  reconciliationStatus: "Pending|Reconciled|Disputed"
}
```

---

### 8. BUDGET MANAGEMENT

#### Department Budgets
- Budget year designation
- Department allocation
- Budget category classification
- Allocated amount
- Utilization tracking

#### Budget Utilization
- Actual spending tracking
- Planned vs. actual comparison
- Real-time updates
- Spending velocity analysis
- Remaining budget calculation

#### Variance Reports
- Positive/negative variance identification
- Variance percentage calculation
- Trend analysis
- Deviation alerts
- Corrective action tracking

#### Monthly Breakdown
- Monthly planned amounts
- Monthly actual spending
- Monthly variance
- Trend visualization
- Forecasting

#### Budget Status
- Draft status (under creation)
- Approved status (authorized)
- Executed status (in use)
- Completed status (period ended)

#### Features
- Multi-level budget hierarchy
- Real-time spending tracking
- Variance analysis
- Trend forecasting
- Alert thresholds

#### API Endpoints
```
GET    /api/finance/budgets              - List budgets
POST   /api/finance/budgets              - Create budget
PUT    /api/finance/:id                  - Update budget
```

#### Data Structure
```javascript
{
  budgetYear: Number,
  department: String,
  budgetCategory: String,
  allocatedAmount: Number,
  utilizedAmount: Number,
  variance: Number,
  variancePercentage: Number,
  status: "Draft|Approved|Executed|Completed",
  monthlyBreakdown: [{
    month: Number,
    planned: Number,
    actual: Number
  }],
  notes: String
}
```

---

## API Reference

### Core Finance Endpoints

#### Get All Finance Records
```http
GET /api/finance?page=1&limit=25&type=Billing&status=Active
```

#### Get Finance Summary
```http
GET /api/finance/reports/summary
```
**Response:**
```json
{
  "success": true,
  "summary": {
    "totalBillings": 500000,
    "totalCollections": 450000,
    "outstandingReceivables": 50000,
    "accountsPayable": 100000
  }
}
```

#### Get Record by ID
```http
GET /api/finance/:id
```

#### Update Finance Record
```http
PUT /api/finance/:id
```

#### Delete Finance Record (Soft Delete)
```http
DELETE /api/finance/:id
```

### Response Format
All successful responses follow this format:
```json
{
  "success": true,
  "count": 10,
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalRecords": 50,
    "hasNext": true,
    "hasPrev": false
  },
  "data": [/* records */]
}
```

---

## Access Control

All Finance endpoints require:
1. **Authentication**: Valid bearer token in Authorization header
2. **Authorization**: `finance` permission with appropriate action (read, create, update, delete)

### Permission Levels
- **Read**: View finance records
- **Create**: Create new finance records
- **Update**: Modify existing records
- **Delete**: Archive/delete records

---

## Frontend Usage

### Component Usage
```tsx
import Finance from '@/pages/Finance';

export default function App() {
  return <Finance />;
}
```

### Hook Usage
```tsx
import { useBillings, useCreateBilling } from '@/hooks/useFinance';

function BillingComponent() {
  const { data: billings, isLoading } = useBillings(1, 10);
  const createBilling = useCreateBilling();

  const handleCreate = async (billData) => {
    await createBilling.mutateAsync(billData);
  };

  return (/* JSX */);
}
```

---

## Database Schema

### Finance Table (PostgreSQL)
```sql
CREATE TABLE finance (
  id SERIAL PRIMARY KEY,
  finance_id VARCHAR(255) UNIQUE NOT NULL,
  type VARCHAR(50) NOT NULL,
  data JSONB,
  status VARCHAR(50) DEFAULT 'Active',
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_finance_type ON finance(type);
CREATE INDEX idx_finance_created_at ON finance(created_at DESC);
```

---

## Implementation Timeline

### Phase 1: Core Setup (Completed)
- ✅ Finance model creation
- ✅ Finance routes implementation
- ✅ Frontend page creation
- ✅ Hooks integration
- ✅ Database schema setup

### Phase 2: Feature Development (In Progress)
- [ ] Billing module UI enhancements
- [ ] Insurance claim processing
- [ ] AR aging reports
- [ ] AP payment automation

### Phase 3: Advanced Features (Planned)
- [ ] Financial reporting and analytics
- [ ] Multi-currency support
- [ ] Automated invoice generation
- [ ] Payment gateway integration
- [ ] Audit trail and compliance reporting

---

## Business Rules

1. **Bill Creation**: Bill total = (Subtotal - Discount) + Tax
2. **Payment Processing**: AmountPaid cannot exceed Total
3. **AR Aging**: Automatic aging calculation based on due date
4. **GL Posting**: Every transaction must have offsetting debit/credit
5. **Budget Variance**: Alert when utilization exceeds 90% of budget
6. **Asset Depreciation**: Annual depreciation = Purchase Price / Useful Life
7. **Insurance Reconciliation**: Approved Amount ≤ Claim Amount

---

## Reports and Analytics

### Available Reports
1. **Financial Summary Dashboard**
   - Total billings
   - Total collections
   - Outstanding receivables
   - Accounts payable

2. **AR Aging Report**
   - Current balances
   - 30-60 days aging
   - 60-90 days aging
   - 90+ days aging

3. **General Ledger Trial Balance**
   - All accounts with balances
   - Total debits and credits

4. **Budget Variance Report**
   - Actual vs. planned spending
   - Variance percentage
   - Trend analysis

---

## Troubleshooting

### Common Issues

**Issue**: Billing creation fails
- Check patient exists
- Verify bill ID is unique
- Ensure total is numeric

**Issue**: Insurance claim not updating
- Verify claim exists
- Check authorization headers
- Confirm permission level

**Issue**: AR aging not calculating
- Ensure due date is set
- Check system date/time
- Verify invoice date < due date

---

## Best Practices

1. **Data Integrity**
   - Always validate input data
   - Use transactions for multi-step operations
   - Maintain audit trails

2. **Security**
   - Always use authentication tokens
   - Enforce role-based access control
   - Log all financial transactions

3. **Performance**
   - Use pagination for large datasets
   - Index frequently searched fields
   - Cache summary calculations

4. **Compliance**
   - Maintain complete audit trails
   - Implement proper backup procedures
   - Follow accounting standards

---

## Support and Maintenance

For issues, questions, or feature requests:
1. Check the documentation
2. Review API responses for error details
3. Contact system administrator
4. Submit bug reports with detailed logs

---

**Version**: 1.0.0  
**Last Updated**: June 8, 2026  
**Status**: Active
