const express = require("express");
const router = express.Router();
const db = require("../db"); // Import kết nối DB
const { loginUser } = require("../controllers/userController"); // Import login controller

// ✅ API: Đăng nhập
router.post("/login", loginUser);

// ✅ API: Lấy danh sách tất cả người dùng
router.get("/", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM users"); // Kiểm tra bảng 'users'
    res.json(result.rows);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách users:", error);
    res.status(500).json({ error: "Lỗi server" });
  }
});

module.exports = router; // ✅ Đảm bảo chỉ export `router`
