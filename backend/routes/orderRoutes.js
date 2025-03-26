const express = require("express");
const router = express.Router();

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
router.get("/orders", (req, res) => {
  res.json(orders);
});

// 📌 Thêm đơn hàng mới
router.post("/orders", (req, res) => {
  const newOrder = {
    id: orders.length + 1,
    username: req.body.username,
    total_price: req.body.total_price,
    items: req.body.items,
  };
  orders.push(newOrder);
  res.json(newOrder);
});

// 📌 Xóa đơn hàng
router.delete("/orders/:id", (req, res) => {
  const orderId = parseInt(req.params.id);
  orders = orders.filter((order) => order.id !== orderId);
  res.json({ message: "Đã xóa đơn hàng!" });
});

// 📌 Cập nhật đơn hàng
router.put("/orders/:id", (req, res) => {
  const orderId = parseInt(req.params.id);
  const index = orders.findIndex((order) => order.id === orderId);
  if (index !== -1) {
    orders[index] = { ...orders[index], ...req.body };
    res.json(orders[index]);
  } else {
    res.status(404).json({ message: "Không tìm thấy đơn hàng!" });
  }
});

module.exports = router;
