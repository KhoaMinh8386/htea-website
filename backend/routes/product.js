const express = require("express");
const router = express.Router();
const db = require("../db");

// 🟢 API: Lấy danh sách sản phẩm
router.get("/", async (req, res) => {
  try {
    const productsResult = await db.query("SELECT * FROM product ORDER BY id ASC");
    const products = productsResult.rows;
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🟢 API: Thêm sản phẩm mới
router.post("/", async (req, res) => {
  const { name, price, description } = req.body;
  
  try {
    const newProduct = await db.query(
      "INSERT INTO product (name, price, description) VALUES ($1, $2, $3) RETURNING *",
      [name, price, description]
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

// 🟢 API: Sửa thông tin sản phẩm theo ID
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, price, description } = req.body;

  try {
    await db.query(
      "UPDATE product SET name=$1, price=$2, description=$3 WHERE id=$4",
      [name, price, description, id]
    );

    res.json({ message: "Sản phẩm đã cập nhật!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
