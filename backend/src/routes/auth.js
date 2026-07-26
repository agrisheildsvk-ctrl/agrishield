const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const authMiddleware = require('../middleware/auth');

// Premium Passwordless Auth APIs
router.post('/google', authController.google);
router.post('/send-otp', authController.sendOtp);
router.post('/verify-otp', authController.verifyOtp);
router.post('/register', authController.register);
router.post('/logout', authController.logout);

// Protected Profile routes
router.get('/profile', authMiddleware, authController.getProfile);
router.put('/profile', authMiddleware, authController.updateProfile);

// Protected Admin routes
router.get('/admin/users', authMiddleware, authController.getAdminUsers);

// Legacy fallback & .php endpoints
router.post('/login', authController.legacyLogin);
router.post('/register.php', authController.legacyRegister);
router.post('/login.php', authController.legacyLogin);

module.exports = router;
