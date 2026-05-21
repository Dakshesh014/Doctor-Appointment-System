const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const { verifyToken, verifyPatient } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(verifyToken);
router.use(verifyPatient);

// ==================== DASHBOARD ====================
router.get('/dashboard', patientController.getDashboardData);
router.get('/dashboard/summary', patientController.getDashboardData);

// ==================== DOCTORS ====================
router.get('/doctors/available', patientController.getAvailableDoctors);
router.get('/doctors/assigned', patientController.getAssignedDoctors);

// ==================== APPOINTMENTS ====================
router.post('/appointments', patientController.bookAppointment);
router.get('/appointments', patientController.getAppointments);
router.get('/appointments/upcoming', patientController.getUpcomingAppointments);
router.get('/appointments/available-slots', patientController.getAvailableTimeSlots);
router.put('/appointments/:id/cancel', patientController.cancelAppointment);
router.put('/appointments/:id/reschedule', patientController.rescheduleAppointment);

// ==================== MEDICAL RECORDS ====================
router.get('/visit-history', patientController.getVisitHistory);
router.get('/prescriptions', patientController.getPrescriptions);
router.get('/lab-records', patientController.getLabRecords);
router.get('/diagnoses', patientController.getDiagnoses);
router.get('/treatment-plans', patientController.getTreatmentPlans);

// ==================== MESSAGES ====================
router.get('/messages', patientController.getMessages);
router.get('/messages/unread-count', patientController.getUnreadMessagesCount);
router.get('/messages/:id', patientController.getMessageThread);
router.post('/messages', patientController.sendMessage);
router.put('/messages/:id', patientController.editMessage);
router.put('/messages/:id/read', patientController.markMessageRead);
router.post('/messages/:id/reply', patientController.replyToMessage);
router.put('/messages/:id/replies/:replyId/read', patientController.markReplyRead);
router.delete('/messages/:id', patientController.deleteMessage);

// ==================== BILLING ====================
router.get('/billing', patientController.getBilling);
router.get('/billing/:id', patientController.getSingleBill);
router.put('/billing/:id/pay', patientController.payBill);

// ==================== PROFILE ====================
router.get('/profile', patientController.getProfile);
router.put('/profile', patientController.updateProfile);
router.put('/profile/picture', patientController.uploadProfilePicture);
router.put('/profile/emergency-contact', patientController.updateEmergencyContact);
router.put('/profile/medical-info', patientController.updateMedicalInfo);

// ==================== INSURANCE ====================
router.get('/insurance', patientController.getInsurance);
router.put('/insurance', patientController.updateInsurance);

// ==================== SETTINGS ====================
router.get('/settings', patientController.getSettings);
router.put('/settings', patientController.updateSettings);
router.put('/change-password', patientController.changePassword);

// ==================== NOTIFICATIONS ====================
router.get('/notifications', patientController.getNotifications);

module.exports = router;