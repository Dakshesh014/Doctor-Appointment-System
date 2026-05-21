const mongoose = require('mongoose');

const systemSettingsSchema = new mongoose.Schema({
  clinicianRegistration: {
    type: Boolean,
    default: true
  },
  patientSelfOnboarding: {
    type: Boolean,
    default: true
  },
  maintenanceMode: {
    type: Boolean,
    default: false
  },
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

module.exports = mongoose.model('SystemSettings', systemSettingsSchema);
