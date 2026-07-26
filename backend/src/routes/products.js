const express = require('express');
const router = express.Router();
const productsController = require('../controllers/products');

router.get('/', productsController.index);
router.get('/:id', productsController.show);

// Fallbacks for legacy PHP paths
router.get('/index.php', productsController.index);
router.get('/show.php', productsController.show);

module.exports = router;
