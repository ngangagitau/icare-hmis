const mongoose = require('mongoose');

const MedicalRecordSchema = new mongoose.Schema({
  recordId: {
    type: String,
    required: [true, 'Record ID is required'],
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
  doctor: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Doctor is required'],
  },
  visitDate: {
    type: Date,
    required: [true, 'Visit date is required'],
  },
  visitType: {
    type: String,
    enum: ['Consultation', 'Follow-up', 'Emergency', 'Procedure', 'Admission', 'Discharge'],
    default: 'Consultation',
  },
  chiefComplaint: {
    type: String,
    required: [true, 'Chief complaint is required'],
  },
  historyOfPresentIllness: String,
  vitalSigns: {
    bloodPressure: {
      systolic: Number,
      diastolic: Number,
    },
    heartRate: Number, // bpm
    temperature: Number, // celsius
    respiratoryRate: Number, // breaths per minute
    oxygenSaturation: Number, // percentage
    weight: Number, // kg
    height: Number, // cm
    bmi: Number,
  },
  physicalExamination: {
    general: String,
    cardiovascular: String,
    respiratory: String,
    gastrointestinal: String,
    genitourinary: String,
    musculoskeletal: String,
    neurological: String,
    psychiatric: String,
    other: String,
  },
  assessment: {
    primaryDiagnosis: String,
    secondaryDiagnoses: [String],
    differentialDiagnosis: [String],
  },
  plan: {
    medications: [{
      medication: String,
      dosage: String,
      frequency: String,
      duration: String,
      instructions: String,
    }],
    procedures: [{
      procedure: String,
      date: Date,
      notes: String,
    }],
    followUp: {
      date: Date,
      instructions: String,
    },
    referrals: [{
      specialty: String,
      reason: String,
      urgency: {
        type: String,
        enum: ['Routine', 'Urgent', 'ASAP'],
      },
    }],
    lifestyleModifications: String,
    patientEducation: String,
  },
  laboratoryResults: [{
    testName: String,
    testDate: Date,
    result: String,
    unit: String,
    referenceRange: String,
    abnormal: Boolean,
    notes: String,
  }],
  imagingResults: [{
    studyType: String,
    studyDate: Date,
    findings: String,
    impression: String,
    recommendations: String,
  }],
  progressNotes: [{
    date: Date,
    note: String,
    author: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
  }],
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
  status: {
    type: String,
    enum: ['Draft', 'Final', 'Amended'],
    default: 'Draft',
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

// Update the updatedAt field before saving
MedicalRecordSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for better query performance
MedicalRecordSchema.index({ recordId: 1 });
MedicalRecordSchema.index({ patient: 1 });
MedicalRecordSchema.index({ doctor: 1 });
MedicalRecordSchema.index({ visitDate: 1 });
MedicalRecordSchema.index({ 'assessment.primaryDiagnosis': 1 });

// Virtual for BMI calculation
MedicalRecordSchema.virtual('calculatedBMI').get(function() {
  if (this.vitalSigns.height && this.vitalSigns.weight) {
    const heightInMeters = this.vitalSigns.height / 100;
    return (this.vitalSigns.weight / (heightInMeters * heightInMeters)).toFixed(1);
  }
  return null;
});

// Ensure virtual fields are serialized
MedicalRecordSchema.set('toJSON', { virtuals: true });
MedicalRecordSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('MedicalRecord', MedicalRecordSchema);