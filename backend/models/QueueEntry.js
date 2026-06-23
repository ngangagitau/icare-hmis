const mongoose = require('mongoose');

const DEPARTMENTS = ['opd', 'triage', 'doctor', 'lab', 'pharmacy', 'radiology'];
const PRIORITIES = ['Normal', 'Urgent', 'Emergency'];
const STATUSES = ['Waiting', 'In Progress', 'Served', 'Cancelled'];

const QueueEntrySchema = new mongoose.Schema({
  ticketNumber: {
    type: String,
    required: true,
    unique: true,
  },
  patient: {
    type: mongoose.Schema.ObjectId,
    ref: 'Patient',
    required: true,
  },
  patientDisplayId: {
    type: String,
    required: true,
  },
  patientName: {
    type: String,
    required: true,
  },
  department: {
    type: String,
    enum: DEPARTMENTS,
    required: true,
    index: true,
  },
  priority: {
    type: String,
    enum: PRIORITIES,
    default: 'Normal',
  },
  status: {
    type: String,
    enum: STATUSES,
    default: 'Waiting',
    index: true,
  },
  complaint: String,
  serviceName: String,
  queuedAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  startedAt: Date,
  servedAt: Date,
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
  notes: String,
});

QueueEntrySchema.index({ department: 1, status: 1, queuedAt: 1 });

QueueEntrySchema.set('toJSON', { virtuals: true });
QueueEntrySchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('QueueEntry', QueueEntrySchema);
module.exports.DEPARTMENTS = DEPARTMENTS;
module.exports.PRIORITIES = PRIORITIES;
module.exports.STATUSES = STATUSES;
