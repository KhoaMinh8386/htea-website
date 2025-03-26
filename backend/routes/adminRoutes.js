const express = require("express");
const { getOrders, getProducts, updateProduct } = require("../controllers/adminController");
const { protectAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/orders", protectAdmin, getOrders);  // Lấy danh sách đơn hàng
router.get("/products", protectAdmin, getProducts); // Lấy danh sách sản phẩm
router.put("/products/:id", protectAdmin, updateProduct); // Cập nhật sản phẩm

module.exports = router;
