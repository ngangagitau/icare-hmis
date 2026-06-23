const mongoose = require('mongoose');

const BillingSchema = new mongoose.Schema({
  billId: {
    type: String,
    required: [true, 'Bill ID is required'],
    unique: true,
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

// Update the updatedAt field before saving
BillingSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  // Update balance
  this.balance = this.total - this.amountPaid;
  next();
});

// Index for better query performance
BillingSchema.index({ billId: 1 });
BillingSchema.index({ patient: 1 });
BillingSchema.index({ billDate: 1 });
BillingSchema.index({ paymentStatus: 1 });

// Ensure virtual fields are serialized
BillingSchema.set('toJSON', { virtuals: true });
BillingSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Billing', BillingSchema);