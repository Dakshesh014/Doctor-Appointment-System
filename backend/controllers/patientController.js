const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Billing = require('../models/Billing');
const Prescription = require('../models/Prescription');
const LabRecord = require('../models/LabRecord');
const VisitHistory = require('../models/VisitHistory');
const Message = require('../models/Message');
const { logActivity } = require('../utils/activityLogger');
const { sendEmail } = require('../utils/emailService');

// ==================== DASHBOARD ====================

// Get Patient Dashboard Data
exports.getDashboardData = async (req, res) => {
  try {
    const patientId = req.user.id;

    // Get upcoming appointments
    const upcomingAppointments = await Appointment.countDocuments({
      patient: patientId,
      date: { $gte: new Date() },
      status: { $in: ['pending', 'confirmed'] }
    });

    // Get active prescriptions (valid ones)
    const activePrescriptions = await Prescription.countDocuments({
      patient: patientId,
      validUntil: { $gte: new Date() }
    });

    // Get medical records count
    const medicalRecords = await VisitHistory.countDocuments({
      patient: patientId
    });

    // Get outstanding balance
    const unpaidBills = await Billing.find({
      patientId: patientId,
      status: 'pending'
    });
    const outstandingBalance = unpaidBills.reduce((sum, bill) => sum + bill.amount, 0);

    // Get lab reports count
    const labReports = await LabRecord.countDocuments({
      patient: patientId
    });

    // Get patient details
    const patient = await User.findById(patientId);

    res.json({
      upcomingAppointments,
      activePrescriptions,
      medicalRecords,
      outstandingBalance,
      labReports,
      allergies: patient.allergies ? patient.allergies.split(',').length : 0,
      vitals: {
        bloodPressure: patient.bloodPressure || '120/80',
        heartRate: patient.heartRate || '72 bpm',
        temperature: patient.temperature || '98.6°F',
        weight: patient.weight || 'N/A',
        height: patient.height || 'N/A'
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== DOCTORS ====================

// Get Available Doctors (Only Approved)
exports.getAvailableDoctors = async (req, res) => {
  try {
    const doctors = await User.find({
      role: 'doctor',
      status: 'approved'
    })
    .select('name email specialization qualification experience profileImage')
    .sort({ name: 1 });

    res.json(doctors);
  } catch (error) {
    console.error('Get doctors error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== APPOINTMENTS ====================

// Book Appointment
exports.bookAppointment = async (req, res) => {
  try {
    const patientId = req.user.id;
    const { doctor, date, time, type, reason, department } = req.body;

    // Verify doctor exists and is approved
    const doctorUser = await User.findOne({
      _id: doctor,
      role: 'doctor',
      status: 'approved'
    });

    if (!doctorUser) {
      return res.status(400).json({ message: 'Doctor not available' });
    }

    // Check for double booking
    const existingAppointment = await Appointment.findOne({
      doctor,
      date,
      time,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (existingAppointment) {
      return res.status(400).json({ message: 'This time slot is already booked. Please choose another one.' });
    }

    // Create appointment
    const appointment = new Appointment({
      patient: patientId,
      doctor,
      date,
      time,
      type,
      reason,
      department: department || doctorUser.specialization,
      status: 'pending'
    });

    await appointment.save();

    // Log activity
    await logActivity(
      patientId,
      'appointment_create',
      `Patient booked ${type} appointment with Dr. ${doctorUser.name}`,
      null,
      { appointmentId: appointment._id },
      req
    );

    // Send confirmation email
    const patientUser = await User.findById(patientId);
    if(patientUser && patientUser.email) {
      await sendEmail(
        patientUser.email,
        'Appointment Confirmed - Advance Appointment System',
        `<h1>Appointment Booking Confirmed</h1>
         <p>Dear ${patientUser.name},</p>
         <p>Your appointment with Dr. ${doctorUser.name} on ${date} at ${time} has been booked successfully.</p>
         <p>Reason: ${reason}</p>`
      );
    }

    res.status(201).json({
      message: 'Appointment booked successfully! Waiting for doctor confirmation.',
      appointment
    });
  } catch (error) {
    console.error('Book appointment error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get Patient Appointments
exports.getAppointments = async (req, res) => {
  try {
    const patientId = req.user.id;
    const { status } = req.query;

    let query = { patient: patientId };
    if (status) {
      query.status = status;
    }

    const appointments = await Appointment.find(query)
      .populate('doctor', 'name specialization qualification profileImage')
      .sort({ date: -1 });

    res.json(appointments);
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get Upcoming Appointments
exports.getUpcomingAppointments = async (req, res) => {
  try {
    const patientId = req.user.id;

    const appointments = await Appointment.find({
      patient: patientId,
      date: { $gte: new Date() },
      status: { $in: ['pending', 'confirmed'] }
    })
    .populate('doctor', 'name specialization profileImage')
    .sort({ date: 1 })
    .limit(5);

    res.json(appointments);
  } catch (error) {
    console.error('Get upcoming appointments error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Cancel Appointment
exports.cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason: cancelReason } = req.body;
    const patientId = req.user.id;

    const appointment = await Appointment.findOne({
      _id: id,
      patient: patientId
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (appointment.status === 'completed') {
      return res.status(400).json({ message: 'Cannot cancel completed appointment' });
    }

    appointment.status = 'cancelled';
    if (cancelReason) appointment.cancelReason = cancelReason;
    await appointment.save();

    // Log activity
    await logActivity(
      patientId,
      'appointment_cancel',
      `Patient cancelled appointment`,
      null,
      { appointmentId: id },
      req
    );

    // Send Cancellation email
    const patientUser = await User.findById(patientId);
    if (patientUser && patientUser.email) {
      await sendEmail(
         patientUser.email,
         'Appointment Cancelled - Advance Appointment System',
         `<h1>Appointment Cancelled</h1>
          <p>Dear ${patientUser.name},</p>
          <p>Your appointment on ${appointment.date} at ${appointment.time} has been cancelled.</p>
          <p>Reason provided: ${cancelReason || 'None'}</p>`
      );
    }

    res.json({ message: 'Appointment cancelled successfully' });
  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get Available Time Slots
exports.getAvailableTimeSlots = async (req, res) => {
  try {
    const { doctorId, date } = req.query;

    if (!doctorId || !date) {
      return res.status(400).json({ message: 'Doctor ID and date are required' });
    }

    // Default time slots
    const allSlots = [
      '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
      '12:00 PM', '12:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
      '04:00 PM', '04:30 PM', '05:00 PM'
    ];

    // Find booked slots for this doctor on this date
    const bookedAppointments = await Appointment.find({
      doctor: doctorId,
      date: date,
      status: { $in: ['pending', 'confirmed'] }
    });

    const bookedSlots = bookedAppointments.map(app => app.time);
    
    // Filter available slots
    let availableSlots = allSlots.filter(slot => !bookedSlots.includes(slot));

    // Filter out past slots if the date is today
    const requestDate = new Date(date);
    const today = new Date();
    
    // Convert current time to a comparable format, ignoring time zones issues for local date comparison
    if (requestDate.toISOString().split('T')[0] === today.toISOString().split('T')[0]) {
      const currentHours = today.getHours();
      const currentMinutes = today.getMinutes();
      
      availableSlots = availableSlots.filter(slot => {
        // Parse slot like '09:30 AM' or '02:00 PM'
        const [time, period] = slot.split(' ');
        let [hours, minutes] = time.split(':').map(Number);
        
        if (period === 'PM' && hours !== 12) {
          hours += 12;
        } else if (period === 'AM' && hours === 12) {
          hours = 0;
        }

        if (hours > currentHours) return true;
        if (hours === currentHours && minutes > currentMinutes) return true;
        return false;
      });
    }

    // Suggest best slots (first 3)
    const suggestedSlots = availableSlots.slice(0, 3);

    res.json({
      availableSlots,
      suggestedSlots
    });
  } catch (error) {
    console.error('Get available time slots error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Reschedule Appointment
exports.rescheduleAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { newDate, newTime } = req.body;
    const patientId = req.user.id;

    const appointment = await Appointment.findOne({
      _id: id,
      patient: patientId
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (appointment.status === 'completed' || appointment.status === 'cancelled') {
      return res.status(400).json({ message: 'Cannot reschedule completed or cancelled appointment' });
    }

    // Check for double booking
    const existingAppointment = await Appointment.findOne({
      doctor: appointment.doctor,
      date: newDate,
      time: newTime,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (existingAppointment) {
      return res.status(400).json({ message: 'The selected time slot is already booked.' });
    }

    appointment.date = newDate;
    appointment.time = newTime;
    appointment.status = 'pending'; // Reset status to pending for doctor approval
    await appointment.save();

    // Log activity
    await logActivity(
      patientId,
      'appointment_reschedule',
      `Patient rescheduled appointment to ${newDate} at ${newTime}`,
      null,
      { appointmentId: id },
      req
    );

    // Send rescheduling email
    const patientUser = await User.findById(patientId);
    if (patientUser && patientUser.email) {
      await sendEmail(
         patientUser.email,
         'Appointment Rescheduled - Advance Appointment System',
         `<h1>Appointment Rescheduled</h1>
          <p>Dear ${patientUser.name},</p>
          <p>Your appointment has been successfully rescheduled for ${newDate} at ${newTime}.</p>
          <p>Please wait for doctor confirmation.</p>`
      );
    }

    res.json({ message: 'Appointment rescheduled successfully! Waiting for doctor confirmation.', appointment });
  } catch (error) {
    console.error('Reschedule appointment error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== MEDICAL RECORDS ====================

// Get Visit History
exports.getVisitHistory = async (req, res) => {
  try {
    const patientId = req.user.id;

    const visits = await VisitHistory.find({ patient: patientId })
      .populate('doctor', 'name specialization')
      .populate('prescriptions')
      .sort({ visitDate: -1 });

    res.json(visits);
  } catch (error) {
    console.error('Get visit history error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get Prescriptions
exports.getPrescriptions = async (req, res) => {
  try {
    const patientId = req.user.id;

    const prescriptions = await Prescription.find({ patient: patientId })
      .populate('doctor', 'name specialization')
      .sort({ createdAt: -1 });

    res.json(prescriptions);
  } catch (error) {
    console.error('Get prescriptions error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get Lab Records
exports.getLabRecords = async (req, res) => {
  try {
    const patientId = req.user.id;

    const labRecords = await LabRecord.find({ patient: patientId })
      .populate('doctor', 'name specialization')
      .sort({ testDate: -1 });

    res.json(labRecords);
  } catch (error) {
    console.error('Get lab records error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== MESSAGES ====================

// Get Messages
exports.getMessages = async (req, res) => {
  try {
    const patientId = req.user.id;

    const messages = await Message.find({
      $or: [
        { sender: patientId },
        { recipient: patientId }
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
    const patientId = req.user.id;
    const { recipient, subject, message } = req.body;

    if (!recipient || !subject || !message) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const newMessage = new Message({
      sender: patientId,
      recipient,
      subject,
      message
    });

    await newMessage.save();

    // Log activity
    await logActivity(
      patientId,
      'message_send',
      `Patient sent message to ${recipient}`,
      recipient,
      { messageId: newMessage._id },
      req
    );

    res.status(201).json({
      message: 'Message sent successfully',
      data: newMessage
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Mark Message as Read
exports.markMessageRead = async (req, res) => {
  try {
    const { id } = req.params;
    const patientId = req.user.id;

    const message = await Message.findOne({
      _id: id,
      recipient: patientId
    });

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    message.isRead = true;
    message.readAt = new Date();
    await message.save();

    res.json({ message: 'Message marked as read' });
  } catch (error) {
    console.error('Mark message read error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== BILLING ====================

// Get Billing
exports.getBilling = async (req, res) => {
  try {
    const patientId = req.user.id;

    const billing = await Billing.find({ patientId: patientId })
      .sort({ createdAt: -1 });

    res.json(billing);
  } catch (error) {
    console.error('Get billing error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get Single Bill
exports.getSingleBill = async (req, res) => {
  try {
    const { id } = req.params;
    const patientId = req.user.id;

    const bill = await Billing.findOne({
      _id: id,
      patient: patientId
    });

    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    res.json(bill);
  } catch (error) {
    console.error('Get single bill error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Simulate Payment
exports.payBill = async (req, res) => {
  try {
    const { id } = req.params;
    const patientId = req.user.id;
    const { paymentMethod } = req.body; // e.g., 'credit_card', 'upi'

    const bill = await Billing.findOne({
      _id: id,
      patient: patientId
    });

    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    if (bill.status === 'paid') {
      return res.status(400).json({ message: 'Bill is already paid' });
    }

    // Simulate payment processing delay & success
    bill.status = 'paid';
    if(paymentMethod) bill.paymentMethod = paymentMethod;
    bill.paymentDate = new Date();
    await bill.save();

    // Log activity
    await logActivity(
      patientId,
      'billing_payment',
      `Patient paid bill of $${bill.amount}`,
      null,
      { billId: id, method: paymentMethod },
      req
    );

    res.json({ message: 'Payment successful', bill });
  } catch (error) {
    console.error('Pay bill error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== PROFILE ====================

// Get Patient Profile
exports.getProfile = async (req, res) => {
  try {
    const patientId = req.user.id;

    const patient = await User.findById(patientId).select('-password');

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    res.json(patient);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update Patient Profile
exports.updateProfile = async (req, res) => {
  try {
    const patientId = req.user.id;
    const updates = req.body;

    // Remove fields that shouldn't be updated
    delete updates.email;
    delete updates.role;
    delete updates.password;
    delete updates.status;

    const patient = await User.findByIdAndUpdate(
      patientId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Log activity
    await logActivity(
      patientId,
      'profile_update',
      'Patient updated profile',
      null,
      { fields: Object.keys(updates) },
      req
    );

    res.json({
      message: 'Profile updated successfully',
      patient
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Upload Profile Picture
exports.uploadProfilePicture = async (req, res) => {
  try {
    const patientId = req.user.id;
    const { profileImage } = req.body;

    if (!profileImage) {
      return res.status(400).json({ message: 'Profile image is required' });
    }

    const patient = await User.findByIdAndUpdate(
      patientId,
      { profileImage },
      { new: true }
    ).select('-password');

    res.json({
      message: 'Profile picture updated successfully',
      patient
    });
  } catch (error) {
    console.error('Upload profile picture error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== EMERGENCY CONTACTS ====================

// Update Emergency Contact
exports.updateEmergencyContact = async (req, res) => {
  try {
    const patientId = req.user.id;
    const { emergencyContact, emergencyPhone } = req.body;

    const patient = await User.findByIdAndUpdate(
      patientId,
      { emergencyContact, emergencyPhone },
      { new: true }
    ).select('-password');

    res.json({
      message: 'Emergency contact updated successfully',
      patient
    });
  } catch (error) {
    console.error('Update emergency contact error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== MEDICAL INFORMATION ====================

// Update Medical Information
exports.updateMedicalInfo = async (req, res) => {
  try {
    const patientId = req.user.id;
    const { bloodType, allergies, medicalHistory } = req.body;

    const updates = {};
    if (bloodType) updates.bloodType = bloodType;
    if (allergies) updates.allergies = allergies;
    if (medicalHistory) updates.medicalHistory = medicalHistory;

    const patient = await User.findByIdAndUpdate(
      patientId,
      { $set: updates },
      { new: true }
    ).select('-password');

    res.json({
      message: 'Medical information updated successfully',
      patient
    });
  } catch (error) {
    console.error('Update medical info error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== NOTIFICATIONS ====================

// Get Notifications
exports.getNotifications = async (req, res) => {
  try {
    const patientId = req.user.id;

    // Get unread messages count
    const unreadMessages = await Message.countDocuments({
      recipient: patientId,
      isRead: false
    });

    // Get upcoming appointments (next 7 days)
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    const upcomingAppointments = await Appointment.countDocuments({
      patient: patientId,
      date: { $gte: new Date(), $lte: nextWeek },
      status: { $in: ['pending', 'confirmed'] }
    });

    // Get pending bills
    const pendingBills = await Billing.countDocuments({
      patient: patientId,
      status: 'pending'
    });

    res.json({
      unreadMessages,
      upcomingAppointments,
      pendingBills
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== ASSIGNED DOCTORS (MESSAGING) ====================
exports.getAssignedDoctors = async (req, res) => {
  try {
    const patientId = req.user.id;
    // Get distinct doctors the patient has appointments with
    const appointments = await Appointment.find({ patient: patientId }).distinct('doctor');

    if (!appointments || appointments.length === 0) {
      return res.json([]);
    }

    const doctors = await User.find({
      _id: { $in: appointments },
      role: 'doctor',
      status: 'approved'
    }).select('name email specialization profileImage');

    res.json(doctors);
  } catch (error) {
    console.error('Get assigned doctors error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== MESSAGE DETAILS AND REPLIES ====================

// Get unread messages count
exports.getUnreadMessagesCount = async (req, res) => {
  try {
    const patientId = req.user.id;
    const count = await Message.countDocuments({
      recipient: patientId,
      isRead: false
    });
    // Also include unread replies to the patient's messages
    const messagesWithUnreadReplies = await Message.countDocuments({
      sender: patientId,
      'replies.isRead': false,
      'replies.sender': { $ne: patientId }
    });
    res.json({ count: count + messagesWithUnreadReplies });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get single message thread
exports.getMessageThread = async (req, res) => {
  try {
    const { id } = req.params;
    const patientId = req.user.id;

    const message = await Message.findOne({
      _id: id,
      $or: [{ sender: patientId }, { recipient: patientId }]
    })
      .populate('sender', 'name role profileImage')
      .populate('recipient', 'name role profileImage')
      .populate('replies.sender', 'name role profileImage');

    if (!message) {
      return res.status(404).json({ message: 'Message thread not found' });
    }

    res.json(message);
  } catch (error) {
    console.error('Get message thread error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Edit message
exports.editMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { message: newText } = req.body;
    const patientId = req.user.id;

    const message = await Message.findOne({ _id: id, sender: patientId });

    if (!message) {
      return res.status(404).json({ message: 'Message not found or not authorized to edit' });
    }

    if (message.isRead) {
      return res.status(400).json({ message: 'Cannot edit message after it has been read' });
    }

    message.message = newText;
    message.isEdited = true;
    message.editedAt = new Date();
    await message.save();

    res.json({ message: 'Message updated correctly' });
  } catch (error) {
    console.error('Edit message error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Reply to message
exports.replyToMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { message: replyText } = req.body;
    const patientId = req.user.id;

    const message = await Message.findOne({
      _id: id,
      $or: [{ sender: patientId }, { recipient: patientId }]
    });

    if (!message) {
      return res.status(404).json({ message: 'Message thread not found' });
    }

    message.replies.push({
      sender: patientId,
      message: replyText,
      isRead: false
    });

    // Automatically mark the main message or other replies read if the recipient of those is the current user?
    await message.save();

    res.status(201).json({ message: 'Reply added correctly' });
  } catch (error) {
    console.error('Reply to message error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Mark reply as read
exports.markReplyRead = async (req, res) => {
  try {
    const { id, replyId } = req.params;
    const patientId = req.user.id;

    const message = await Message.findOneAndUpdate(
      { _id: id, 'replies._id': replyId },
      {
        $set: {
          'replies.$.isRead': true,
          'replies.$.readAt': new Date()
        }
      },
      { new: true }
    );

    res.json({ message: 'Reply marked read' });
  } catch (error) {
    console.error('Mark reply read error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Delete message
exports.deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const patientId = req.user.id;

    const message = await Message.findOne({
      _id: id,
      $or: [{ sender: patientId }, { recipient: patientId }]
    });

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Since a patient wants to delete it from their view, we will just delete it globally 
    // for simplicity based on the feature request, or it would require `deletedBy` arrays in schema.
    await Message.findByIdAndDelete(id);

    res.json({ message: 'Message deleted' });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== DASHBOARD SUMMARY (ALIAS) ====================
exports.getDashboardSummary = exports.getDashboardData;

// ==================== SETTINGS ====================

// Get Patient Settings
exports.getSettings = async (req, res) => {
  try {
    const patientId = req.user.id;
    const patient = await User.findById(patientId).select('settings emailNotifications smsNotifications appointmentReminders newsletterSubscription');

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    res.json({
      emailNotifications: patient.emailNotifications !== undefined ? patient.emailNotifications : true,
      smsNotifications: patient.smsNotifications !== undefined ? patient.smsNotifications : false,
      appointmentReminders: patient.appointmentReminders !== undefined ? patient.appointmentReminders : true,
      newsletterSubscription: patient.newsletterSubscription !== undefined ? patient.newsletterSubscription : false
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update Patient Settings
exports.updateSettings = async (req, res) => {
  try {
    const patientId = req.user.id;
    const { emailNotifications, smsNotifications, appointmentReminders, newsletterSubscription } = req.body;

    const updates = {};
    if (emailNotifications !== undefined) updates.emailNotifications = emailNotifications;
    if (smsNotifications !== undefined) updates.smsNotifications = smsNotifications;
    if (appointmentReminders !== undefined) updates.appointmentReminders = appointmentReminders;
    if (newsletterSubscription !== undefined) updates.newsletterSubscription = newsletterSubscription;

    await User.findByIdAndUpdate(patientId, { $set: updates }, { new: true });

    res.json({ message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Change Password
exports.changePassword = async (req, res) => {
  try {
    const patientId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Both current and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }

    const bcrypt = require('bcryptjs');
    const patient = await User.findById(patientId);

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, patient.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    patient.password = hashedPassword;
    await patient.save();

    // Log activity
    await logActivity(
      patientId,
      'password_change',
      'Patient changed their password',
      null,
      {},
      req
    );

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== INSURANCE ====================

// Get Insurance
exports.getInsurance = async (req, res) => {
  try {
    const patientId = req.user.id;
    const patient = await User.findById(patientId).select('insurance');

    if (!patient || !patient.insurance || !patient.insurance.provider) {
      return res.status(404).json({ message: 'No insurance found' });
    }

    res.json(patient.insurance);
  } catch (error) {
    console.error('Get insurance error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update Insurance
exports.updateInsurance = async (req, res) => {
  try {
    const patientId = req.user.id;
    const insuranceData = req.body;

    const patient = await User.findByIdAndUpdate(
      patientId,
      { $set: { insurance: insuranceData } },
      { new: true }
    ).select('insurance');

    res.json({
      message: 'Insurance information updated successfully',
      insurance: patient.insurance
    });
  } catch (error) {
    console.error('Update insurance error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== DIAGNOSES ====================

// Get Diagnoses (from visit history)
exports.getDiagnoses = async (req, res) => {
  try {
    const patientId = req.user.id;

    const visits = await VisitHistory.find({
      patient: patientId,
      diagnosis: { $exists: true, $ne: '' }
    })
      .populate('doctor', 'name specialization profileImage')
      .sort({ visitDate: -1 });

    res.json(visits);
  } catch (error) {
    console.error('Get diagnoses error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== TREATMENT PLANS ====================

// Get Treatment Plans (from visit history)
exports.getTreatmentPlans = async (req, res) => {
  try {
    const patientId = req.user.id;

    const visits = await VisitHistory.find({
      patient: patientId,
      treatment: { $exists: true, $ne: '' }
    })
      .populate('doctor', 'name specialization profileImage')
      .sort({ visitDate: -1 });

    res.json(visits);
  } catch (error) {
    console.error('Get treatment plans error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = exports;