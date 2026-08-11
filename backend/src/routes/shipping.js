const express = require('express');
const router = express.Router();
const {
  createDelhiveryShipment,
  trackDelhiveryShipment,
  scheduleDelhiveryPickup
} = require('../controllers/shippingController');

// POST /api/shipping/delhivery/create
router.post('/delhivery/create', createDelhiveryShipment);

// GET /api/shipping/delhivery/track/:awb
router.get('/delhivery/track/:awb', trackDelhiveryShipment);

// POST /api/shipping/delhivery/pickup
router.post('/delhivery/pickup', scheduleDelhiveryPickup);

module.exports = router;
