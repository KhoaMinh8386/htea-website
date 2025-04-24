const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db"); // ✅ Kết nối database
const { User } = require('../models/User');
const { Op } = require('sequelize');
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
        console.log('Getting users...');
        const { 
            role, 
            search, 
            page = 1, 
            limit = 10,
            is_active 
        } = req.query;
        const offset = (page - 1) * limit;

        // Tạo điều kiện tìm kiếm
        const where = {};
        if (role) where.role = role;
        if (is_active !== undefined) where.is_active = is_active === 'true';
        if (search) {
            where[Op.or] = [
                { username: { [Op.iLike]: `%${search}%` } },
                { email: { [Op.iLike]: `%${search}%` } },
                { full_name: { [Op.iLike]: `%${search}%` } }
            ];
        }

        // Lấy danh sách người dùng
        const { count, rows } = await User.findAndCountAll({
            where,
            attributes: ['id', 'username', 'email', 'role', 'full_name', 'phone', 'created_at', 'last_login', 'is_active'],
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        console.log('Users found:', rows.length);

        res.json({
            success: true,
            data: {
                users: rows,
                pagination: {
                    total: count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(count / limit)
                }
            }
        });
    } catch (error) {
        console.error('Error in getUsers:', error);
        res.status(500).json({ 
            success: false,
            message: 'Lỗi server',
            error: error.message 
        });
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
    console.log('Update user request:', req.body);
    const { id } = req.params;
    const { full_name, email, password, role } = req.body;

    // Validate input
    if (!full_name || !email || !role) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp đầy đủ thông tin'
      });
    }

    // Validate role
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Vai trò không hợp lệ'
      });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Người dùng không tồn tại'
      });
    }

    // Check if email is already taken by another user
    const existingUser = await User.findOne({
      where: {
        email,
        id: { [Op.ne]: id }
      }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email đã được sử dụng'
      });
    }

    // Update user
    const updateData = {
      full_name,
      email,
      role
    };

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    await user.update(updateData);

    // Lấy lại thông tin user sau khi update
    const updatedUser = await User.findByPk(id);

    console.log('User updated successfully:', updatedUser.toJSON());
    res.json({
      success: true,
      message: 'Cập nhật người dùng thành công',
      user: {
        id: updatedUser.id,
        full_name: updatedUser.full_name,
        email: updatedUser.email,
        role: updatedUser.role,
        created_at: updatedUser.created_at
      }
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật người dùng',
      error: error.message
    });
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
