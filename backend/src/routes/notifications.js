const express = require('express');
const router = express.Router();
const { resendWhatsAppNotification } = require('../controllers/notificationController');

router.post('/whatsapp', resendWhatsAppNotification);

module.exports = router;
