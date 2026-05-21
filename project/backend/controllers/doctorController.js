const path = require('path');
const fs = require('fs');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Prescription = require('../models/Prescription');
const LabRecord = require('../models/LabRecord');
const VisitHistory = require('../models/VisitHistory');
const Message = require('../models/Message');
const Billing = require('../models/Billing');
const { logActivity } = require('../utils/activityLogger');

// ==================== DASHBOARD ====================

// Get Doctor Dashboard Summary
exports.getDashboardSummary = async (req, res) => {
  try {
    const doctorId = req.user.id;

    // Total appointments
    const totalAppointments = await Appointment.countDocuments({ doctor: doctorId });
    
    // Pending appointments
    const pendingAppointments = await Appointment.countDocuments({ 
      doctor: doctorId, 
      status: 'pending' 
    });
    
    // Today's appointments
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayAppointments = await Appointment.countDocuments({
      doctor: doctorId,
      date: { $gte: today, $lt: tomorrow },
      status: { $in: ['pending', 'confirmed'] }
    });
    
    // Total unique patients
    const totalPatients = await Appointment.distinct('patient', { doctor: doctorId });

    // Completed appointments this month
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const completedThisMonth = await Appointment.countDocuments({
      doctor: doctorId,
      status: 'completed',
      date: { $gte: firstDayOfMonth }
    });

    res.json({
      totalAppointments,
      pendingAppointments,
      todayAppointments,
      totalPatients: totalPatients.length,
      completedThisMonth
    });
  } catch (error) {
    console.error('Dashboard summary error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== APPOINTMENTS ====================

// Get Doctor's Appointments
exports.getAppointments = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { status } = req.query;

    let query = { doctor: doctorId };
    if (status) {
      query.status = status;
    }

    const appointments = await Appointment.find(query)
      .populate('patient', 'name email phone bloodType gender profileImage dateOfBirth')
      .sort({ date: -1 });

    res.json(appointments);
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get Today's Appointments
exports.getTodayAppointments = async (req, res) => {
  try {
    const doctorId = req.user.id;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const appointments = await Appointment.find({
      doctor: doctorId,
      date: { $gte: today, $lt: tomorrow },
      status: { $in: ['pending', 'confirmed'] }
    })
    .populate('patient', 'name email phone profileImage bloodType')
    .sort({ time: 1 });

    res.json(appointments);
  } catch (error) {
    console.error('Get today appointments error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get Pending Appointments
exports.getPendingAppointments = async (req, res) => {
  try {
    const doctorId = req.user.id;

    const appointments = await Appointment.find({
      doctor: doctorId,
      status: 'pending'
    })
    .populate('patient', 'name email phone profileImage bloodType gender')
    .sort({ date: 1 });

    res.json(appointments);
  } catch (error) {
    console.error('Get pending appointments error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get Single Appointment
exports.getSingleAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const doctorId = req.user.id;

    const appointment = await Appointment.findOne({
      _id: id,
      doctor: doctorId
    })
    .populate('patient', 'name email phone bloodType gender dateOfBirth allergies medicalHistory');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.json(appointment);
  } catch (error) {
    console.error('Get single appointment error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Accept Appointment
exports.acceptAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const doctorId = req.user.id;
    const { notes, videoLink } = req.body;

    const appointment = await Appointment.findOne({
      _id: id,
      doctor: doctorId,
      status: 'pending'
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found or already processed' });
    }

    appointment.status = 'confirmed';
    if (notes) appointment.notes = notes;
    if (videoLink && appointment.type === 'Video') {
      appointment.videoLink = videoLink;
    }

    await appointment.save();

    // Log activity
    await logActivity(
      doctorId,
      'appointment_update',
      `Doctor confirmed appointment`,
      appointment.patient,
      { appointmentId: id, status: 'confirmed' },
      req
    );

    res.json({
      message: 'Appointment confirmed successfully!',
      appointment
    });
  } catch (error) {
    console.error('Accept appointment error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Reject Appointment
exports.rejectAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const doctorId = req.user.id;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }

    const appointment = await Appointment.findOne({
      _id: id,
      doctor: doctorId
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    appointment.status = 'rejected';
    appointment.rejectionReason = reason;

    await appointment.save();

    // Log activity
    await logActivity(
      doctorId,
      'appointment_update',
      `Doctor rejected appointment`,
      appointment.patient,
      { appointmentId: id, reason },
      req
    );

    res.json({
      message: 'Appointment rejected',
      appointment
    });
  } catch (error) {
    console.error('Reject appointment error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Complete Appointment
exports.completeAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const doctorId = req.user.id;

    const appointment = await Appointment.findOne({
      _id: id,
      doctor: doctorId
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    appointment.status = 'completed';
    await appointment.save();

    // Log activity
    await logActivity(
      doctorId,
      'appointment_update',
      `Doctor completed appointment`,
      appointment.patient,
      { appointmentId: id },
      req
    );

    res.json({ message: 'Appointment marked as completed' });
  } catch (error) {
    console.error('Complete appointment error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== PATIENTS ====================

// Get Doctor's Patients
exports.getPatients = async (req, res) => {
  try {
    const doctorId = req.user.id;

    // Get unique patient IDs from appointments
    const patientIds = await Appointment.distinct('patient', { doctor: doctorId });
    
    // Get patient details
    const patients = await User.find({
      _id: { $in: patientIds },
      role: 'patient'
    }).select('name email phone bloodType gender profileImage dateOfBirth allergies');

    res.json(patients);
  } catch (error) {
    console.error('Get patients error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get Single Patient Details
exports.getSinglePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const doctorId = req.user.id;

    // Verify doctor has treated this patient
    const hasAppointment = await Appointment.findOne({
      doctor: doctorId,
      patient: id
    });

    if (!hasAppointment) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const patient = await User.findById(id)
      .select('-password');

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Get patient's visit history with this doctor
    const visits = await VisitHistory.find({
      patient: id,
      doctor: doctorId
    }).sort({ visitDate: -1 }).limit(5);

    // Get patient's prescriptions from this doctor
    const prescriptions = await Prescription.find({
      patient: id,
      doctor: doctorId
    }).sort({ createdAt: -1 }).limit(5);

    res.json({
      patient,
      recentVisits: visits,
      recentPrescriptions: prescriptions
    });
  } catch (error) {
    console.error('Get single patient error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== PRESCRIPTIONS ====================

// Add Prescription
exports.addPrescription = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { patient, appointment, medications, diagnosis, notes, validUntil } = req.body;

    if (!patient || !medications || !diagnosis) {
      return res.status(400).json({ message: 'Required fields missing' });
    }

    const prescription = new Prescription({
      patient,
      doctor: doctorId,
      appointment,
      medications,
      diagnosis,
      notes,
      validUntil
    });

    await prescription.save();

    // Log activity
    await logActivity(
      doctorId,
      'prescription_create',
      `Doctor added prescription for patient`,
      patient,
      { prescriptionId: prescription._id },
      req
    );

    res.status(201).json({
      message: 'Prescription added successfully',
      prescription
    });
  } catch (error) {
    console.error('Add prescription error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get Doctor's Prescriptions
exports.getPrescriptions = async (req, res) => {
  try {
    const doctorId = req.user.id;

    const prescriptions = await Prescription.find({ doctor: doctorId })
      .populate('patient', 'name email')
      .sort({ createdAt: -1 });

    res.json(prescriptions);
  } catch (error) {
    console.error('Get prescriptions error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== LAB RECORDS ====================

// Add Lab Record
exports.addLabRecord = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { patient, testName, testType, results, status, testDate, notes } = req.body;

    if (!patient || !testName || !testType || !results) {
      return res.status(400).json({ message: 'Required fields missing' });
    }

    const labRecord = new LabRecord({
      patient,
      doctor: doctorId,
      testName,
      testType,
      results,
      status,
      testDate: testDate || new Date(),
      notes
    });

    await labRecord.save();

    // Log activity
    await logActivity(
      doctorId,
      'lab_record_create',
      `Doctor added lab record for patient`,
      patient,
      { labRecordId: labRecord._id },
      req
    );

    res.status(201).json({
      message: 'Lab record added successfully',
      labRecord
    });
  } catch (error) {
    console.error('Add lab record error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get Doctor's Lab Records
exports.getLabRecords = async (req, res) => {
  try {
    const doctorId = req.user.id;

    const labRecords = await LabRecord.find({ doctor: doctorId })
      .populate('patient', 'name email')
      .sort({ testDate: -1 });

    res.json(labRecords);
  } catch (error) {
    console.error('Get lab records error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== VISIT HISTORY ====================

// Add Visit History
exports.addVisitHistory = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const {
      patient,
      appointment,
      visitDate,
      chiefComplaint,
      vitals,
      diagnosis,
      treatment,
      doctorNotes,
      followUpDate
    } = req.body;

    if (!patient || !visitDate || !chiefComplaint || !diagnosis || !treatment) {
      return res.status(400).json({ message: 'Required fields missing' });
    }

    const visit = new VisitHistory({
      patient,
      doctor: doctorId,
      appointment,
      visitDate,
      chiefComplaint,
      vitals,
      diagnosis,
      treatment,
      doctorNotes,
      followUpDate
    });

    await visit.save();

    // Log activity
    await logActivity(
      doctorId,
      'visit_create',
      `Doctor added visit record for patient`,
      patient,
      { visitId: visit._id },
      req
    );

    res.status(201).json({
      message: 'Visit history added successfully',
      visit
    });
  } catch (error) {
    console.error('Add visit history error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get Doctor's Visit History
exports.getVisitHistory = async (req, res) => {
  try {
    const doctorId = req.user.id;

    const visits = await VisitHistory.find({ doctor: doctorId })
      .populate('patient', 'name email')
      .sort({ visitDate: -1 });

    res.json(visits);
  } catch (error) {
    console.error('Get visit history error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== MESSAGES ====================

// Get Messages
exports.getMessages = async (req, res) => {
  try {
    const doctorId = req.user.id;

    const messages = await Message.find({
      $or: [
        { sender: doctorId },
        { recipient: doctorId }
      ]
    })
    .populate('sender', 'name role')
    .populate('recipient', 'name role')
    .sort({ createdAt: -1 });

    res.json(messages);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Send Message
exports.sendMessage = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { recipient, subject, message } = req.body;

    if (!recipient || !subject || !message) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const newMessage = new Message({
      sender: doctorId,
      recipient,
      subject,
      message
    });

    await newMessage.save();

    res.status(201).json({
      message: 'Message sent successfully',
      data: newMessage
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== PROFILE ====================

// Get Doctor Profile
exports.getProfile = async (req, res) => {
  try {
    const doctorId = req.user.id;

    const doctor = await User.findById(doctorId).select('-password');

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    res.json(doctor);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update Doctor Profile
exports.updateProfile = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const updates = req.body;

    // Remove fields that shouldn't be updated
    delete updates.email;
    delete updates.role;
    delete updates.password;
    delete updates.status;

    const doctor = await User.findByIdAndUpdate(
      doctorId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Log activity
    await logActivity(
      doctorId,
      'profile_update',
      'Doctor updated profile',
      null,
      { fields: Object.keys(updates) },
      req
    );

    res.json({
      message: 'Profile updated successfully',
      doctor
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== BILLING ====================

// Get Doctor's Billing Records
exports.getBilling = async (req, res) => {
  try {
    const doctorId = req.user.id;

    const billingRecords = await Billing.find({ doctorId })
      .populate('patientId', 'name email')
      .sort({ date: -1 });

    res.json(billingRecords);
  } catch (error) {
    console.error('Get billing records error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== STATISTICS ====================

// Get Doctor Statistics
exports.getStatistics = async (req, res) => {
  try {
    const doctorId = req.user.id;

    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const firstDayOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));

    // This month stats
    const thisMonthAppointments = await Appointment.countDocuments({
      doctor: doctorId,
      date: { $gte: firstDayOfMonth }
    });

    const thisMonthCompleted = await Appointment.countDocuments({
      doctor: doctorId,
      date: { $gte: firstDayOfMonth },
      status: 'completed'
    });

    // This week stats
    const thisWeekAppointments = await Appointment.countDocuments({
      doctor: doctorId,
      date: { $gte: firstDayOfWeek }
    });

    // Total prescriptions
    const totalPrescriptions = await Prescription.countDocuments({ doctor: doctorId });

    // Total lab records
    const totalLabRecords = await LabRecord.countDocuments({ doctor: doctorId });

    res.json({
      thisMonthAppointments,
      thisMonthCompleted,
      thisWeekAppointments,
      totalPrescriptions,
      totalLabRecords
    });
  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get Message Thread
exports.getMessageThread = async (req, res) => {
  try {
    const { id } = req.params;
    const doctorId = req.user.id;

    const thread = await Message.find({
      $or: [
        { sender: doctorId, recipient: id },
        { sender: id, recipient: doctorId }
      ]
    })
    .populate('sender', 'name role profileImage')
    .populate('recipient', 'name role profileImage')
    .sort({ createdAt: 1 });

    res.json(thread);
  } catch (error) {
    console.error('Get message thread error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get Unread Messages Count
exports.getUnreadMessagesCount = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const count = await Message.countDocuments({
      recipient: doctorId,
      read: false
    });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.editMessage = async (req, res) => res.json({ message: 'Not implemented' });
exports.markMessageRead = async (req, res) => {
  try {
    const { id } = req.params;
    await Message.findByIdAndUpdate(id, { read: true });
    res.json({ message: 'Message marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.replyToMessage = async (req, res) => res.json({ message: 'Not implemented' });
exports.markReplyRead = async (req, res) => res.json({ message: 'Not implemented' });
exports.deleteMessage = async (req, res) => res.json({ message: 'Not implemented' });

// ==================== PROFILE MEDIA ====================

// Upload Profile Image
exports.uploadProfileImage = async (req, res) => {
  try {
    const doctorId = req.user.id;
    
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const imagePath = `/uploads/profiles/${req.file.filename}`;
    
    // Check if old image exists and delete it
    const doctorOld = await User.findById(doctorId);
    if (doctorOld.profileImage) {
      const oldPath = path.join(__dirname, '..', doctorOld.profileImage);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    const doctor = await User.findByIdAndUpdate(
      doctorId,
      { profileImage: imagePath },
      { new: true }
    ).select('-password');

    res.json({
      message: 'Profile image updated successfully',
      doctor
    });
  } catch (error) {
    console.error('Upload profile image error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Delete Profile Image
exports.deleteProfileImage = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const doctor = await User.findById(doctorId);

    if (doctor.profileImage) {
      const filePath = path.join(__dirname, '..', doctor.profileImage);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    doctor.profileImage = '';
    await doctor.save();

    res.json({ message: 'Profile image deleted successfully' });
  } catch (error) {
    console.error('Delete profile image error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Upload Prescription Template
exports.uploadPrescriptionTemplate = async (req, res) => {
  try {
    const doctorId = req.user.id;
    
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const templatePath = `/uploads/templates/${req.file.filename}`;
    
    // Check if old template exists and delete it
    const doctorOld = await User.findById(doctorId);
    if (doctorOld.prescriptionTemplate) {
      const oldPath = path.join(__dirname, '..', doctorOld.prescriptionTemplate);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    const doctor = await User.findByIdAndUpdate(
      doctorId,
      { prescriptionTemplate: templatePath },
      { new: true }
    ).select('-password');

    res.json({
      message: 'Prescription template uploaded successfully',
      doctor
    });
  } catch (error) {
    console.error('Upload template error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Delete Prescription Template
exports.deletePrescriptionTemplate = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const doctor = await User.findById(doctorId);

    if (doctor.prescriptionTemplate) {
      const filePath = path.join(__dirname, '..', doctor.prescriptionTemplate);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    doctor.prescriptionTemplate = '';
    await doctor.save();

    res.json({ message: 'Prescription template deleted successfully' });
  } catch (error) {
    console.error('Delete template error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== SETTINGS ====================

// Get Doctor Settings
exports.getSettings = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const doctor = await User.findById(doctorId).select('emailNotifications smsNotifications appointmentReminders newsletterSubscription');
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    res.json({
      emailNotifications: doctor.emailNotifications !== undefined ? doctor.emailNotifications : true,
      smsNotifications: doctor.smsNotifications !== undefined ? doctor.smsNotifications : false,
      appointmentReminders: doctor.appointmentReminders !== undefined ? doctor.appointmentReminders : true,
      newsletterSubscription: doctor.newsletterSubscription !== undefined ? doctor.newsletterSubscription : false
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update Doctor Settings
exports.updateSettings = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { emailNotifications, smsNotifications, appointmentReminders, newsletterSubscription } = req.body;
    const updates = {};
    if (emailNotifications !== undefined) updates.emailNotifications = emailNotifications;
    if (smsNotifications !== undefined) updates.smsNotifications = smsNotifications;
    if (appointmentReminders !== undefined) updates.appointmentReminders = appointmentReminders;
    if (newsletterSubscription !== undefined) updates.newsletterSubscription = newsletterSubscription;
    await User.findByIdAndUpdate(doctorId, { $set: updates }, { new: true });
    res.json({ message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Change Password
exports.changePassword = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ message: 'Both current and new password are required' });
    if (newPassword.length < 6) return res.status(400).json({ message: 'New password must be at least 6 characters' });
    const bcrypt = require('bcryptjs');
    const doctor = await User.findById(doctorId);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    const isMatch = await bcrypt.compare(currentPassword, doctor.password);
    if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect' });
    const salt = await bcrypt.genSalt(10);
    doctor.password = await bcrypt.hash(newPassword, salt);
    await doctor.save();
    await logActivity(doctorId, 'password_change', 'Doctor changed their password', null, {}, req);
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== DIAGNOSES (from visit history) ====================

exports.getDiagnoses = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const visits = await VisitHistory.find({ doctor: doctorId, diagnosis: { $exists: true, $ne: '' } })
      .populate('patient', 'name email profileImage bloodType gender')
      .sort({ visitDate: -1 });
    res.json(visits);
  } catch (error) {
    console.error('Get diagnoses error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== TREATMENT PLANS (from visit history) ====================

exports.getTreatmentPlans = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const visits = await VisitHistory.find({ doctor: doctorId, treatment: { $exists: true, $ne: '' } })
      .populate('patient', 'name email profileImage bloodType gender')
      .sort({ visitDate: -1 });
    res.json(visits);
  } catch (error) {
    console.error('Get treatment plans error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = exports;