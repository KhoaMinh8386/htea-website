const pool = require('../config/db');

// Tạo đơn hàng mới
const createOrder = async (req, res) => {
    const client = await pool.connect();
    try {
        console.log('Received order data:', req.body);
        await client.query('BEGIN');

        const { items, customer_name, customer_email, customer_phone, delivery_address, notes } = req.body;
        const userId = req.user ? req.user.id : null;

        // Validate required fields
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Danh sách sản phẩm không hợp lệ'
            });
        }

        if (!customer_name || !customer_email || !customer_phone || !delivery_address) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu thông tin bắt buộc'
            });
        }

        // Tính tổng tiền và kiểm tra số lượng tồn kho
        let totalAmount = 0;
        for (const item of items) {
            if (!item.product_id || !item.quantity || !item.price) {
                await client.query('ROLLBACK');
                return res.status(400).json({
                    success: false,
                    message: 'Thông tin sản phẩm không hợp lệ'
                });
            }

            const product = await client.query(
                'SELECT price, stock_quantity FROM products WHERE id = $1 AND is_available = true',
                [item.product_id]
            );

            if (!product.rows[0]) {
                await client.query('ROLLBACK');
                return res.status(400).json({
                    success: false,
                    message: `Sản phẩm ID ${item.product_id} không tồn tại hoặc đã ngừng kinh doanh`
                });
            }

            if (product.rows[0].stock_quantity < item.quantity) {
                await client.query('ROLLBACK');
                return res.status(400).json({
                    success: false,
                    message: `Sản phẩm ID ${item.product_id} không đủ số lượng tồn kho`
                });
            }

            totalAmount += product.rows[0].price * item.quantity;
        }

        console.log('Creating order with total amount:', totalAmount);

        // Tạo đơn hàng
        const orderResult = await client.query(
            `INSERT INTO orders (
                user_id, customer_name, customer_email, customer_phone, 
                delivery_address, total_amount, notes, status
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')
            RETURNING id`,
            [userId, customer_name, customer_email, customer_phone, delivery_address, totalAmount, notes]
        );

        const orderId = orderResult.rows[0].id;
        console.log('Created order with ID:', orderId);

        // Thêm chi tiết đơn hàng và cập nhật số lượng tồn kho
        for (const item of items) {
            const product = await client.query(
                'SELECT price FROM products WHERE id = $1',
                [item.product_id]
            );

            await client.query(
                `INSERT INTO order_items (
                    order_id, product_id, quantity, price
                ) VALUES ($1, $2, $3, $4)`,
                [
                    orderId,
                    item.product_id,
                    item.quantity,
                    product.rows[0].price
                ]
            );

            // Cập nhật số lượng tồn kho
            await client.query(
                'UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2',
                [item.quantity, item.product_id]
            );
        }

        // Ghi log
        if (userId) {
            await client.query(
                `INSERT INTO audit_logs (user_id, action, table_name, record_id, new_values)
                 VALUES ($1, $2, $3, $4, $5)`,
                [userId, 'CREATE', 'orders', orderId, JSON.stringify({ items, totalAmount })]
            );
        }

        await client.query('COMMIT');

        res.status(201).json({
            success: true,
            message: 'Đặt hàng thành công',
            order_id: orderId
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error in createOrder:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    } finally {
        client.release();
    }
};

// Lấy danh sách đơn hàng
const getOrders = async (req, res) => {
    try {
        const { status, start_date, end_date, page = 1, limit = 10, user_id } = req.query;
        const offset = (page - 1) * limit;

        let query = `
            SELECT o.*, 
                   u.username as user_username,
                   u.email as user_email
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
            WHERE 1=1
        `;
        const params = [];

        if (status) {
            query += ` AND o.status = $${params.length + 1}`;
            params.push(status);
        }

        if (start_date) {
            query += ` AND o.created_at >= $${params.length + 1}`;
            params.push(start_date);
        }

        if (end_date) {
            query += ` AND o.created_at <= $${params.length + 1}`;
            params.push(end_date);
        }

        if (user_id) {
            query += ` AND o.user_id = $${params.length + 1}`;
            params.push(user_id);
        }

        // Đếm tổng số đơn hàng
        const countQuery = query.replace('SELECT o.*, u.username as user_username, u.email as user_email', 'SELECT COUNT(*)');
        const countResult = await pool.query(countQuery, params);
        const total = parseInt(countResult.rows[0].count);

        // Lấy danh sách đơn hàng có phân trang
        query += ` ORDER BY o.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(limit, offset);

        const result = await pool.query(query, params);

        res.json({
            orders: result.rows,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error in getOrders:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Lấy chi tiết đơn hàng
const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;

        // Lấy thông tin đơn hàng
        const orderResult = await pool.query(
            `SELECT o.*, 
                    u.username as user_username,
                    u.email as user_email
             FROM orders o
             LEFT JOIN users u ON o.user_id = u.id
             WHERE o.id = $1`,
            [id]
        );

        if (!orderResult.rows[0]) {
            return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
        }

        // Lấy chi tiết sản phẩm trong đơn hàng
        const itemsResult = await pool.query(
            `SELECT oi.*, p.name as product_name, p.image_url
             FROM order_items oi
             JOIN products p ON oi.product_id = p.id
             WHERE oi.order_id = $1`,
            [id]
        );

        res.json({
            ...orderResult.rows[0],
            items: itemsResult.rows
        });
    } catch (error) {
        console.error('Error in getOrderById:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Cập nhật trạng thái đơn hàng
const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Kiểm tra đơn hàng tồn tại
        const oldOrder = await pool.query(
            'SELECT * FROM orders WHERE id = $1',
            [id]
        );

        if (!oldOrder.rows[0]) {
            return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
        }

        // Cập nhật trạng thái
        const result = await pool.query(
            `UPDATE orders 
             SET status = $1
             WHERE id = $2
             RETURNING *`,
            [status, id]
        );

        // Ghi log
        await pool.query(
            `INSERT INTO audit_logs (user_id, action, table_name, record_id, old_values, new_values)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [
                req.user.id,
                'UPDATE',
                'orders',
                id,
                JSON.stringify(oldOrder.rows[0]),
                JSON.stringify(result.rows[0])
            ]
        );

        res.json({
            message: 'Cập nhật trạng thái đơn hàng thành công',
            order: result.rows[0]
        });
    } catch (error) {
        console.error('Error in updateOrderStatus:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Lấy thống kê đơn hàng
const getOrderStats = async (req, res) => {
    try {
        const { start_date, end_date } = req.query;

        let query = `
            SELECT 
                COUNT(*) as total_orders,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_orders,
                SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END) as processing_orders,
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_orders,
                SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_orders,
                SUM(total_amount) as total_revenue
            FROM orders
            WHERE 1=1
        `;
        const params = [];

        if (start_date) {
            query += ` AND created_at >= $${params.length + 1}`;
            params.push(start_date);
        }

        if (end_date) {
            query += ` AND created_at <= $${params.length + 1}`;
            params.push(end_date);
        }

        const result = await pool.query(query, params);

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error in getOrderStats:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

module.exports = {
    createOrder,
    getOrders,
    getOrderById,
    updateOrderStatus,
    getOrderStats
}; 