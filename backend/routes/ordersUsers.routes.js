const express = require("express");
const router = express.Router();
const { placeOrder, getOrdersByUser } = require("../controllers/ordersUsers.controller");

// Đặt hàng
router.post("/", placeOrder);

// Lấy danh sách đơn hàng theo user_id
router.get("/:user_id", getOrdersByUser);

module.exports = router;
