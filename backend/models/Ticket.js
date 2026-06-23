const mongoose = require('mongoose');

const TicketSchema = new mongoose.Schema({
  ticketId: {
    type: String,
    required: [true, 'Ticket ID is required'],
    unique: true,
  },
  title: {
    type: String,
    required: [true, 'Ticket title is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Ticket description is required'],
  },
  module: {
    type: String,
    required: [true, 'Module is required'],
    enum: [
      'Patients',
      'Appointments',
      'Medical Records',
      'Inventory',
      'Billing',
      'Labour',
      'Radiology',
      'Pharmacy',
      'InPatient',
      'Theatre',
      'BloodBank',
      'CSSD',
      'Nutrition',
      'Telemedicine',
      'Mortuary',
      'Procurement',
      'Accounts Receivable',
      'General Ledger',
      'Fixed Assets',
      'Human Resource',
      'Messaging',
      'Emergency',
      'Triage',
      'Administration',
      'IT Support',
    ],
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium',
  },
  status: {
    type: String,
    enum: ['Open', 'In Progress', 'On Hold', 'Resolved', 'Closed', 'Reopened'],
    default: 'Open',
  },
  category: {
    type: String,
    enum: ['Bug', 'Feature Request', 'Support', 'General Inquiry', 'System Error', 'Data Issue'],
    default: 'General Inquiry',
  },
  relatedItem: {
    type: String, // Could be patient ID, appointment ID, etc.
    description: String,
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  assignedTo: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
  attachments: [{
    filename: String,
    originalName: String,
    mimeType: String,
    size: Number,
    uploadDate: {
      type: Date,
      default: Date.now,
    },
  }],
  comments: [{
    author: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    text: String,
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
  resolution: {
    resolvedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    resolutionNotes: String,
    resolutionDate: Date,
  },
  tags: [String],
  dueDate: Date,
  estimatedHours: Number,
  actualHours: Number,
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
TicketSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for better query performance
TicketSchema.index({ ticketId: 1 });
TicketSchema.index({ module: 1 });
TicketSchema.index({ status: 1 });
TicketSchema.index({ priority: 1 });
TicketSchema.index({ createdBy: 1 });
TicketSchema.index({ assignedTo: 1 });
TicketSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Ticket', TicketSchema);