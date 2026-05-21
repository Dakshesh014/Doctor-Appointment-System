const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/check-setup-allowed', authController.checkSetupAllowed);
router.post('/setup-owner', authController.setupOwner);
router.post('/superadmin-login', authController.superadminLogin);

// ✅ PROTECTED LOGOUT ROUTE
router.post('/logout', authMiddleware, authController.logout);



// SuperAdmin Routes
router.get('/check-setup-allowed', authController.checkSetupAllowed);
router.post('/setup-owner', authController.setupOwner);
router.post('/superadmin-login', authController.superadminLogin);

module.exports = router;