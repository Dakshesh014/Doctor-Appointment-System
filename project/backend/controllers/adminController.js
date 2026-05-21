const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Billing = require('../models/Billing');
const LabRecord = require('../models/LabRecord');
const MedicalRecord = require('../models/MedicalRecord');
const Prescription = require('../models/Prescription');
const Message = require('../models/Message');
const SystemSettings = require('../models/SystemSettings');
const ActivityLog = require('../models/ActivityLog');
const Notification = require('../models/Notification');
const { logActivity } = require('../utils/activityLogger');
const { Parser } = require('json2csv');
const bcrypt = require('bcryptjs');

// ==================== DASHBOARD & STATISTICS ====================

// Get Dashboard Summary (REAL DATA)
exports.getDashboardSummary = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalPatients = await User.countDocuments({ role: 'patient' });
    const totalDoctors = await User.countDocuments({ role: 'doctor', status: 'approved' });
    const totalAppointments = await Appointment.countDocuments();
    const pendingAppointments = await Appointment.countDocuments({ status: 'pending' });
    const completedAppointments = await Appointment.countDocuments({ status: 'completed' });
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    const dailyAppointments = await Appointment.countDocuments({ createdAt: { $gte: today } });
    const monthlyAppointments = await Appointment.countDocuments({ createdAt: { $gte: firstDayOfMonth } });
    
    const billingData = await Billing.find({ type: 'bill' });
    const totalRevenue = billingData.reduce((sum, bill) => sum + (bill.amount || 0), 0);
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyBilling = await Billing.find({
      type: 'bill',
      createdAt: {
        $gte: new Date(currentYear, currentMonth, 1),
        $lt: new Date(currentYear, currentMonth + 1, 1)
      }
    });
    const monthlyRevenue = monthlyBilling.reduce((sum, bill) => sum + (bill.amount || 0), 0);
    
    res.json({
      totalUsers,
      totalPatients,
      totalDoctors,
      totalAppointments,
      pendingAppointments,
      completedAppointments,
      dailyAppointments,
      monthlyAppointments,
      totalRevenue: totalRevenue.toFixed(2),
      monthlyRevenue: monthlyRevenue.toFixed(2)
    });
  } catch (error) {
    console.error('Get dashboard summary error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get Recent Users (REAL DATA)
exports.getRecentUsers = async (req, res) => {
  try {
    const recentUsers = await User.find()
      .select('name email role createdAt profileImage')
      .sort({ createdAt: -1 })
      .limit(5);
    
    res.json(recentUsers);
  } catch (error) {
    console.error('Get recent users error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get Recent Appointments (REAL DATA)
exports.getRecentAppointments = async (req, res) => {
  try {
    const recentAppointments = await Appointment.find()
      .populate('patient', 'name')
      .populate('doctor', 'name')
      .sort({ createdAt: -1 })
      .limit(5);
    
    res.json(recentAppointments);
  } catch (error) {
    console.error('Get recent appointments error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get Revenue Chart Data (REAL DATA - Last 6 Months)
exports.getRevenueChart = async (req, res) => {
  try {
    const monthlyData = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      
      const monthLabel = month.toLocaleString('default', { month: 'short' });
      
      const monthlyBilling = await Billing.find({
        type: 'bill',
        createdAt: { $gte: month, $lt: nextMonth }
      });
      
      const revenue = monthlyBilling.reduce((sum, bill) => sum + (bill.amount || 0), 0);
      
      monthlyData.push({
        month: monthLabel,
        revenue: parseFloat(revenue.toFixed(2))
      });
    }
    
    res.json(monthlyData);
  } catch (error) {
    console.error('Get revenue chart error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get System Stats (Health Monitor)
exports.getSystemStats = async (req, res) => {
  try {
    // Mocking some system stats for health monitor
    res.json({
      uptime: '99.99%',
      cpuLoad: '12%',
      memoryUsed: '1.2 GB / 4 GB',
      storageUsed: '2.4 / 10 GB',
      dbStatus: 'Healthy',
      lastBackup: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Get System Stats (REAL DATA)
exports.getSystemStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ status: 'approved' });
    
    res.json({
      serverStatus: 'Online',
      database: 'Connected',
      activeSessions: activeUsers,
      storageUsed: '2.4 GB / 10 GB',
      lastBackup: '2 hours ago'
    });
  } catch (error) {
    console.error('Get system stats error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== ONLINE USERS TRACKING ====================

// Get Online Users
exports.getOnlineUsers = async (req, res) => {
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    const onlineUsers = await User.find({
      isOnline: true,
      lastActivity: { $gte: fiveMinutesAgo }
    })
    .select('name email role lastActivity isOnline profileImage')
    .sort({ lastActivity: -1 });

    res.json(onlineUsers);
  } catch (error) {
    console.error('Get online users error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get Recently Left Users
exports.getRecentlyLeftUsers = async (req, res) => {
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const recentlyLeftUsers = await User.find({
      isOnline: false,
      lastLogout: { $gte: twentyFourHoursAgo }
    })
    .select('name email role lastLogout lastActivity profileImage')
    .sort({ lastLogout: -1 })
    .limit(10);

    res.json(recentlyLeftUsers);
  } catch (error) {
    console.error('Get recently left users error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get Online Doctors
exports.getOnlineDoctors = async (req, res) => {
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    const onlineDoctors = await User.find({
      role: 'doctor',
      status: 'approved',
      isOnline: true,
      lastActivity: { $gte: fiveMinutesAgo }
    })
    .select('name email specialization lastActivity isOnline profileImage')
    .sort({ lastActivity: -1 });

    res.json(onlineDoctors);
  } catch (error) {
    console.error('Get online doctors error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== USER MANAGEMENT ====================

// Get All Users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });
    
    res.json(users);
  } catch (error) {
    console.error('Get all users error:', error);
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
    console.error('Get pending doctors error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Approve Doctor
exports.approveDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;
    
    const doctor = await User.findByIdAndUpdate(
      id,
      { 
        status: 'approved',
        approvedBy: adminId,
        approvedAt: new Date()
      },
      { new: true }
    ).select('-password');
    
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    const admin = await User.findById(adminId).select('name email role');

    await logActivity(
      adminId, 
      'user_approve', 
      `Admin approved doctor: ${doctor.name}`,
      doctor._id,
      { doctorEmail: doctor.email },
      req
    );
    
    res.json({ 
      message: 'Doctor approved successfully',
      doctor,
      approvedBy: admin
    });
  } catch (error) {
    console.error('Approve doctor error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Reject Doctor
exports.rejectDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const adminId = req.user.id;
    
    const doctor = await User.findByIdAndUpdate(
      id,
      { 
        status: 'rejected',
        rejectionReason: reason || 'No reason provided'
      },
      { new: true }
    ).select('-password');
    
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    await logActivity(
      adminId, 
      'user_reject', 
      `Admin rejected doctor: ${doctor.name}`,
      doctor._id,
      { reason },
      req
    );
    
    res.json({ 
      message: 'Doctor rejected',
      doctor
    });
  } catch (error) {
    console.error('Reject doctor error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Create User
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const adminId = req.user.id;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      status: 'approved'
    });
    
    await user.save();

    await logActivity(
      adminId, 
      'register', 
      `Admin created new user: ${name} (${role})`,
      user._id,
      { role },
      req
    );
    
    res.status(201).json({ 
      message: 'User created successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update User
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;
    const updates = req.body;
    
    // Don't allow password updates through this endpoint
    delete updates.password;
    
    const user = await User.findByIdAndUpdate(id, updates, { new: true })
      .select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await logActivity(
      adminId, 
      'profile_update', 
      `Admin updated user: ${user.name}`,
      user._id,
      updates,
      req
    );
    
    res.json({ 
      message: 'User updated successfully',
      user
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Delete User
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;
    
    const user = await User.findByIdAndDelete(id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await logActivity(
      adminId, 
      'user_delete', 
      `Admin deleted user: ${user.name} (${user.role})`,
      user._id,
      { email: user.email },
      req
    );
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== APPOINTMENTS MANAGEMENT ====================

// Get All Appointments
exports.getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('patient', 'name email phone')
      .populate('doctor', 'name email specialization')
      .sort({ date: -1 });
    
    res.json(appointments);
  } catch (error) {
    console.error('Get all appointments error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get Appointments (with optional status filter) - FOR ADMIN VIEW
exports.getAppointments = async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};
    
    if (status) {
      query.status = status;
    }

    const appointments = await Appointment.find(query)
      .populate('patient', 'name email phone')
      .populate('doctor', 'name specialization')
      .sort({ date: -1 });

    res.json(appointments);
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Reject Appointment (Admin can reject only, not accept)
exports.rejectAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const adminId = req.user.id;

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    appointment.status = 'rejected';
    appointment.rejectionReason = reason || 'Rejected by Admin';
    await appointment.save();

    // Log activity
    await logActivity(
      adminId,
      'appointment_update',
      `Admin rejected appointment`,
      appointment.patient,
      { appointmentId: id, reason },
      req
    );

    res.json({ 
      message: 'Appointment rejected by Admin', 
      appointment 
    });
  } catch (error) {
    console.error('Reject appointment error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get Appointment Statistics
exports.getAppointmentStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const totalAppointments = await Appointment.countDocuments();
    const pendingAppointments = await Appointment.countDocuments({ status: 'pending' });
    const confirmedAppointments = await Appointment.countDocuments({ status: 'confirmed' });
    const completedAppointments = await Appointment.countDocuments({ status: 'completed' });
    const rejectedAppointments = await Appointment.countDocuments({ status: 'rejected' });
    const cancelledAppointments = await Appointment.countDocuments({ status: 'cancelled' });

    const dailyAppointments = await Appointment.countDocuments({ createdAt: { $gte: today } });
    const monthlyAppointments = await Appointment.countDocuments({ createdAt: { $gte: firstDayOfMonth } });

    res.json({
      totalAppointments,
      pendingAppointments,
      confirmedAppointments,
      completedAppointments,
      rejectedAppointments,
      cancelledAppointments,
      dailyAppointments,
      monthlyAppointments
    });
  } catch (error) {
    console.error('Get appointment stats error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update Appointment Status (Generic)
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const adminId = req.user.id;
    
    const appointment = await Appointment.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    )
    .populate('patient', 'name')
    .populate('doctor', 'name');
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    await logActivity(
      adminId, 
      'appointment_update', 
      `Admin updated appointment status to ${status}`,
      null,
      { appointmentId: id, newStatus: status },
      req
    );
    
    res.json({ 
      message: 'Appointment status updated',
      appointment
    });
  } catch (error) {
    console.error('Update appointment status error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== BILLING MANAGEMENT ====================

// Get All Billing
exports.getAllBilling = async (req, res) => {
  try {
    const billing = await Billing.find()
      .populate('patient', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(billing);
  } catch (error) {
    console.error('Get all billing error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update Billing Status
exports.updateBillingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const adminId = req.user.id;
    
    const billing = await Billing.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    )
    .populate('patient', 'name');
    
    if (!billing) {
      return res.status(404).json({ message: 'Billing record not found' });
    }

    await logActivity(
      adminId, 
      'billing_update', 
      `Admin updated billing status to ${status}`,
      null,
      { billingId: id, newStatus: status },
      req
    );
    
    res.json({ 
      message: 'Billing status updated',
      billing
    });
  } catch (error) {
    console.error('Update billing status error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== PROFILE MANAGEMENT ====================

// Get Profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update Profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const updates = req.body;
    
    // Remove fields that shouldn't be updated
    delete updates.password;
    delete updates.email;
    delete updates.role;
    delete updates.status;
    
    const user = await User.findByIdAndUpdate(userId, updates, { new: true })
      .select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await logActivity(
      userId, 
      'profile_update', 
      'Admin updated own profile',
      null,
      updates,
      req
    );
    
    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== ADMINISTRATIVE LISTS ====================

// Get All Patients
exports.getAllPatients = async (req, res) => {
  try {
    const patients = await User.find({ role: 'patient' })
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(patients);
  } catch (error) {
    console.error('Get all patients error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get All Doctors
exports.getAllDoctors = async (req, res) => {
  try {
    const doctors = await User.find({ role: 'doctor' })
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(doctors);
  } catch (error) {
    console.error('Get all doctors error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get All SuperAdmins
exports.getAllSuperAdmins = async (req, res) => {
  try {
    const superadmins = await User.find({ role: 'superadmin' })
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(superadmins);
  } catch (error) {
    console.error('Get all superadmins error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== SYSTEM RECORDS = : NEW ====================

// Get All Lab Records
exports.getAllLabRecords = async (req, res) => {
  try {
    const records = await LabRecord.find()
      .populate('patient', 'name email')
      .populate('doctor', 'name')
      .sort({ createdAt: -1 });
    res.json(records);
  } catch (error) {
    console.error('Get all lab records error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get All Medical Records
exports.getAllMedicalRecords = async (req, res) => {
  try {
    const records = await MedicalRecord.find()
      .populate('patientId', 'name email')
      .sort({ createdAt: -1 });
    res.json(records);
  } catch (error) {
    console.error('Get all medical records error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get All Prescriptions
exports.getAllPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find()
      .populate('patient', 'name email')
      .populate('doctor', 'name')
      .sort({ createdAt: -1 });
    res.json(prescriptions);
  } catch (error) {
    console.error('Get all prescriptions error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get System Notifications (Activity Logs + Broadcast Notifications)
exports.getNotifications = async (req, res) => {
  try {
    const logs = await ActivityLog.find()
      .populate('user', 'name role')
      .sort({ createdAt: -1 })
      .limit(50);

    // Format to match frontend expectations (timestamp field)
    const formatted = logs.map(log => ({
      _id: log._id,
      action: log.action,
      description: log.description,
      timestamp: log.createdAt,
      user: log.user
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Send Global Broadcast Notification
exports.sendGlobalNotification = async (req, res) => {
  try {
    const { title, message, type } = req.body;
    const adminId = req.user.id;

    if (!title || !message) {
      return res.status(400).json({ message: 'Title and message are required' });
    }

    const notification = new Notification({
      sender: adminId,
      recipient: null, // null = broadcast to all
      title,
      message,
      type: type || 'info',
      broadcast: true
    });

    await notification.save();

    await logActivity(
      adminId,
      'profile_update', // closest available enum value for admin action
      `Admin sent global broadcast: ${title}`,
      null,
      { title, messagePreview: message.substring(0, 100) },
      req
    );

    res.status(201).json({
      message: 'Global notification broadcast sent successfully',
      notification
    });
  } catch (error) {
    console.error('Send global notification error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Mark Notification as Read
exports.markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findById(id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Add userId to the isRead array if not already present
    if (!notification.isRead.map(String).includes(String(userId))) {
      notification.isRead.push(userId);
      await notification.save();
    }

    res.json({ message: 'Notification marked as read', notification });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get Reports Summary (MATCHING FRONTEND)
exports.getReportsSummary = async (req, res) => {
  try {
    const totalPatients = await User.countDocuments({ role: 'patient' });
    const totalAppointments = await Appointment.countDocuments();
    const totalMedicalRecords = await MedicalRecord.countDocuments();
    const totalLabRecords = await LabRecord.countDocuments();
    const totalPrescriptions = await Prescription.countDocuments();
    
    const billingData = await Billing.find({ type: 'bill' });
    const totalRevenue = billingData.reduce((sum, bill) => sum + (bill.amount || 0), 0);
    
    // Monthly trends for the last 6 months
    const monthlyAppointments = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const count = await Appointment.countDocuments({ createdAt: { $gte: monthStart, $lt: monthEnd } });
      monthlyAppointments.push({
        month: monthStart.toLocaleString('default', { month: 'short' }),
        count
      });
    }

    // Recent system activity
    const recentActivity = await ActivityLog.find()
      .populate('user', 'name role')
      .sort({ createdAt: -1 })
      .limit(10);
    
    const formattedActivity = recentActivity.map(log => ({
      action: log.action.replace('_', ' ').toUpperCase(),
      details: log.details,
      timestamp: log.createdAt,
      user: log.user?.name || 'System'
    }));

    res.json({
      totalRevenue,
      totalPatients,
      totalAppointments,
      totalMedicalRecords,
      totalLabRecords,
      totalPrescriptions,
      monthlyAppointments,
      recentActivity: formattedActivity
    });
  } catch (error) {
    console.error('Get reports summary error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== ADMIN MESSAGING SYSTEM ====================

// Admin's own messages (Inbox)
exports.getAdminMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { recipient: req.user.id },
        { sender: req.user.id },
        { isBroadcast: true }
      ]
    })
    .populate('sender', 'name email role profileImage')
    .populate('recipient', 'name email role profileImage')
    .sort({ createdAt: -1 });
    
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Send Individual Message
exports.sendIndividualMessage = async (req, res) => {
  try {
    const { recipient, subject, message } = req.body;
    const sender = req.user.id;

    const newMessage = new Message({
      sender,
      recipient,
      subject,
      message
    });

    await newMessage.save();

    await logActivity(sender, 'message_send', `Sent individual message to ${recipient}`, null, { subject }, req);

    res.status(201).json({ message: 'Message sent successfully', data: newMessage });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Send Broadcast Message
exports.sendBroadcastMessage = async (req, res) => {
  try {
    const { broadcastType, subject, message } = req.body;
    const sender = req.user.id;

    const newMessage = new Message({
      sender,
      isBroadcast: true,
      broadcastType,
      subject,
      message
    });

    await newMessage.save();

    await logActivity(sender, 'message_broadcast', `Sent broadcast message: ${broadcastType}`, null, { subject }, req);

    res.status(201).json({ message: 'Broadcast message sent successfully', data: newMessage });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Message Thread
exports.getMessageThread = async (req, res) => {
  try {
    const { id } = req.params;
    const message = await Message.findById(id)
      .populate('sender', 'name email role')
      .populate('recipient', 'name email role')
      .populate('replies.sender', 'name role');

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    res.json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark Message Read
exports.markMessageRead = async (req, res) => {
  try {
    const { id } = req.params;
    const message = await Message.findByIdAndUpdate(id, { 
      isRead: true, 
      readAt: new Date() 
    }, { new: true });

    res.json({ message: 'Message marked as read', data: message });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reply to Message
exports.replyToMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    const sender = req.user.id;

    const originalMessage = await Message.findById(id);
    if (!originalMessage) {
      return res.status(404).json({ message: 'Message not found' });
    }

    originalMessage.replies.push({
      sender,
      message
    });

    await originalMessage.save();

    res.status(201).json({ message: 'Reply sent successfully', data: originalMessage });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark Conversation Completed
exports.markConversationCompleted = async (req, res) => {
  // We can add a 'status' field to Message if needed, but for now just mock success
  res.json({ message: 'Conversation marked as completed' });
};

// Clear Conversation
exports.clearConversation = async (req, res) => {
  try {
    const { id } = req.params;
    await Message.findByIdAndDelete(id);
    res.json({ message: 'Conversation cleared' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Broadcast Read Status
exports.getBroadcastReadStatus = async (req, res) => {
  // For broadcasts, we might track who read it. For now returning empty list.
  res.json([]);
};

// View All System Messages (Admin Monitoring)
exports.getAllMessages = async (req, res) => {
  try {
    const messages = await Message.find()
      .populate('sender', 'name email role')
      .populate('recipient', 'name email role')
      .sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Messages By Conversation (Placeholder)
exports.getMessagesByConversation = async (req, res) => {
  res.json([]);
};

// Export Conversation to PDF (Placeholder)
exports.exportConversationToPDF = async (req, res) => {
  res.json({ message: 'PDF export feature coming soon' });
};

// Get Messaging Statistics
exports.getMessageStatistics = async (req, res) => {
  try {
    const totalMessages = await Message.countDocuments();
    const unreadMessages = await Message.countDocuments({ isRead: false, isBroadcast: false });
    const broadcastMessages = await Message.countDocuments({ isBroadcast: true });
    const readMessages = await Message.countDocuments({ isRead: true });

    res.json({
      totalMessages,
      unreadMessages,
      broadcastMessages,
      readMessages
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== SYSTEM SETTINGS ====================

// Get System Settings
exports.getSystemSettings = async (req, res) => {
  try {
    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = new SystemSettings();
      await settings.save();
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update System Settings
exports.updateSystemSettings = async (req, res) => {
  try {
    const updates = req.body;
    updates.lastUpdatedBy = req.user.id;

    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = new SystemSettings(updates);
    } else {
      Object.assign(settings, updates);
    }

    await settings.save();

    await logActivity(req.user.id, 'settings_update', 'Updated portal configuration', null, updates, req);

    res.json({ message: 'Settings updated successfully', data: settings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== ADMIN PROFILE ====================

// Get Admin Profile Details
exports.getAdminProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Admin Profile
exports.updateAdminProfile = async (req, res) => {
  try {
    const { name, email, phone, address, dateOfBirth, gender } = req.body;
    
    // Check if email is already taken by another user
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: req.user.id } });
      if (existingUser) {
        return res.status(400).json({ message: 'Email is already in use' });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { name, email, phone, address, dateOfBirth, gender },
      { new: true }
    ).select('-password');

    res.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== DATA EXPORTS ====================

// Export Users to CSV
exports.exportUsersCSV = async (req, res) => {
  try {
    const users = await User.find().select('name email role status createdAt');
    const fields = ['name', 'email', 'role', 'status', 'createdAt'];
    const opts = { fields };
    const parser = new Parser(opts);
    const csv = parser.parse(users);
    
    res.header('Content-Type', 'text/csv');
    res.attachment('users_export.csv');
    return res.send(csv);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Export Billing to CSV
exports.exportBillingCSV = async (req, res) => {
  try {
    const billing = await Billing.find().populate('patient', 'name');
    const data = billing.map(b => ({
      ID: b._id,
      Patient: b.patient?.name || 'N/A',
      Amount: b.amount,
      Status: b.status,
      Type: b.type,
      Date: b.createdAt
    }));
    
    const fields = ['ID', 'Patient', 'Amount', 'Status', 'Type', 'Date'];
    const opts = { fields };
    const parser = new Parser(opts);
    const csv = parser.parse(data);
    
    res.header('Content-Type', 'text/csv');
    res.attachment('billing_export.csv');
    return res.send(csv);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Export Appointments to CSV
exports.exportAppointmentsCSV = async (req, res) => {
  try {
    const appointments = await Appointment.find().populate('patient', 'name').populate('doctor', 'name');
    const data = appointments.map(a => ({
      ID: a._id,
      Patient: a.patient?.name || 'N/A',
      Doctor: a.doctor?.name || 'N/A',
      Date: a.date,
      Time: a.time,
      Status: a.status
    }));
    
    const fields = ['ID', 'Patient', 'Doctor', 'Date', 'Time', 'Status'];
    const opts = { fields };
    const parser = new Parser(opts);
    const csv = parser.parse(data);
    
    res.header('Content-Type', 'text/csv');
    res.attachment('appointments_export.csv');
    return res.send(csv);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Admin Password
exports.updateAdminPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);
    
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect' });
    
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    
    await logActivity(req.user.id, 'security_update', 'Admin rotated credentials', req);
    
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Toggle 2FA (Placeholder)
exports.toggle2FA = async (req, res) => {
  try {
    const { enabled } = req.body;
    res.json({ message: `Two-Factor Authentication has been ${enabled ? 'enabled' : 'disabled'} (Simulation)` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Global Search across the portal
exports.globalSearch = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.json({ results: [] });
    
    const regex = new RegExp(query, 'i');
    
    const [users, appointments, billing] = await Promise.all([
      User.find({ $or: [{ name: regex }, { email: regex }] }).limit(5),
      Appointment.find({ status: regex }).limit(5).populate('patient', 'name').populate('doctor', 'name'),
      Billing.find({ description: regex }).limit(5).populate('patient', 'name')
    ]);
    
    const results = [
      ...users.map(u => ({ type: 'User', title: u.name, subtitle: u.role, link: `/admin/all-users` })),
      ...appointments.map(a => ({ type: 'Appointment', title: `Apt with ${a.doctor?.name}`, subtitle: a.status, link: `/admin/appointments` })),
      ...billing.map(b => ({ type: 'Invoice', title: b.description, subtitle: `$${b.amount}`, link: `/admin/billing` }))
    ];
    
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Bulk User Actions
exports.bulkUserAction = async (req, res) => {
  try {
    const { userIds, action } = req.body;
    if (!userIds || !Array.isArray(userIds)) return res.status(400).json({ message: 'User IDs array required' });
    
    let update = {};
    if (action === 'activate') update = { status: 'approved' };
    else if (action === 'suspend') update = { status: 'suspended' };
    else if (action === 'delete') {
      await User.deleteMany({ _id: { $in: userIds } });
      return res.json({ message: `${userIds.length} users deleted successfully` });
    } else return res.status(400).json({ message: 'Invalid action' });
    
    await User.updateMany({ _id: { $in: userIds } }, update);
    
    res.json({ message: `Bulk ${action} completed for ${userIds.length} users` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = exports;