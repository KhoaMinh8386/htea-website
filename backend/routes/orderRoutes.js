const express = require("express");
const router = express.Router();
const { createOrder, getOrders, getOrderById, updateOrderStatus, getOrderStats } = require('../controllers/orderController');
const { auth, adminAuth } = require('../middleware/auth');

// Routes công khai
router.post('/', createOrder); // Không yêu cầu xác thực
router.get('/:id', getOrderById);

// Routes yêu cầu đăng nhập
router.get('/', auth, getOrders);

// Routes chỉ dành cho admin
router.put('/:id/status', auth, adminAuth, updateOrderStatus);
router.get('/stats', auth, adminAuth, getOrderStats);

module.exports = router;
