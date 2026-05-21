const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  visitDate: {
    type: Date,
    required: true
  },
  doctorName: {
    type: String,
    required: true
  },
  diagnosis: {
    type: String
  },
  symptoms: {
    type: String
  },
  treatment: {
    type: String
  },
  notes: {
    type: String
  },
  vitals: {
    bloodPressure: String,
    heartRate: String,
    temperature: String,
    weight: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);