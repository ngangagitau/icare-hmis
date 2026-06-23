const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
  appointmentId: {
    type: String,
    required: [true, 'Appointment ID is required'],
    unique: true,
  },
  patient: {
    type: mongoose.Schema.ObjectId,
    ref: 'Patient',
    required: [true, 'Patient is required'],
  },
  doctor: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Doctor is required'],
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    enum: [
      'General Medicine',
      'Cardiology',
      'Neurology',
      'Orthopedics',
      'Pediatrics',
      'Gynecology',
      'Dermatology',
      'Ophthalmology',
      'ENT',
      'Dentistry',
      'Psychiatry',
      'Radiology',
      'Laboratory',
      'Emergency',
    ],
  },
  appointmentDate: {
    type: Date,
    required: [true, 'Appointment date is required'],
  },
  appointmentTime: {
    type: String,
    required: [true, 'Appointment time is required'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time in HH:MM format'],
  },
  duration: {
    type: Number,
    default: 30, // minutes
    min: [15, 'Duration must be at least 15 minutes'],
    max: [120, 'Duration cannot exceed 120 minutes'],
  },
  type: {
    type: String,
    enum: ['Consultation', 'Follow-up', 'Procedure', 'Emergency', 'Telemedicine'],
    default: 'Consultation',
  },
  status: {
    type: String,
    enum: ['Scheduled', 'Confirmed', 'In Progress', 'Completed', 'Cancelled', 'No Show'],
    default: 'Scheduled',
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium',
  },
  reason: {
    type: String,
    required: [true, 'Reason for appointment is required'],
    trim: true,
  },
  symptoms: [String],
  notes: String,
  diagnosis: String,
  prescription: [{
    medication: String,
    dosage: String,
    frequency: String,
    duration: String,
    instructions: String,
  }],
  followUpDate: Date,
  room: String,
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
AppointmentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for better query performance
AppointmentSchema.index({ appointmentId: 1 });
AppointmentSchema.index({ patient: 1 });
AppointmentSchema.index({ doctor: 1 });
AppointmentSchema.index({ appointmentDate: 1 });
AppointmentSchema.index({ status: 1 });
AppointmentSchema.index({ department: 1 });

// Virtual for appointment end time
AppointmentSchema.virtual('endTime').get(function() {
  const startTime = this.appointmentTime.split(':');
  const startHour = parseInt(startTime[0]);
  const startMinute = parseInt(startTime[1]);

  const endMinute = startMinute + this.duration;
  const endHour = startHour + Math.floor(endMinute / 60);
  const finalMinute = endMinute % 60;

  return `${endHour.toString().padStart(2, '0')}:${finalMinute.toString().padStart(2, '0')}`;
});

// Ensure virtual fields are serialized
AppointmentSchema.set('toJSON', { virtuals: true });
AppointmentSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Appointment', AppointmentSchema);