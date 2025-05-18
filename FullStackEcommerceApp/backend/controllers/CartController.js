const Cart = require('../models/mongo/Cart');

const CartController = {
  async getCart(req, res) {
    try {
      const cart = await Cart.findOne({ userId: req.user.id }).populate('items.productId');
      if (!cart) return res.json({ items: [] });
      res.json(cart);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  },

  async addToCart(req, res) {
    try {
      const { productId, quantity = 1 } = req.body;
      let cart = await Cart.findOne({ userId: req.user.id });
      if (!cart) {
        cart = new Cart({ userId: req.user.id, items: [] });
      }
      const existingItem = cart.items.find(item => item.productId.toString() === productId);
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.items.push({ productId, quantity });
      }

      await cart.save();
      res.json(cart);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  },

  async removeFromCart(req, res) {
    try {
      const { productId } = req.params;
      const cart = await Cart.findOne({ userId: req.user.id });
      if (!cart) return res.status(404).json({ message: 'Cart not found' });
      cart.items = cart.items.filter(item => item.productId.toString() !== productId);
      await cart.save();
      res.json(cart);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  },
  async updateCartItem(req, res) {
    try {
      const { productId, quantity } = req.body;

      if (!productId || typeof quantity !== 'number' || quantity < 1) {
        return res.status(400).json({ message: 'Invalid productId or quantity' });
      }

      const cart = await Cart.findOne({ userId: req.user.id });

      if (!cart) return res.status(404).json({ message: 'Cart not found' });

      const item = cart.items.find(item => item.productId.toString() === productId);

      if (!item) return res.status(404).json({ message: 'Product not in cart' });

      item.quantity = quantity;
      await cart.save();

      res.json({ message: 'Quantity updated', cart });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }

};

module.exports = CartController;