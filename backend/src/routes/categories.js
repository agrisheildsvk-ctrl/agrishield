const express = require('express');
const router = express.Router();
const categoriesController = require('../controllers/categories');

router.get('/', categoriesController.index);
router.get('/index.php', categoriesController.index); // Fallback for old frontend API call

module.exports = router;
