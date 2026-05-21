const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['patient', 'doctor', 'admin', 'superadmin'],
    default: 'patient'
  },
  // Approval fields
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: function() {
      return this.role === 'patient' ? 'approved' : 'pending';
    }
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  approvedAt: {
    type: Date,
    default: null
  },
  rejectionReason: {
    type: String,
    default: ''
  },
  // ✅ ACTIVITY TRACKING FIELDS
  isOnline: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date,
    default: null
  },
  lastLogout: {
    type: Date,
    default: null
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  lastActivityIP: {
    type: String,
    default: ''
  },
  // Other fields
  phone: {
    type: String,
    default: ''
  },
  dateOfBirth: {
    type: Date
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other', ''],
    default: ''
  },
  address: {
    type: String,
    default: ''
  },
  bloodType: {
    type: String,
    default: ''
  },
  allergies: {
    type: String,
    default: ''
  },
  emergencyContact: {
    type: String,
    default: ''
  },
  profileImage: {
    type: String,
    default: ''
  },
  // Doctor specific fields
  specialization: {
    type: String,
    default: ''
  },
  licenseNumber: {
    type: String,
    default: ''
  },
  experience: {
    type: Number,
    default: 0
  },
  qualification: {
    type: String,
    default: ''
  },
  prescriptionTemplate: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Password comparison method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;