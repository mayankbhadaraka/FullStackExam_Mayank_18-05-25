const express = require('express');
const router = express.Router();
const adminAuth = require('../middlewares/adminAuth');
const AdminController = require('../controllers/AdminController');

router.use(adminAuth);

router.get('/dashboard', AdminController.getDashboardData);
router.get('/products', AdminController.getProduct);
router.post('/products', AdminController.createProduct);
router.put('/products/:id', AdminController.updateProduct);
router.delete('/products/:id', AdminController.deleteProduct);

router.get('/orders', AdminController.viewAllOrders);

module.exports = router;
