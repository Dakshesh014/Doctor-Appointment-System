const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const superadminController = require('../controllers/superadminController');

// Apply auth middleware to all routes
router.use(authMiddleware);

// Dashboard
router.get('/dashboard/summary', superadminController.getDashboardSummary);
router.get('/admins/pending', superadminController.getPendingAdmins);
router.get('/doctors/pending', superadminController.getPendingDoctors);
router.get('/security/alerts', superadminController.getSecurityAlerts);



// User Management
router.get('/admins', superadminController.getAllAdmins);
router.get('/doctors', superadminController.getAllDoctors);
router.get('/patients', superadminController.getAllPatients);

// Admin Actions
router.put('/admins/:id/approve', superadminController.approveAdmin);
router.put('/admins/:id/reject', superadminController.rejectAdmin);
router.delete('/admins/:id', superadminController.deleteAdmin);

// Doctor Actions
router.put('/doctors/:id/approve', superadminController.approveDoctor);
router.delete('/doctors/:id', superadminController.deleteDoctor);

// Patient Actions
router.delete('/patients/:id', superadminController.deletePatient);

// Audit Logs
router.get('/audit-logs', superadminController.getAuditLogs);

// ==================== MESSAGES (NEW) ====================
router.get('/messages', superadminController.getAllMessages);
router.get('/messages/unread-count', superadminController.getUnreadCount);
router.get('/messages/conversation', superadminController.getMessagesByConversation);
router.get('/messages/export-pdf', superadminController.exportMessagesToPDF);
router.get('/messages/statistics', superadminController.getMessageStatistics);
router.get('/messages/:id', superadminController.getMessageThread);
router.post('/messages', superadminController.sendMessage);
router.put('/messages/:id', superadminController.editMessage);
router.put('/messages/:id/read', superadminController.markMessageRead);
router.post('/messages/:id/reply', superadminController.replyToMessage);

module.exports = router;