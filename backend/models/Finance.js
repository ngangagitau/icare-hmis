const mongoose = require('mongoose');

// Billing Schema
const BillingSchema = new mongoose.Schema({
  billId: {
    type: String,
    required: [true, 'Bill ID is required'],
    unique: true,
  },
  billType: {
    type: String,
    enum: ['Cash', 'Insurance', 'Corporate', 'Credit', 'Package'],
    required: true,
  },
  patient: {
    type: mongoose.Schema.ObjectId,
    ref: 'Patient',
    required: [true, 'Patient is required'],
  },
  appointment: {
    type: mongoose.Schema.ObjectId,
    ref: 'Appointment',
  },
  billDate: {
    type: Date,
    default: Date.now,
  },
  dueDate: Date,
  items: [{
    description: String,
    quantity: Number,
    unitPrice: Number,
    total: Number,
  }],
  subtotal: {
    type: Number,
    min: [0, 'Subtotal cannot be negative'],
  },
  discount: {
    type: Number,
    min: [0, 'Discount cannot be negative'],
    default: 0,
  },
  tax: {
    type: Number,
    min: [0, 'Tax cannot be negative'],
    default: 0,
  },
  total: {
    type: Number,
    required: [true, 'Total is required'],
    min: [0, 'Total cannot be negative'],
  },
  amountPaid: {
    type: Number,
    default: 0,
    min: [0, 'Amount paid cannot be negative'],
  },
  balance: {
    type: Number,
    default: function() {
      return this.total - this.amountPaid;
    },
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Check', 'Insurance', 'Other'],
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Partial', 'Paid', 'Overdue', 'Cancelled'],
    default: 'Pending',
  },
  insuranceInfo: {
    provider: String,
    claimNumber: String,
    claimStatus: {
      type: String,
      enum: ['Submitted', 'Approved', 'Rejected', 'Pending'],
    },
    coinsurance: Number,
    copay: Number,
    deductible: Number,
  },
  notes: String,
  paymentHistory: [{
    date: Date,
    amount: Number,
    method: String,
    reference: String,
    notes: String,
  }],
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Cash Office Schema
const CashOfficeSchema = new mongoose.Schema({
  receiptId: String,
  date: {
    type: Date,
    default: Date.now,
  },
  type: {
    type: String,
    enum: ['Receipt', 'Refund'],
  },
  amount: {
    type: Number,
    required: true,
    min: [0, 'Amount cannot be negative'],
  },
  paymentMethod: String,
  reference: String,
  relatedBill: {
    type: mongoose.Schema.ObjectId,
    ref: 'Bill',
  },
  cashier: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Insurance Management Schema
const InsuranceSchema = new mongoose.Schema({
  provider: {
    type: String,
    required: true,
  },
  preAuthId: String,
  patient: {
    type: mongoose.Schema.ObjectId,
    ref: 'Patient',
  },
  claimNumber: String,
  claimStatus: {
    type: String,
    enum: ['Draft', 'Submitted', 'Approved', 'Rejected', 'Paid', 'Pending'],
    default: 'Draft',
  },
  claimAmount: {
    type: Number,
    min: 0,
  },
  approvedAmount: {
    type: Number,
    min: 0,
  },
  serviceDate: Date,
  submissionDate: Date,
  authorizationNumber: String,
  authorizationLimit: Number,
  coinsurancePercentage: Number,
  copayAmount: Number,
  deductible: Number,
  reconciliationStatus: {
    type: String,
    enum: ['Pending', 'Reconciled', 'Disputed'],
    default: 'Pending',
  },
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Accounts Receivable Schema
const AccountsReceivableSchema = new mongoose.Schema({
  debtorId: String,
  patient: {
    type: mongoose.Schema.ObjectId,
    ref: 'Patient',
  },
  outstandingBalance: {
    type: Number,
    default: 0,
    min: 0,
  },
  invoiceDate: Date,
  dueDate: Date,
  daysPastDue: Number,
  ageCategory: {
    type: String,
    enum: ['Current', '30-60 days', '60-90 days', '90+ days'],
  },
  followUpStatus: {
    type: String,
    enum: ['Not Contacted', 'Contacted', 'Payment Plan', 'Dispute'],
    default: 'Not Contacted',
  },
  followUpDate: Date,
  collectionStatus: {
    type: String,
    enum: ['Active', 'Inactive', 'Collected', 'Written Off'],
    default: 'Active',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// General Ledger Schema
const GeneralLedgerSchema = new mongoose.Schema({
  accountCode: {
    type: String,
    required: true,
    unique: true,
  },
  accountName: {
    type: String,
    required: true,
  },
  accountType: {
    type: String,
    enum: ['Asset', 'Liability', 'Equity', 'Revenue', 'Expense'],
    required: true,
  },
  accountSubtype: String,
  openingBalance: {
    type: Number,
    default: 0,
  },
  debit: {
    type: Number,
    default: 0,
  },
  credit: {
    type: Number,
    default: 0,
  },
  balance: {
    type: Number,
    default: 0,
  },
  journalEntries: [{
    entryDate: Date,
    description: String,
    debitAmount: Number,
    creditAmount: Number,
    reference: String,
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Asset Management Schema
const AssetSchema = new mongoose.Schema({
  assetId: {
    type: String,
    required: true,
    unique: true,
  },
  assetName: {
    type: String,
    required: true,
  },
  category: String,
  location: String,
  purchaseDate: Date,
  purchasePrice: {
    type: Number,
    required: true,
    min: 0,
  },
  depreciation: {
    method: {
      type: String,
      enum: ['Straight-line', 'Declining Balance'],
    },
    rate: Number,
    accumulatedDepreciation: {
      type: Number,
      default: 0,
    },
  },
  bookValue: {
    type: Number,
    default: function() {
      return this.purchasePrice - (this.depreciation?.accumulatedDepreciation || 0);
    },
  },
  maintenanceSchedules: [{
    date: Date,
    type: String,
    cost: Number,
    notes: String,
  }],
  salvageValue: Number,
  usefulLife: Number,
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Retired', 'Sold'],
    default: 'Active',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Accounts Payable Schema
const AccountsPayableSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: true,
    unique: true,
  },
  supplier: {
    type: String,
    required: true,
  },
  invoiceDate: {
    type: Date,
    required: true,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  purchaseOrder: String,
  items: [{
    description: String,
    quantity: Number,
    unitPrice: Number,
    total: Number,
  }],
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  amountPaid: {
    type: Number,
    default: 0,
    min: 0,
  },
  balance: {
    type: Number,
    default: function() {
      return this.amount - this.amountPaid;
    },
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Partial', 'Paid', 'Overdue'],
    default: 'Pending',
  },
  paymentHistory: [{
    date: Date,
    amount: Number,
    reference: String,
  }],
  reconciliationStatus: {
    type: String,
    enum: ['Pending', 'Reconciled', 'Disputed'],
    default: 'Pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Budget Management Schema
const BudgetSchema = new mongoose.Schema({
  budgetYear: {
    type: Number,
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
  budgetCategory: String,
  allocatedAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  utilizedAmount: {
    type: Number,
    default: 0,
    min: 0,
  },
  variance: {
    type: Number,
    default: function() {
      return this.allocatedAmount - this.utilizedAmount;
    },
  },
  variancePercentage: {
    type: Number,
    default: function() {
      return ((this.variance / this.allocatedAmount) * 100).toFixed(2);
    },
  },
  status: {
    type: String,
    enum: ['Draft', 'Approved', 'Executed', 'Completed'],
    default: 'Draft',
  },
  monthlyBreakdown: [{
    month: Number,
    planned: Number,
    actual: Number,
  }],
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Main Finance Schema - combines all finance modules
const FinanceSchema = new mongoose.Schema({
  financeId: {
    type: String,
    required: true,
    unique: true,
  },
  type: {
    type: String,
    enum: ['Billing', 'CashOffice', 'Insurance', 'AccountsReceivable', 'GeneralLedger', 'Asset', 'AccountsPayable', 'Budget'],
    required: true,
  },
  data: mongoose.Schema.Types.Mixed,
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Archived'],
    default: 'Active',
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Create indexes
FinanceSchema.index({ type: 1 });
FinanceSchema.index({ financeId: 1 });
FinanceSchema.index({ createdAt: -1 });

BillingSchema.index({ billId: 1 });
BillingSchema.index({ patient: 1 });
BillingSchema.index({ createdAt: -1 });

InsuranceSchema.index({ claimNumber: 1 });
InsuranceSchema.index({ provider: 1 });
InsuranceSchema.index({ claimStatus: 1 });

AccountsReceivableSchema.index({ debtorId: 1 });
AccountsReceivableSchema.index({ patient: 1 });
AccountsReceivableSchema.index({ ageCategory: 1 });

GeneralLedgerSchema.index({ accountCode: 1 });
GeneralLedgerSchema.index({ accountType: 1 });

AssetSchema.index({ assetId: 1 });
AssetSchema.index({ status: 1 });

AccountsPayableSchema.index({ invoiceNumber: 1 });
AccountsPayableSchema.index({ supplier: 1 });
AccountsPayableSchema.index({ paymentStatus: 1 });

BudgetSchema.index({ budgetYear: 1 });
BudgetSchema.index({ department: 1 });

module.exports = mongoose.model('Finance', FinanceSchema);
module.exports.BillingSchema = BillingSchema;
module.exports.CashOfficeSchema = CashOfficeSchema;
module.exports.InsuranceSchema = InsuranceSchema;
module.exports.AccountsReceivableSchema = AccountsReceivableSchema;
module.exports.GeneralLedgerSchema = GeneralLedgerSchema;
module.exports.AssetSchema = AssetSchema;
module.exports.AccountsPayableSchema = AccountsPayableSchema;
module.exports.BudgetSchema = BudgetSchema;
