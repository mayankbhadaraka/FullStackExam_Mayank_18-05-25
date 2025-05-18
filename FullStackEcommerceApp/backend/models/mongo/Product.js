const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, index: 'text' },
  description: String,
  price: { type: Number, required: true },
  category: { type: String, index: true },
  stock: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

productSchema.index({ name: 'text', category: 'text' });

module.exports = mongoose.model('Product', productSchema);
