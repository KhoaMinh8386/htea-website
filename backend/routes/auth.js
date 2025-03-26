const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");
const router = express.Router();

router.get("/users", async (req, res) => {
    try {
      const result = await db.query("SELECT id, username, created_at FROM users");
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: "Lỗi server" });
    }
});

// 🔹 Đăng ký
router.post("/register", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) return res.status(400).json({ error: "Vui lòng nhập đầy đủ thông tin" });

  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const result = await db.query(
      "INSERT INTO users (username, password, created_at) VALUES ($1, $2, NOW()) RETURNING id",
      [username, hashedPassword]
    );
    res.status(201).json({ message: "Đăng ký thành công!" });
  } catch (err) {
    res.status(500).json({ error: "Lỗi server" });
  }
});

// 🔹 Đăng nhập
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const result = await db.query("SELECT * FROM users WHERE username = $1", [username]);

  if (result.rows.length === 0) return res.status(400).json({ error: "Sai tên đăng nhập hoặc mật khẩu!" });

  const user = result.rows[0];
  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) return res.status(400).json({ error: "Sai mật khẩu!" });

  const token = jwt.sign({ userId: user.id }, "SECRET_KEY", { expiresIn: "1h" });

  res.json({ id: user.id, username: user.username, role: user.role, token });
});

module.exports = router;
