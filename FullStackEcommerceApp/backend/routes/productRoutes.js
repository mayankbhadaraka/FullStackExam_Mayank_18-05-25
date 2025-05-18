const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/ProductController');

router.get('/', ProductController.listProducts);
router.get('/:id', ProductController.getProductById);

module.exports = router;
