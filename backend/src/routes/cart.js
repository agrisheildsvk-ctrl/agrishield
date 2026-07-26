const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart');
const authMiddleware = require('../middleware/auth');

// All cart routes require authentication
router.use(authMiddleware);

router.get('/', cartController.index);
router.post('/add', cartController.add);

// Fallbacks for legacy PHP paths
router.get('/index.php', cartController.index);
router.post('/add.php', cartController.add);

module.exports = router;
