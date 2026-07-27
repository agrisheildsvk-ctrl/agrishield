const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');

// Routes
const authRoutes = require('./routes/auth.js');
const productsRoutes = require('./routes/products.js');
const categoriesRoutes = require('./routes/categories.js');
const cartRoutes = require('./routes/cart.js');
const ordersRoutes = require('./routes/orders.js');
const paymentsRoutes = require('./routes/payments.js');
const settingsRoutes = require('./routes/settings.js');
const notificationsRoutes = require('./routes/notifications.js');

const app = express();

// Middleware
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(morgan('dev'));
app.use(compression());
app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf.toString();
    }
  })
);
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files (if any)
app.use('/uploads', express.static('legacy-php/uploads'));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/notifications', notificationsRoutes);

// Serve static frontend in production
const frontendDist = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendDist));

// For any route not matched by API, serve frontend index.html
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(frontendDist, 'index.html'), (err) => {
    if (err) {
      next();
    }
  });
});

// 404 Handler for API endpoints
app.use((req, res, next) => {
  res.status(404).json({ message: 'Endpoint not found' });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

module.exports = app;
