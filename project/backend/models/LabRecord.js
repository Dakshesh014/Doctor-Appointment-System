const mongoose = require('mongoose');

const labRecordSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  testName: {
    type: String,
    required: true
  },
  testType: {
    type: String,
    enum: ['Blood Test', 'Urine Test', 'X-Ray', 'MRI', 'CT Scan', 'Ultrasound', 'Other'],
    default: 'Blood Test'
  },
  results: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Normal', 'Abnormal', 'Critical'],
    default: 'Normal'
  },
  testDate: {
    type: Date,
    required: true
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('LabRecord', labRecordSchema);