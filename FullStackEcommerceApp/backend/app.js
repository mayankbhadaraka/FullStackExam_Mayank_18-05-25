const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();

const sequelize = require('./config/mysql');
require('./config/mongodb'); // Connect MongoDB
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true, 
}));

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

// Sync MySQL tables
sequelize.sync()
  .then(() => console.log('MySQL synced'))
  .catch(err => console.error('MySQL sync error:', err));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
