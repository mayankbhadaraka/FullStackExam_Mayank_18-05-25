const Product = require('../models/mongo/Product');

exports.listProducts = async (req, res) => {
  try {
    const { search, category, page = 1, limit = 10 } = req.query;

    const pageNumber = parseInt(page, 10) || 1;
    const pageSize = parseInt(limit, 10) || 10;

    const query = {};
    if (search) {
      query.$text = { $search: search };
    }
    if (category) {
      query.category = category;
    }

    const total = await Product.countDocuments(query);
    const totalPages = Math.ceil(total / pageSize);

    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize);

    res.json({
      products,
      pagination: {
        totalItems: total,
        currentPage: pageNumber,
        totalPages,
        pageSize,
      },
    });
  } catch (err) {
    console.error('Error in listProducts:', err);
    res.status(500).json({ message: 'Error fetching products', error: err.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching product', error: err.message });
  }
};