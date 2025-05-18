const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const OrderController = require('../controllers/OrderController');

router.use(auth);

router.post('/', OrderController.createOrder);
router.get('/', OrderController.getUserOrders);

module.exports = router;
