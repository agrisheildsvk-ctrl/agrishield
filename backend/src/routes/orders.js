const express = require('express');
const router = express.Router();
const { createOrder, getAllOrders, updateOrderStatus } = require('../controllers/orderController');

// Route to get all orders (Admin)
// GET /api/orders
router.get('/', getAllOrders);

// Route to create a new order
// POST /api/orders
router.post('/', createOrder);

// Route to update order status (Admin)
// PATCH /api/orders/:id/status
router.patch('/:id/status', updateOrderStatus);

module.exports = router;
