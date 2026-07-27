const express = require('express');
const router = express.Router();
const {
  createPaymentOrder,
  verifyAndSavePayment,
  handleWebhook
} = require('../controllers/paymentController');

// POST /api/payments/create-order
router.post('/create-order', createPaymentOrder);

// POST /api/payments/verify
router.post('/verify', verifyAndSavePayment);

// POST /api/payments/webhook
router.post('/webhook', handleWebhook);

module.exports = router;
