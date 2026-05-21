const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const { verifyToken, verifyDoctor } = require('../middleware/auth');
const profileUpload = require('../config/multer');
const templateUpload = require('../config/prescriptionMulter');

// Apply authentication middleware to all routes
router.use(verifyToken);
router.use(verifyDoctor);

// ==================== DASHBOARD ====================
router.get('/dashboard/summary', doctorController.getDashboardSummary);
router.get('/statistics', doctorController.getStatistics);

// ==================== APPOINTMENTS ====================
router.get('/appointments', doctorController.getAppointments);
router.get('/appointments/today', doctorController.getTodayAppointments);
router.get('/appointments/pending', doctorController.getPendingAppointments);
router.get('/appointments/:id', doctorController.getSingleAppointment);
router.put('/appointments/:id/accept', doctorController.acceptAppointment);
router.put('/appointments/:id/reject', doctorController.rejectAppointment);
router.put('/appointments/:id/complete', doctorController.completeAppointment);

// ==================== PATIENTS ====================
router.get('/patients', doctorController.getPatients);
router.get('/patients/:id', doctorController.getSinglePatient);

// ==================== PRESCRIPTIONS ====================
router.post('/prescriptions', doctorController.addPrescription);
router.get('/prescriptions', doctorController.getPrescriptions);

// ==================== LAB RECORDS ====================
router.post('/lab-records', doctorController.addLabRecord);
router.get('/lab-records', doctorController.getLabRecords);

// ==================== VISIT HISTORY ====================
router.post('/visit-history', doctorController.addVisitHistory);
router.get('/visit-history', doctorController.getVisitHistory);

// ==================== DIAGNOSES & TREATMENT PLANS ====================
router.get('/diagnoses', doctorController.getDiagnoses);
router.get('/treatment-plans', doctorController.getTreatmentPlans);

// ==================== BILLING ====================
router.get('/billing', doctorController.getBilling);

// ==================== MESSAGES ====================
router.get('/messages', doctorController.getMessages);
router.get('/messages/unread-count', doctorController.getUnreadMessagesCount);
router.get('/messages/:id', doctorController.getMessageThread);
router.post('/messages', doctorController.sendMessage);
router.put('/messages/:id', doctorController.editMessage);
router.put('/messages/:id/read', doctorController.markMessageRead);
router.post('/messages/:id/reply', doctorController.replyToMessage);
router.put('/messages/:id/replies/:replyId/read', doctorController.markReplyRead);
router.delete('/messages/:id', doctorController.deleteMessage);

// ==================== PROFILE ====================
router.get('/profile', doctorController.getProfile);
router.put('/profile', doctorController.updateProfile);
router.post('/profile/image', profileUpload.single('profileImage'), doctorController.uploadProfileImage);
router.delete('/profile/image', doctorController.deleteProfileImage);
router.post('/profile/prescription-template', templateUpload.single('template'), doctorController.uploadPrescriptionTemplate);
router.delete('/profile/prescription-template', doctorController.deletePrescriptionTemplate);

// ==================== SETTINGS ====================
router.get('/settings', doctorController.getSettings);
router.put('/settings', doctorController.updateSettings);
router.put('/change-password', doctorController.changePassword);

module.exports = router;