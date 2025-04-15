const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db"); // ✅ Kết nối database
require("dotenv").config(); // ✅ Sử dụng biến môi trường
const pool = require('../config/db');

// ✅ API Đăng nhập
const loginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await db.query("SELECT * FROM users WHERE username = $1", [username]);

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Tài khoản không tồn tại" });
    }

    const user = result.rows[0];

    // ✅ Kiểm tra mật khẩu
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Mật khẩu không đúng" });
    }

    // ✅ Tạo token JWT
    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Lỗi khi đăng nhập:", error);
    res.status(500).json({ message: "Lỗi server", error });
  }
};

// Lấy danh sách người dùng (có phân trang và lọc)
const getUsers = async (req, res) => {
    try {
        const { 
            role, 
            search, 
            page = 1, 
            limit = 10,
            is_active 
        } = req.query;
        const offset = (page - 1) * limit;

        let query = `
            SELECT id, username, email, role, full_name, phone, 
                   created_at, last_login, is_active
            FROM users
            WHERE 1=1
        `;
        const params = [];

        if (role) {
            query += ` AND role = $${params.length + 1}`;
            params.push(role);
        }

        if (search) {
            query += ` AND (username ILIKE $${params.length + 1} 
                         OR email ILIKE $${params.length + 1}
                         OR full_name ILIKE $${params.length + 1})`;
            params.push(`%${search}%`);
        }

        if (is_active !== undefined) {
            query += ` AND is_active = $${params.length + 1}`;
            params.push(is_active === 'true');
        }

        // Đếm tổng số người dùng
        const countQuery = query.replace(
            'SELECT id, username, email, role, full_name, phone, created_at, last_login, is_active',
            'SELECT COUNT(*)'
        );
        const countResult = await pool.query(countQuery, params);
        const total = parseInt(countResult.rows[0].count);

        // Lấy danh sách người dùng có phân trang
        query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(limit, offset);

        const result = await pool.query(query, params);

        res.json({
            users: result.rows,
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

// Lấy thông tin chi tiết người dùng
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `SELECT id, username, email, role, full_name, phone, address,
                    created_at, last_login, is_active
             FROM users
             WHERE id = $1`,
            [id]
        );

        if (!result.rows[0]) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }

        // Lấy lịch sử đơn hàng
        const orderHistory = await pool.query(
            `SELECT id, total_amount, status, created_at
             FROM orders
             WHERE user_id = $1
             ORDER BY created_at DESC
             LIMIT 5`,
            [id]
        );

        res.json({
            ...result.rows[0],
            order_history: orderHistory.rows
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Cập nhật thông tin người dùng (chỉ admin)
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            username, 
            email, 
            role, 
            full_name, 
            phone, 
            address, 
            is_active 
        } = req.body;

        // Kiểm tra người dùng tồn tại
        const oldUser = await pool.query(
            'SELECT * FROM users WHERE id = $1',
            [id]
        );

        if (!oldUser.rows[0]) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }

        // Kiểm tra username và email không trùng
        if (username || email) {
            const userExists = await pool.query(
                `SELECT * FROM users 
                 WHERE (username = $1 OR email = $2) AND id != $3`,
                [username || oldUser.rows[0].username, email || oldUser.rows[0].email, id]
            );

            if (userExists.rows[0]) {
                return res.status(400).json({ 
                    message: 'Username hoặc email đã tồn tại' 
                });
            }
        }

        // Cập nhật thông tin
        const result = await pool.query(
            `UPDATE users 
             SET username = COALESCE($1, username),
                 email = COALESCE($2, email),
                 role = COALESCE($3, role),
                 full_name = COALESCE($4, full_name),
                 phone = COALESCE($5, phone),
                 address = COALESCE($6, address),
                 is_active = COALESCE($7, is_active)
             WHERE id = $8
             RETURNING id, username, email, role, full_name, phone, address, is_active`,
            [username, email, role, full_name, phone, address, is_active, id]
        );

        // Ghi log
        await pool.query(
            `INSERT INTO audit_logs (user_id, action, table_name, record_id, old_values, new_values)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [
                req.user.id,
                'UPDATE',
                'users',
                id,
                JSON.stringify(oldUser.rows[0]),
                JSON.stringify(result.rows[0])
            ]
        );

        res.json({
            message: 'Cập nhật thông tin người dùng thành công',
            user: result.rows[0]
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Đổi mật khẩu
const changePassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { current_password, new_password } = req.body;

        // Kiểm tra người dùng tồn tại
        const user = await pool.query(
            'SELECT * FROM users WHERE id = $1',
            [id]
        );

        if (!user.rows[0]) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }

        // Kiểm tra quyền thay đổi mật khẩu
        if (req.user.role !== 'admin' && req.user.id !== parseInt(id)) {
            return res.status(403).json({ message: 'Không có quyền thay đổi mật khẩu' });
        }

        // Kiểm tra mật khẩu hiện tại
        if (req.user.role !== 'admin') {
            const validPassword = await bcrypt.compare(
                current_password,
                user.rows[0].password
            );

            if (!validPassword) {
                return res.status(400).json({ message: 'Mật khẩu hiện tại không đúng' });
            }
        }

        // Mã hóa mật khẩu mới
        const hashedPassword = await bcrypt.hash(new_password, 10);

        // Cập nhật mật khẩu
        await pool.query(
            'UPDATE users SET password = $1 WHERE id = $2',
            [hashedPassword, id]
        );

        // Ghi log nếu là admin
        if (req.user.role === 'admin') {
            await pool.query(
                `INSERT INTO audit_logs (user_id, action, table_name, record_id)
                 VALUES ($1, $2, $3, $4)`,
                [req.user.id, 'UPDATE', 'users', id]
            );
        }

        res.json({ message: 'Đổi mật khẩu thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Khóa/mở khóa tài khoản (chỉ admin)
const toggleUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { is_active } = req.body;

        // Kiểm tra người dùng tồn tại
        const oldUser = await pool.query(
            'SELECT * FROM users WHERE id = $1',
            [id]
        );

        if (!oldUser.rows[0]) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }

        // Không cho phép khóa tài khoản admin
        if (oldUser.rows[0].role === 'admin') {
            return res.status(403).json({ message: 'Không thể khóa tài khoản admin' });
        }

        // Cập nhật trạng thái
        const result = await pool.query(
            `UPDATE users 
             SET is_active = $1
             WHERE id = $2
             RETURNING id, username, email, role, is_active`,
            [is_active, id]
        );

        // Ghi log
        await pool.query(
            `INSERT INTO audit_logs (user_id, action, table_name, record_id, old_values, new_values)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [
                req.user.id,
                'UPDATE',
                'users',
                id,
                JSON.stringify(oldUser.rows[0]),
                JSON.stringify(result.rows[0])
            ]
        );

        res.json({
            message: `${is_active ? 'Mở khóa' : 'Khóa'} tài khoản thành công`,
            user: result.rows[0]
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

module.exports = {
    loginUser,
    getUsers,
    getUserById,
    updateUser,
    changePassword,
    toggleUserStatus
};
