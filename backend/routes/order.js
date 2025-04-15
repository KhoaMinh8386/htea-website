const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middleware/auth');
const {
    createOrder,
    getOrders,
    getOrderById,
    updateOrderStatus,
    getOrderStats
} = require('../controllers/orderController');

// Routes công khai
router.post('/', createOrder);
router.get('/:id', getOrderById);

// Routes yêu cầu đăng nhập
router.get('/', auth, getOrders);

// Routes chỉ dành cho admin
router.put('/:id/status', auth, adminAuth, updateOrderStatus);
router.get('/stats', auth, adminAuth, getOrderStats);

module.exports = router; 