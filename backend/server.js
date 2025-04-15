const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { sequelize, connectDB } = require("./config/db");
const { auth, adminAuth } = require("./middleware/auth");
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Serve static files from the frontend/public directory
app.use('/images', express.static(path.join(__dirname, '../frontend/public/images'), {
  setHeaders: (res, path) => {
    res.set('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
    res.set('Access-Control-Allow-Origin', '*');
  }
}));

app.use('/uploads', express.static(path.join(__dirname, '../frontend/public/uploads'), {
  setHeaders: (res, path) => {
    res.set('Cache-Control', 'public, max-age=31536000');
    res.set('Access-Control-Allow-Origin', '*');
  }
}));

// Add CORS headers for all requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});

// ===================== 🔥 ROUTES =====================
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/product");
const ordersRouter = require("./routes/orders");
const ordersUsersRoutes = require("./routes/ordersUsers.routes");
const userRoutes = require("./routes/user");
const orderRoutes = require('./routes/order');
const dashboardRoutes = require('./routes/dashboard');

// 🛒 API Quản lý sản phẩm & đơn hàng
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", ordersRouter);
app.use("/api/orders-users", ordersUsersRoutes);
app.use("/api/users", userRoutes);
app.use('/api', orderRoutes);
app.use('/api/dashboard', dashboardRoutes);

// 🔐 API ADMIN (chỉ admin mới vào được)
app.use("/api/admin", auth, adminAuth, (req, res) => {
  res.json({ message: "Chào mừng Admin!" });
});

// ===================== 🏠 API CHÍNH =====================
app.get("/", (req, res) => {
  res.send("Htea API đang chạy!");
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Có lỗi xảy ra',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Handle 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Không tìm thấy API'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
