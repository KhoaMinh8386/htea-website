const pool = require('../config/db');

// Lấy danh sách đánh giá (có phân trang và lọc)
const getReviews = async (req, res) => {
    try {
        const { 
            product_id,
            rating,
            page = 1, 
            limit = 10
        } = req.query;
        const offset = (page - 1) * limit;

        let query = `
            SELECT r.*, u.username, u.full_name, p.name as product_name
            FROM reviews r
            JOIN users u ON r.user_id = u.id
            JOIN products p ON r.product_id = p.id
            WHERE 1=1
        `;
        const params = [];

        if (product_id) {
            query += ` AND r.product_id = $${params.length + 1}`;
            params.push(product_id);
        }

        if (rating) {
            query += ` AND r.rating = $${params.length + 1}`;
            params.push(rating);
        }

        // Đếm tổng số đánh giá
        const countQuery = query.replace(
            'SELECT r.*, u.username, u.full_name, p.name as product_name',
            'SELECT COUNT(*)'
        );
        const countResult = await pool.query(countQuery, params);
        const total = parseInt(countResult.rows[0].count);

        // Lấy danh sách đánh giá có phân trang
        query += ` ORDER BY r.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(limit, offset);

        const result = await pool.query(query, params);

        res.json({
            reviews: result.rows,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Lấy thông tin chi tiết đánh giá
const getReviewById = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `SELECT r.*, u.username, u.full_name, p.name as product_name
             FROM reviews r
             JOIN users u ON r.user_id = u.id
             JOIN products p ON r.product_id = p.id
             WHERE r.id = $1`,
            [id]
        );

        if (!result.rows[0]) {
            return res.status(404).json({ message: 'Không tìm thấy đánh giá' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Tạo đánh giá mới
const createReview = async (req, res) => {
    try {
        const { product_id, rating, comment } = req.body;
        const user_id = req.user.id;

        // Kiểm tra sản phẩm tồn tại
        const product = await pool.query(
            'SELECT * FROM products WHERE id = $1',
            [product_id]
        );

        if (!product.rows[0]) {
            return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
        }

        // Kiểm tra người dùng đã mua sản phẩm chưa
        const order = await pool.query(
            `SELECT o.* FROM orders o
             JOIN order_items oi ON o.id = oi.order_id
             WHERE o.user_id = $1 AND oi.product_id = $2 AND o.status = 'completed'`,
            [user_id, product_id]
        );

        if (!order.rows[0]) {
            return res.status(403).json({ 
                message: 'Bạn cần mua sản phẩm trước khi đánh giá' 
            });
        }

        // Kiểm tra người dùng đã đánh giá sản phẩm chưa
        const existingReview = await pool.query(
            'SELECT * FROM reviews WHERE user_id = $1 AND product_id = $2',
            [user_id, product_id]
        );

        if (existingReview.rows[0]) {
            return res.status(400).json({ 
                message: 'Bạn đã đánh giá sản phẩm này' 
            });
        }

        // Tạo đánh giá mới
        const result = await pool.query(
            `INSERT INTO reviews (user_id, product_id, rating, comment)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [user_id, product_id, rating, comment]
        );

        // Cập nhật điểm đánh giá trung bình của sản phẩm
        await pool.query(
            `UPDATE products 
             SET rating = (
                 SELECT AVG(rating) 
                 FROM reviews 
                 WHERE product_id = $1
             )
             WHERE id = $1`,
            [product_id]
        );

        res.status(201).json({
            message: 'Tạo đánh giá thành công',
            review: result.rows[0]
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Cập nhật đánh giá
const updateReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, comment } = req.body;
        const user_id = req.user.id;

        // Kiểm tra đánh giá tồn tại
        const oldReview = await pool.query(
            'SELECT * FROM reviews WHERE id = $1',
            [id]
        );

        if (!oldReview.rows[0]) {
            return res.status(404).json({ message: 'Không tìm thấy đánh giá' });
        }

        // Kiểm tra quyền cập nhật
        if (oldReview.rows[0].user_id !== user_id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Không có quyền cập nhật đánh giá này' });
        }

        // Cập nhật đánh giá
        const result = await pool.query(
            `UPDATE reviews 
             SET rating = $1, comment = $2
             WHERE id = $3
             RETURNING *`,
            [rating, comment, id]
        );

        // Cập nhật điểm đánh giá trung bình của sản phẩm
        await pool.query(
            `UPDATE products 
             SET rating = (
                 SELECT AVG(rating) 
                 FROM reviews 
                 WHERE product_id = $1
             )
             WHERE id = $1`,
            [oldReview.rows[0].product_id]
        );

        // Ghi log nếu là admin
        if (req.user.role === 'admin') {
            await pool.query(
                `INSERT INTO audit_logs (user_id, action, table_name, record_id, old_values, new_values)
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [
                    req.user.id,
                    'UPDATE',
                    'reviews',
                    id,
                    JSON.stringify(oldReview.rows[0]),
                    JSON.stringify(result.rows[0])
                ]
            );
        }

        res.json({
            message: 'Cập nhật đánh giá thành công',
            review: result.rows[0]
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Xóa đánh giá
const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user.id;

        // Kiểm tra đánh giá tồn tại
        const oldReview = await pool.query(
            'SELECT * FROM reviews WHERE id = $1',
            [id]
        );

        if (!oldReview.rows[0]) {
            return res.status(404).json({ message: 'Không tìm thấy đánh giá' });
        }

        // Kiểm tra quyền xóa
        if (oldReview.rows[0].user_id !== user_id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Không có quyền xóa đánh giá này' });
        }

        // Xóa đánh giá
        await pool.query('DELETE FROM reviews WHERE id = $1', [id]);

        // Cập nhật điểm đánh giá trung bình của sản phẩm
        await pool.query(
            `UPDATE products 
             SET rating = (
                 SELECT AVG(rating) 
                 FROM reviews 
                 WHERE product_id = $1
             )
             WHERE id = $1`,
            [oldReview.rows[0].product_id]
        );

        // Ghi log nếu là admin
        if (req.user.role === 'admin') {
            await pool.query(
                `INSERT INTO audit_logs (user_id, action, table_name, record_id, old_values)
                 VALUES ($1, $2, $3, $4, $5)`,
                [
                    req.user.id,
                    'DELETE',
                    'reviews',
                    id,
                    JSON.stringify(oldReview.rows[0])
                ]
            );
        }

        res.json({ message: 'Xóa đánh giá thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

module.exports = {
    getReviews,
    getReviewById,
    createReview,
    updateReview,
    deleteReview
}; 