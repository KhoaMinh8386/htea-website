const pool = require('../config/db');

// Tạo đơn hàng mới
const createOrder = async (req, res) => {
    const client = await pool.connect();
    try {
        console.log('Starting order creation process...');
        console.log('Request body:', JSON.stringify(req.body, null, 2));
        console.log('User:', JSON.stringify(req.user, null, 2));
        
        await client.query('BEGIN');
        console.log('Transaction started');

        // Get user_id from authenticated user
        const userId = req.user?.id;
        if (!userId) {
            throw new Error('User not authenticated');
        }

        // Validate required fields
        const requiredFields = ['customer_name', 'customer_email', 'phone', 'shipping_address', 'total_amount', 'items'];
        for (const field of requiredFields) {
            if (!req.body[field]) {
                throw new Error(`Missing required field: ${field}`);
            }
        }

        // Validate items
        if (!Array.isArray(req.body.items) || req.body.items.length === 0) {
            throw new Error('Items must be a non-empty array');
        }

        // Sanitize and validate items
        const sanitizedItems = [];
        for (const item of req.body.items) {
            console.log('Processing item:', JSON.stringify(item, null, 2));
            
            // Validate required fields
            if (!item.product_id || !item.quantity || !item.price) {
                throw new Error(`Invalid item data: ${JSON.stringify(item)}`);
            }

            // Convert values to numbers
            const productId = parseInt(item.product_id);
            const quantity = parseInt(item.quantity);
            const price = parseFloat(item.price);

            if (isNaN(productId) || isNaN(quantity) || isNaN(price)) {
                throw new Error(`Invalid numeric values in item: ${JSON.stringify(item)}`);
            }

            // Validate product exists
            const productResult = await client.query(
                'SELECT id, price FROM products WHERE id = $1',
                [productId]
            );

            if (!productResult.rows[0]) {
                throw new Error(`Product with id ${productId} not found`);
            }

            // Validate price matches
            const productPrice = parseFloat(productResult.rows[0].price);
            if (Math.abs(productPrice - price) > 0.01) { // Allow small floating point differences
                throw new Error(`Price mismatch for product ${productId}. Expected: ${productPrice}, Received: ${price}`);
            }

            sanitizedItems.push({
                product_id: productId,
                quantity: quantity,
                price: price
            });
        }

        console.log('Sanitized items:', JSON.stringify(sanitizedItems, null, 2));

        // Convert total_amount to number
        const totalAmount = parseFloat(req.body.total_amount);
        if (isNaN(totalAmount)) {
            throw new Error('Invalid total_amount value');
        }

        // Create order
        const orderResult = await client.query(
            `INSERT INTO orders (
                user_id, 
                total_amount, 
                status, 
                shipping_address, 
                phone,
                customer_name,
                customer_email,
                notes
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
            [
                userId,
                totalAmount,
                'pending',
                req.body.shipping_address,
                req.body.phone,
                req.body.customer_name,
                req.body.customer_email,
                req.body.notes || null
            ]
        );

        console.log('Order created with result:', JSON.stringify(orderResult.rows, null, 2));

        const orderId = orderResult.rows[0]?.id;
        
        if (!orderId) {
            throw new Error('Failed to create order - no ID returned');
        }

        console.log('Created order ID:', orderId);

        // Add order items
        for (const item of sanitizedItems) {
            console.log('Adding order item:', JSON.stringify(item, null, 2));
            await client.query(
                `INSERT INTO order_items (
                    order_id, 
                    product_id, 
                    quantity, 
                    price
                ) VALUES ($1, $2, $3, $4)`,
                [orderId, item.product_id, item.quantity, item.price]
            );
        }

        console.log('All order items added successfully');

        // Get full order details
        const orderDetails = await client.query(
            `SELECT 
                o.*,
                json_agg(
                    json_build_object(
                        'id', oi.id,
                        'product_id', oi.product_id,
                        'quantity', oi.quantity,
                        'price', oi.price
                    )
                ) as items
            FROM orders o
            LEFT JOIN order_items oi ON o.id = oi.order_id
            WHERE o.id = $1
            GROUP BY o.id`,
            [orderId]
        );

        console.log('Retrieved order details:', JSON.stringify(orderDetails.rows[0], null, 2));

        await client.query('COMMIT');
        console.log('Transaction committed successfully');

        res.status(201).json({
            success: true,
            message: 'Đặt hàng thành công',
            data: orderDetails.rows[0]
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error in order creation:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            success: false,
            message: error.message || 'Có lỗi xảy ra khi đặt hàng'
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