const pool = require('../config/db');

// Lấy thống kê tổng quan
const getDashboardStats = async (req, res) => {
    try {
        // Thống kê đơn hàng
        const orderStats = await pool.query(`
            SELECT 
                COUNT(*) as total_orders,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_orders,
                SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END) as processing_orders,
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_orders,
                SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_orders,
                SUM(total_amount) as total_revenue
            FROM orders
            WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
        `);

        // Thống kê sản phẩm
        const productStats = await pool.query(`
            SELECT 
                COUNT(*) as total_products,
                SUM(CASE WHEN is_available = true THEN 1 ELSE 0 END) as active_products,
                SUM(CASE WHEN is_available = false THEN 1 ELSE 0 END) as inactive_products
            FROM products
        `);

        // Thống kê người dùng
        const userStats = await pool.query(`
            SELECT 
                COUNT(*) as total_users,
                SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as admin_users,
                SUM(CASE WHEN role = 'user' THEN 1 ELSE 0 END) as normal_users,
                COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as new_users
            FROM users
        `);

        // Thống kê doanh thu theo ngày (30 ngày gần nhất)
        const revenueStats = await pool.query(`
            SELECT 
                DATE(created_at) as date,
                COUNT(*) as order_count,
                SUM(total_amount) as daily_revenue
            FROM orders
            WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
            GROUP BY DATE(created_at)
            ORDER BY date DESC
        `);

        // Thống kê sản phẩm bán chạy
        const topProducts = await pool.query(`
            SELECT 
                p.id,
                p.name,
                p.price,
                COUNT(oi.id) as order_count,
                SUM(oi.quantity) as total_quantity,
                SUM(oi.subtotal) as total_revenue
            FROM products p
            JOIN order_items oi ON p.id = oi.product_id
            JOIN orders o ON oi.order_id = o.id
            WHERE o.created_at >= CURRENT_DATE - INTERVAL '30 days'
            GROUP BY p.id, p.name, p.price
            ORDER BY total_quantity DESC
            LIMIT 10
        `);

        res.json({
            order_stats: orderStats.rows[0],
            product_stats: productStats.rows[0],
            user_stats: userStats.rows[0],
            revenue_stats: revenueStats.rows,
            top_products: topProducts.rows
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Lấy danh sách hoạt động gần đây
const getRecentActivities = async (req, res) => {
    try {
        const { limit = 20 } = req.query;

        const result = await pool.query(`
            SELECT 
                al.*,
                u.username,
                u.email
            FROM audit_logs al
            JOIN users u ON al.user_id = u.id
            ORDER BY al.created_at DESC
            LIMIT $1
        `, [limit]);

        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Lấy thống kê theo danh mục
const getCategoryStats = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                pc.name as category_name,
                COUNT(DISTINCT p.id) as product_count,
                COUNT(DISTINCT oi.order_id) as order_count,
                SUM(oi.quantity) as total_quantity,
                SUM(oi.subtotal) as total_revenue
            FROM product_categories pc
            LEFT JOIN products p ON pc.name = p.category
            LEFT JOIN order_items oi ON p.id = oi.product_id
            LEFT JOIN orders o ON oi.order_id = o.id
            WHERE o.created_at >= CURRENT_DATE - INTERVAL '30 days'
            GROUP BY pc.name
            ORDER BY total_revenue DESC
        `);

        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Lấy thống kê theo khách hàng
const getCustomerStats = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                u.id,
                u.username,
                u.email,
                u.created_at,
                COUNT(DISTINCT o.id) as order_count,
                SUM(o.total_amount) as total_spent,
                MAX(o.created_at) as last_order_date
            FROM users u
            LEFT JOIN orders o ON u.id = o.user_id
            WHERE u.role = 'user'
            GROUP BY u.id, u.username, u.email, u.created_at
            ORDER BY total_spent DESC
            LIMIT 10
        `);

        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

module.exports = {
    getDashboardStats,
    getRecentActivities,
    getCategoryStats,
    getCustomerStats
}; 