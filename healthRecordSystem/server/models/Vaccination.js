const mongoose = require('mongoose');

const vaccinationSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  vaccineName: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  dose: {
    type: String,
    required: true
  },
  nextDoseDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['Completed', 'Scheduled', 'Missed'],
    default: 'Completed'
  },
  notes: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Vaccination', vaccinationSchema);