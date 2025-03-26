const express = require("express");
const router = express.Router();
const db = require("../db");

// 🟢 API: Lấy danh sách đơn hàng (Có thể lọc theo user_id)
router.get("/", async (req, res) => {
  try {
    const user_id = req.query.user_id;
    let query = "SELECT id, username, total_price, created_at FROM orders";
    let values = [];

    if (user_id) {
      query += " WHERE user_id = $1";
      values.push(user_id);
    }

    query += " ORDER BY created_at DESC";
    const ordersResult = await db.query(query, values);

    if (ordersResult.rows.length === 0) {
      return res.status(200).json([]);
    }

    const orders = ordersResult.rows;

    for (let order of orders) {
      const itemsResult = await db.query(
        `SELECT p.name AS product_name, oi.price, oi.quantity 
         FROM order_items oi 
         JOIN product p ON oi.product_id = p.id
         WHERE oi.order_id = $1`,
        [order.id]
      );
      order.items = itemsResult.rows;
    }

    res.json(orders);
  } catch (err) {
    console.error("🚨 Lỗi khi lấy đơn hàng:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// 🟢 API: Đặt hàng (Yêu cầu đăng nhập)
router.post("/", async (req, res) => {
  const { user_id, total_price, items } = req.body;

  try {
    // 🔥 Lấy username từ bảng users
    const userResult = await db.query("SELECT username FROM users WHERE id = $1", [user_id]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "User không tồn tại" });
    }
    
    const username = userResult.rows[0].username;

    // 🔥 Thêm đơn hàng vào bảng orders
    const orderResult = await db.query(
      "INSERT INTO orders (user_id, username, total_price, created_at) VALUES ($1, $2, $3, DEFAULT) RETURNING id",
      [user_id, username, total_price]
    );

    const order_id = orderResult.rows[0].id;

    // 🔥 Thêm sản phẩm vào bảng order_items
    for (const item of items) {
      await db.query(
        "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)",
        [order_id, item.id, item.quantity, item.price]
      );
    }

    res.json({ message: "✅ Đặt hàng thành công!", order_id });
  } catch (error) {
    console.error("🚨 Lỗi khi đặt hàng:", error);
    res.status(500).json({ error: "Lỗi server" });
  }
});

module.exports = router;
