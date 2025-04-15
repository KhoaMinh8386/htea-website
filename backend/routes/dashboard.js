const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middleware/auth');
const {
    getDashboardStats,
    getRecentActivities,
    getCategoryStats,
    getCustomerStats
} = require('../controllers/dashboardController');

// Tất cả routes đều yêu cầu quyền admin
router.use(auth, adminAuth);

// Thống kê tổng quan
router.get('/stats', getDashboardStats);

// Hoạt động gần đây
router.get('/activities', getRecentActivities);

// Thống kê theo danh mục
router.get('/category-stats', getCategoryStats);

// Thống kê theo khách hàng
router.get('/customer-stats', getCustomerStats);

module.exports = router; 