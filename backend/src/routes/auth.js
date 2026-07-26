const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');

router.post('/register', authController.register);
router.post('/login', authController.login);

// Expose .php routes optionally to make transition smoother without changing frontend
router.post('/register.php', authController.register);
router.post('/login.php', authController.login);

module.exports = router;
