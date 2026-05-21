const mongoose = require('mongoose');

const labResultSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  testName: {
    type: String,
    required: true
  },
  testDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['Normal', 'Abnormal', 'Pending'],
    default: 'Pending'
  },
  results: {
    type: String
  },
  doctorNotes: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('LabResult', labResultSchema);