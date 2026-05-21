const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Billing = require('../models/Billing');
const ActivityLog = require('../models/ActivityLog');
const { logActivity } = require('../utils/activityLogger');

// Get Dashboard Summary (REAL DATA)
exports.getDashboardSummary = async (req, res) => {
  try {
    const totalAdmins = await User.countDocuments({ role: 'admin', status: 'approved' });
    const totalDoctors = await User.countDocuments({ role: 'doctor', status: 'approved' });
    const totalPatients = await User.countDocuments({ role: 'patient' });
    const securityAlerts = await ActivityLog.countDocuments({ 
      action: { $in: ['user_reject', 'user_delete'] } 
    });
    const auditLogs = await ActivityLog.countDocuments();
    
    res.json({
      totalAdmins,
      totalDoctors,
      totalPatients,
      securityAlerts,
      auditLogs
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Pending Admins (FOR APPROVAL)
exports.getPendingAdmins = async (req, res) => {
  try {
    const pendingAdmins = await User.find({ 
      role: 'admin', 
      status: 'pending' 
    })
    .select('-password')
    .sort({ createdAt: -1 });
    
    res.json(pendingAdmins);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Pending Doctors (FOR APPROVAL)
exports.getPendingDoctors = async (req, res) => {
  try {
    const pendingDoctors = await User.find({ 
      role: 'doctor', 
      status: 'pending' 
    })
    .select('-password')
    .sort({ createdAt: -1 });
    
    res.json(pendingDoctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Security Alerts (REAL DATA)
exports.getSecurityAlerts = async (req, res) => {
  try {
    const alerts = await ActivityLog.find({
      action: { $in: ['user_reject', 'user_delete', 'login'] }
    })
    .populate('user', 'name email')
    .populate('targetUser', 'name email')
    .sort({ createdAt: -1 })
    .limit(10);

    const formattedAlerts = alerts.map(alert => ({
      id: alert._id,
      severity: alert.action === 'user_delete' ? 'high' : 'medium',
      ip: alert.ipAddress || 'Unknown',
      message: alert.description,
      date: alert.createdAt.toLocaleString(),
      user: alert.user ? alert.user.name : 'Unknown'
    }));
    
    res.json(formattedAlerts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// Get All Admins
exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await User.find({ role: 'admin' })
      .populate('approvedBy', 'name email role')
      .select('-password')
      .sort({ createdAt: -1 });
    
    res.json(admins);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All Doctors
exports.getAllDoctors = async (req, res) => {
  try {
    const doctors = await User.find({ role: 'doctor' })
      .populate('approvedBy', 'name email role')
      .select('-password')
      .sort({ createdAt: -1 });
    
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All Patients
exports.getAllPatients = async (req, res) => {
  try {
    const patients = await User.find({ role: 'patient' })
      .select('-password')
      .sort({ createdAt: -1 });
    
    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Approve Admin
exports.approveAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const superadminId = req.user.id;
    
    const admin = await User.findByIdAndUpdate(
      id,
      { 
        status: 'approved',
        approvedBy: superadminId,
        approvedAt: new Date()
      },
      { new: true }
    ).select('-password');
    
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    const superadmin = await User.findById(superadminId).select('name email role');

    await logActivity(
      superadminId, 
      'user_approve', 
      `SuperAdmin approved admin: ${admin.name}`,
      admin._id,
      { adminEmail: admin.email },
      req
    );
    
    res.json({ 
      message: 'Admin approved successfully',
      admin,
      approvedBy: superadmin
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Approve Doctor (SuperAdmin can also approve doctors)
exports.approveDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const superadminId = req.user.id;
    
    const doctor = await User.findByIdAndUpdate(
      id,
      { 
        status: 'approved',
        approvedBy: superadminId,
        approvedAt: new Date()
      },
      { new: true }
    ).select('-password');
    
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    const superadmin = await User.findById(superadminId).select('name email role');

    await logActivity(
      superadminId, 
      'user_approve', 
      `SuperAdmin approved doctor: ${doctor.name}`,
      doctor._id,
      { doctorEmail: doctor.email },
      req
    );
    
    res.json({ 
      message: 'Doctor approved successfully',
      doctor,
      approvedBy: superadmin
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reject Admin
exports.rejectAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const superadminId = req.user.id;
    
    const admin = await User.findByIdAndUpdate(
      id,
      { 
        status: 'rejected',
        rejectionReason: reason || 'No reason provided'
      },
      { new: true }
    ).select('-password');
    
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    await logActivity(
      superadminId, 
      'user_reject', 
      `SuperAdmin rejected admin: ${admin.name}`,
      admin._id,
      { reason },
      req
    );
    
    res.json({ 
      message: 'Admin rejected',
      admin
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Admin
exports.deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const superadminId = req.user.id;
    
    const admin = await User.findByIdAndDelete(id);
    
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    await logActivity(
      superadminId, 
      'user_delete', 
      `SuperAdmin deleted admin: ${admin.name}`,
      admin._id,
      { email: admin.email },
      req
    );
    
    res.json({ message: 'Admin deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Doctor
exports.deleteDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const superadminId = req.user.id;
    
    const doctor = await User.findByIdAndDelete(id);
    
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    await logActivity(
      superadminId, 
      'user_delete', 
      `SuperAdmin deleted doctor: ${doctor.name}`,
      doctor._id,
      { email: doctor.email },
      req
    );
    
    res.json({ message: 'Doctor deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Patient
exports.deletePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const superadminId = req.user.id;
    
    const patient = await User.findByIdAndDelete(id);
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    await logActivity(
      superadminId, 
      'user_delete', 
      `SuperAdmin deleted patient: ${patient.name}`,
      patient._id,
      { email: patient.email },
      req
    );
    
    res.json({ message: 'Patient deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Audit Logs (REAL DATA)
exports.getAuditLogs = async (req, res) => {
  try {
    const logs = await ActivityLog.find()
      .populate('user', 'name email role')
      .populate('targetUser', 'name email')
      .sort({ createdAt: -1 })
      .limit(100);
    
    const formattedLogs = logs.map(log => ({
      _id: log._id,
      action: log.action,
      userName: log.user ? log.user.name : 'Unknown',
      userRole: log.user ? log.user.role : 'unknown',
      ipAddress: log.ipAddress || 'Unknown',
      description: log.description,
      createdAt: log.createdAt,
      targetUser: log.targetUser ? log.targetUser.name : null
    }));
    
    res.json(formattedLogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// missing stubs for superadminRoutes
exports.getAllMessages = async (req, res) => res.json([]);
exports.getUnreadCount = async (req, res) => res.json({ count: 0 });
exports.getMessagesByConversation = async (req, res) => res.json([]);
exports.exportMessagesToPDF = async (req, res) => res.json({ message: 'Not implemented' });
exports.getMessageStatistics = async (req, res) => res.json({});
exports.getMessageThread = async (req, res) => res.json([]);
exports.sendMessage = async (req, res) => res.json({ message: 'Not implemented' });
exports.editMessage = async (req, res) => res.json({ message: 'Not implemented' });
exports.markMessageRead = async (req, res) => res.json({ message: 'Not implemented' });
exports.replyToMessage = async (req, res) => res.json({ message: 'Not implemented' });

module.exports = exports;