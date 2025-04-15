const express = require("express");
const router = express.Router();
const { createOrder, getOrders, getOrderById, updateOrderStatus, getOrderStats } = require('../controllers/orderController');
const { authenticateToken } = require('../middleware/auth');

let orders = [
  {
    id: 1,
    username: "Nguyễn Văn A",
    total_price: 60000,
    items: [{ name: "Trà Sữa Truyền Thống", price: 30000, quantity: 2 }],
  },
  {
    id: 2,
    username: "Trần Thị B",
    total_price: 90000,
    items: [
      { name: "Trà Xanh Latte", price: 35000, quantity: 1 },
      { name: "Trà Đào", price: 55000, quantity: 1 },
    ],
  },
];

// 📌 Lấy danh sách đơn hàng
router.get("/", authenticateToken, getOrders);

// 📌 Thêm đơn hàng mới
router.post("/", authenticateToken, createOrder);

// 📌 Xóa đơn hàng
router.delete("/:id", authenticateToken, (req, res) => {
  const orderId = parseInt(req.params.id);
  orders = orders.filter((order) => order.id !== orderId);
  res.json({ message: "Đã xóa đơn hàng!" });
});

// 📌 Cập nhật đơn hàng
router.put("/:id", authenticateToken, (req, res) => {
  const orderId = parseInt(req.params.id);
  const index = orders.findIndex((order) => order.id === orderId);
  if (index !== -1) {
    orders[index] = { ...orders[index], ...req.body };
    res.json(orders[index]);
  } else {
    res.status(404).json({ message: "Không tìm thấy đơn hàng!" });
  }
});

// Lấy chi tiết đơn hàng
router.get("/:id", authenticateToken, getOrderById);

// Cập nhật trạng thái đơn hàng
router.put("/:id/status", authenticateToken, updateOrderStatus);

// Lấy thống kê đơn hàng
router.get("/stats", authenticateToken, getOrderStats);

module.exports = router;
