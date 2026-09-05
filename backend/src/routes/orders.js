const express = require('express');
const router = express.Router();
const {
  createOrder,
  getAllOrders,
  getUserOrders,
  updateOrderStatus,
  updateOrderAddress,
  getOrderTracking,
  retryShipment,
  cancelOrder,
  refundOrder,
  deleteOrder,
  deleteCancelledOrders
} = require('../controllers/orderController');

// Route to delete all cancelled orders (Admin)
// DELETE /api/orders/cleanup-cancelled
router.delete('/cleanup-cancelled', deleteCancelledOrders);

// Route to get logged-in user orders
// GET /api/orders/my-orders
router.get('/my-orders', getUserOrders);

// Route to get all orders (Admin)
// GET /api/orders
router.get('/', getAllOrders);

// Route to create a new order
// POST /api/orders
router.post('/', createOrder);

// Route to delete a single order by ID (Admin)
// DELETE /api/orders/:id
router.delete('/:id', deleteOrder);

// Route to fetch tracking information for an order
// GET /api/orders/:orderId/tracking
router.get('/:orderId/tracking', getOrderTracking);

// Route to retry shipment creation for an order (Admin)
// POST /api/orders/:id/retry-shipment
router.post('/:id/retry-shipment', retryShipment);

// Route to cancel an order (Customer & Admin)
// POST /api/orders/:id/cancel
router.post('/:id/cancel', cancelOrder);

// Route to issue Razorpay refund for an order (Admin)
// POST /api/orders/:id/refund
router.post('/:id/refund', refundOrder);

// Route to update order shipping address & specs (Admin)
// PATCH, POST, PUT /api/orders/:id/address
router.patch('/:id/address', updateOrderAddress);
router.post('/:id/address', updateOrderAddress);
router.put('/:id/address', updateOrderAddress);

// Route to update order status (Admin)
// PATCH /api/orders/:id/status
router.patch('/:id/status', updateOrderStatus);

module.exports = router;
