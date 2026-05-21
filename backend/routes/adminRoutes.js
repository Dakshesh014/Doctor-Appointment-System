const express = require('express');
const router = express.Router();
const { verifyToken, verifyAdmin } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

// Apply auth middleware to all routes
router.use(verifyToken);
router.use(verifyAdmin);

// ==================== DASHBOARD ====================
router.get('/dashboard/summary', adminController.getDashboardSummary);
router.get('/users/recent', adminController.getRecentUsers);
router.get('/appointments/recent', adminController.getRecentAppointments);
router.get('/revenue/chart', adminController.getRevenueChart);
router.get('/system/stats', adminController.getSystemStats);

// ==================== USER MANAGEMENT ====================
router.get('/users', adminController.getAllUsers);
router.get('/users/patients', adminController.getAllPatients);
router.get('/users/doctors', adminController.getAllDoctors);
router.get('/users/superadmins', adminController.getAllSuperAdmins);
router.post('/users', adminController.createUser);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);
router.post('/users/bulk', adminController.bulkUserAction);

// ==================== DOCTOR APPROVAL ====================
router.get('/doctors/pending', adminController.getPendingDoctors);
router.put('/doctors/:id/approve', adminController.approveDoctor);
router.put('/doctors/:id/reject', adminController.rejectDoctor);

// ==================== APPOINTMENTS MANAGEMENT ====================
router.get('/appointments', adminController.getAllAppointments);
router.put('/appointments/:id/reject', adminController.rejectAppointment);
router.put('/appointments/:id/status', adminController.updateAppointmentStatus);

// ==================== BILLING MANAGEMENT ====================
router.get('/billing', adminController.getAllBilling);
router.put('/billing/:id/status', adminController.updateBillingStatus);

// ==================== SYSTEM RECORDS ====================
router.get('/lab-results', adminController.getAllLabRecords);
router.get('/medical-records', adminController.getAllMedicalRecords);
router.get('/prescriptions', adminController.getAllPrescriptions);
router.get('/notifications', adminController.getNotifications);
router.post('/notifications/broadcast', adminController.sendGlobalNotification);
router.put('/notifications/:id/read', adminController.markNotificationRead);
router.get('/reports/summary', adminController.getReportsSummary);



// ==================== ADMIN MESSAGING SYSTEM ====================

// Admin's own messages
router.get('/messages/mine', adminController.getAdminMessages);

// Send messages
router.post('/messages/individual', adminController.sendIndividualMessage);
router.post('/messages/broadcast', adminController.sendBroadcastMessage);

// Message operations
router.get('/messages/:id', adminController.getMessageThread);
router.put('/messages/:id/read', adminController.markMessageRead);
router.post('/messages/:id/reply', adminController.replyToMessage);
router.put('/messages/:id/complete', adminController.markConversationCompleted);
router.delete('/messages/:id/clear', adminController.clearConversation);

// Broadcast message tracking
router.get('/messages/:id/broadcast-status', adminController.getBroadcastReadStatus);

// View all system messages (admin monitoring)
router.get('/messages', adminController.getAllMessages);
router.get('/messages/conversation', adminController.getMessagesByConversation);
router.get('/messages/export-pdf', adminController.exportConversationToPDF);
router.get('/messages/statistics', adminController.getMessageStatistics);
router.get('/search', adminController.globalSearch);

// ==================== SYSTEM SETTINGS ====================
router.get('/settings', adminController.getSystemSettings);
router.put('/settings', adminController.updateSystemSettings);

// ==================== DATA EXPORTS ====================
router.get('/export/users', adminController.exportUsersCSV);
router.get('/export/billing', adminController.exportBillingCSV);
router.get('/export/appointments', adminController.exportAppointmentsCSV);

// ==================== ADMIN PROFILE ====================
router.put('/profile', adminController.updateAdminProfile);
router.put('/profile/password', adminController.updateAdminPassword);
router.post('/profile/2fa', adminController.toggle2FA);

module.exports = router;