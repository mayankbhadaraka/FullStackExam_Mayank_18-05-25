const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const CartController = require('../controllers/CartController');

router.use(auth);

router.get('/', CartController.getCart);
router.post('/add', CartController.addToCart);
router.patch('/update', auth, CartController.updateCartItem);
router.delete('/remove/:productId', auth, CartController.removeFromCart);

module.exports = router;
