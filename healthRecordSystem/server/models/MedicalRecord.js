const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  visitDate: {
    type: Date,
    default: Date.now,
    required: true
  },
  diagnosis: {
    type: String,
    required: true,
    trim: true
  },
  symptoms: [String],
  prescription: {
    medications: [{
      name: String,
      dosage: String,
      frequency: String,
      duration: String
    }],
    tests: [String],
    recommendations: [String]
  },
  doctorNotes: {
    type: String,
    trim: true
  },
  followUpDate: Date,
  severity: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Low'
  }
}, {
  timestamps: true
});

medicalRecordSchema.index({ patientId: 1, visitDate: -1 });
medicalRecordSchema.index({ diagnosis: 1 });

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);