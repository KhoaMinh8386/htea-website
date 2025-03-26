const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const db = require("./db");
const { authMiddleware, protectAdmin } = require("./middleware/authMiddleware");

const app = express(); // ✅ Định nghĩa `app` trước khi dùng
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// ===================== 🔥 ROUTES =====================
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/product");
const ordersRouter = require("./routes/orders");
const ordersUsersRoutes = require("./routes/ordersUsers.routes");
const userRoutes = require("./routes/userRoutes"); // ✅ Thêm API Users

// 🛒 API Quản lý sản phẩm & đơn hàng
app.use("/api/auth", authRoutes);
app.use("/api/product", productRoutes);
app.use("/api/orders", ordersRouter);
app.use("/api/orders-users", ordersUsersRoutes);
app.use("/api/users", userRoutes); // ✅ Định nghĩa API user

// 🔐 API ADMIN (chỉ admin mới vào được)
app.use("/api/admin", authMiddleware, protectAdmin, (req, res) => {
  res.json({ message: "Chào mừng Admin!" });
});

// ===================== 🏠 API CHÍNH =====================
app.get("/", (req, res) => {
  res.send("Htea API đang chạy!");
});

// ===================== 🚀 KHỞI ĐỘNG SERVER =====================
app.listen(PORT, () => {
  console.log(`✅ Server đang chạy tại http://localhost:${PORT}`);
});
