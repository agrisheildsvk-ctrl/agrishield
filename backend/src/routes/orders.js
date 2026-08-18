const express = require('express');
const router = express.Router();
const {
  createOrder,
  getAllOrders,
  getUserOrders,
  updateOrderStatus,
  getOrderTracking,
  retryShipment
} = require('../controllers/orderController');

// Route to get logged-in user orders
// GET /api/orders/my-orders
router.get('/my-orders', getUserOrders);

// Route to get all orders (Admin)
// GET /api/orders
router.get('/', getAllOrders);

// Route to create a new order
// POST /api/orders
router.post('/', createOrder);

// Route to fetch tracking information for an order
// GET /api/orders/:orderId/tracking
router.get('/:orderId/tracking', getOrderTracking);

// Route to retry shipment creation for an order (Admin)
// POST /api/orders/:id/retry-shipment
router.post('/:id/retry-shipment', retryShipment);

// Route to update order status (Admin)
// PATCH /api/orders/:id/status
router.patch('/:id/status', updateOrderStatus);

module.exports = router;
