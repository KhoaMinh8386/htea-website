const express = require("express");
const router = express.Router();
const db = require("../db");

// 🟢 API: Lấy danh sách sản phẩm
router.get("/", async (req, res) => {
  try {
    const productsResult = await db.query("SELECT * FROM product ORDER BY id ASC");
    res.json(productsResult.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🟢 API: Thêm sản phẩm mới (Không có description)
router.post("/", async (req, res) => {
  const { name, price } = req.body; // Xóa description

  if (!name || !price) {
    return res.status(400).json({ error: "Tên và giá sản phẩm là bắt buộc!" });
  }

  try {
    const newProduct = await db.query(
      "INSERT INTO product (name, price) VALUES ($1, $2) RETURNING *",
      [name, price]
    );
    res.status(201).json({ message: "Sản phẩm đã thêm!", product: newProduct.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🟢 API: Xóa sản phẩm theo ID
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("DELETE FROM product WHERE id = $1", [id]);
    res.json({ message: "Sản phẩm đã xóa!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🟢 API: Sửa thông tin sản phẩm theo ID (Không có description)
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, price } = req.body; // Xóa description

  try {
    await db.query(
      "UPDATE product SET name=$1, price=$2 WHERE id=$3",
      [name, price, id]
    );
    res.json({ message: "Sản phẩm đã cập nhật!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
