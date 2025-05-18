const Product = require('../models/mongo/Product');
const Order = require('../models/sql/Order');
const User = require('../models/sql/User');
const OrderItem = require('../models/sql/OrderItem');
const { Op } = require('sequelize');
const { default: mongoose } = require('mongoose');

exports.getDashboardData = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let dateFilter = {};

    if (startDate && endDate) {
      const endDateObj = new Date(endDate);
      endDateObj.setHours(23, 59, 59, 999);

      dateFilter = {
        created_at: {
          [Op.between]: [new Date(startDate), endDateObj],
        },
      };
    } else if (startDate) {
      dateFilter = {
        created_at: {
          [Op.gte]: new Date(startDate),
        },
      };
    } else if (endDate) {
      const endDateObj = new Date(endDate);
      endDateObj.setHours(23, 59, 59, 999); 

      dateFilter = {
        created_at: {
          [Op.lte]: endDateObj,
        },
      };
    }

    const totalProducts = await Product.count();

    const totalOrders = await Order.count({
      where: dateFilter,
    });

    const revenueResult = await Order.findAll({
      attributes: [
        [Order.sequelize.fn('SUM', Order.sequelize.col('total')), 'totalRevenue'],
      ],
      where: dateFilter,
      raw: true,
    });
    const totalRevenue = parseFloat(revenueResult[0].totalRevenue) || 0;

    const topSellingProductData = await OrderItem.findAll({
      attributes: [
        'product_id',
        [OrderItem.sequelize.fn('SUM', OrderItem.sequelize.col('quantity')), 'unitsSold'],
      ],
      include: [{
        model: Order,
        attributes: [],
        where: dateFilter,
      }],
      group: ['product_id'],
      order: [[OrderItem.sequelize.literal('unitsSold'), 'DESC']],
      limit: 1,
      raw: true,
    });
    let topSellingProduct = null;
    if (topSellingProductData.length) {
      const topProductId = topSellingProductData[0].product_id;
      const product = await Product.findById(topProductId);
      topSellingProduct = {
        name: product ? product.name : 'Unknown Product',
        unitsSold: parseInt(topSellingProductData[0].unitsSold, 10),
      };
    }

    const topBuyerData = await Order.findAll({
      attributes: [
        'user_id',
        [Order.sequelize.fn('COUNT', Order.sequelize.col('id')), 'ordersCount'],
        [Order.sequelize.fn('SUM', Order.sequelize.col('total')), 'totalSpent'],
      ],
      where: dateFilter,
      group: ['user_id'],
      order: [[Order.sequelize.literal('totalSpent'), 'DESC']],
      limit: 1,
      raw: true,
    });

    let topBuyer = null;
    if (topBuyerData.length) {
      const userId = topBuyerData[0].user_id;
      const userInfo = await User.findOne({ where: { id: userId } });
      topBuyer = {
        name: userInfo ? userInfo.username : 'Unknown Buyer',
        orders: parseInt(topBuyerData[0].ordersCount, 10),
        totalSpent: parseFloat(topBuyerData[0].totalSpent),
      };
    }

    return res.json({
      totalProducts,
      totalOrders,
      totalRevenue,
      topSellingProduct,
      topBuyer,
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return res.status(500).json({ message: 'Server error fetching dashboard data' });
  }
};

exports.getProduct = async (req, res) => {
  const productId = req.params.id;
  const { page = 1, limit = 10, search = '' } = req.query;

  try {
    if (productId) {
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      return res.json(product);
    } else {
      const query = {};
      if (search.trim()) {
        query.name = { $regex: search.trim(), $options: 'i' };
      }

      const pageNum = parseInt(page, 10) > 0 ? parseInt(page, 10) : 1;
      const limitNum = parseInt(limit, 10) > 0 ? parseInt(limit, 10) : 10;

      const products = await Product.find(query)
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum);

      const totalCount = await Product.countDocuments(query);

      return res.json({
        products,
        pagination: {
          total: totalCount,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(totalCount / limitNum),
        },
      });
    }
  } catch (err) {
    console.error('Error fetching product(s):', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};


exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock } = req.body;
    if (!name || !price) return res.status(400).json({ message: 'Name and price required' });

    const product = new Product({ name, description, price, category, stock });
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: 'Error creating product', error: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const updateData = req.body;
    const updatedProduct = await Product.findByIdAndUpdate(productId, updateData, { new: true });
    if (!updatedProduct) return res.status(404).json({ message: 'Product not found' });
    res.json(updatedProduct);
  } catch (err) {
    res.status(500).json({ message: 'Error updating product', error: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const deleted = await Product.findByIdAndDelete(productId);
    if (!deleted) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting product', error: err.message });
  }
};

exports.viewAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search || '';
    const sortBy = req.query.sortBy || 'created_at'; 
    const sortOrder = req.query.sortOrder === 'asc' ? 'ASC' : 'DESC';

    const offset = (page - 1) * limit;

    const userWhere = search
      ? {
        username: {
          [Op.like]: `%${search}%`, 
        },
      }
      : {};

    const allowedSortFields = ['created_at', 'total'];
    const orderField = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';

    const { rows: orders, count: totalOrders } = await Order.findAndCountAll({
      include: [
        { model: OrderItem },
        {
          model: User,
          attributes: ['id', 'username', 'email'],
          where: userWhere,
          required: !!search, 
        },
      ],
      order: [[orderField, sortOrder]],
      limit,
      offset,
    });

    const populatedOrders = await Promise.all(
      orders.map(async (order) => {
        const itemsWithProduct = await Promise.all(
          order.OrderItems.map(async (item) => {
            try {
              const product = await Product.findById(item.product_id).lean();
              return {
                ...item.dataValues,
                product: product
                  ? {
                    _id: product._id,
                    name: product.name,
                    price: product.price,
                  }
                  : null,
              };
            } catch (err) {
              return {
                ...item.dataValues,
                product: null,
              };
            }
          })
        );

        return {
          ...order.toJSON(),
          items: itemsWithProduct,
        };
      })
    );

    const totalPages = Math.ceil(totalOrders / limit);

    res.json({
      orders: populatedOrders,
      pagination: {
        page,
        limit,
        totalOrders,
        totalPages,
      },
    });
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ message: 'Error fetching orders', error: err.message });
  }
};




