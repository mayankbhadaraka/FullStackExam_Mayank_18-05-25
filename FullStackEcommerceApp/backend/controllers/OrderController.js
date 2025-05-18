const Order = require('../models/sql/Order');
const OrderItem = require('../models/sql/OrderItem');
const Product = require('../models/mongo/Product');
const Cart = require('../models/mongo/Cart');
const sequelize = require('../config/mysql');

exports.createOrder = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const userId = req.user.id;
    const { items } = req.body; 

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Order items required' });
    }

    let total = 0;
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        await t.rollback();
        return res.status(400).json({ message: `Product not found: ${item.productId}` });
      }
      if (product.stock < item.quantity) {
        await t.rollback();
        return res.status(400).json({ message: `Insufficient stock for product: ${product.name}` });
      }
      total += product.price * item.quantity;
    }

    const order = await Order.create({ user_id: userId, total }, { transaction: t });

    for (const item of items) {
      const product = await Product.findById(item.productId._id || item.productId);
      await OrderItem.create({
        order_id: order.id,
        product_id: product._id.toString(),
        quantity: item.quantity,
        price: product.price
      }, { transaction: t });

      product.stock -= item.quantity;
      await product.save();
    }

    await t.commit();
    
    await Cart.deleteMany({ userId: String(userId) });

    res.status(201).json({ message: 'Order created', orderId: order.id });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ message: 'Error creating order', error: err.message });
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;

    const totalItems = await Order.count({ where: { user_id: userId } });

    const orders = await Order.findAll({
      where: { user_id: userId },
      include: [{ model: OrderItem }],
      order: [['created_at', 'DESC']],
      limit,
      offset,
    });

    const populatedOrders = await Promise.all(
      orders.map(async (order) => {
        const itemsWithProduct = await Promise.all(
          order.OrderItems.map(async (item) => {
            const product = await Product.findById(item.dataValues.product_id).lean();
            return {
              ...item.dataValues,
              product: {
                _id: product._id,
                name: product.name,
                price: product.price,
              },
            };
          })
        );

        return {
          ...order.toJSON(),
          items: itemsWithProduct,
        };
      })
    );

    res.json({
      orders: populatedOrders,
      pagination: {
        currentPage: page,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        pageSize: limit,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching orders', error: err.message });
  }
};

