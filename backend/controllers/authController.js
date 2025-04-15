const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { sendEmail } = require('../utils/email');
const { User } = require('../models/User');
const { sequelize } = require('../config/db');

const register = async (req, res) => {
    try {
        const { username, email, password, full_name, phone, address } = req.body;

        // Kiểm tra email và username đã tồn tại
        const userExists = await User.findOne({
            where: {
                [sequelize.Op.or]: [
                    { username },
                    { email }
                ]
            }
        });

        if (userExists) {
            return res.status(400).json({
                success: false,
                message: 'User already exists'
            });
        }

        // Mã hóa mật khẩu
        const hashedPassword = await bcrypt.hash(password, 10);

        // Tạo user mới
        const user = await User.create({
            username,
            email,
            password: hashedPassword,
            full_name,
            phone,
            address
        });

        sendTokenResponse(user, 201, res);
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Tìm user
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Kiểm tra mật khẩu
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Kiểm tra tài khoản có bị khóa
        if (!user.is_active) {
            return res.status(403).json({ message: 'Tài khoản đã bị khóa' });
        }

        // Cập nhật last_login
        user.last_login = new Date();
        await user.save();

        sendTokenResponse(user, 200, res);
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

const getMe = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password'] }
        });

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

const logout = async (req, res) => {
    try {
        // Xóa session
        await pool.query(
            'DELETE FROM user_sessions WHERE user_id = $1 AND token = $2',
            [req.user.id, req.token]
        );

        res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Tạo token reset password
        const resetToken = jwt.sign(
            { id: user.id },
            process.env.JWT_SECRET,
            { expiresIn: '10m' }
        );

        // Lưu token vào database
        await pool.query(
            `UPDATE users 
             SET reset_token = $1, reset_token_expires = CURRENT_TIMESTAMP + INTERVAL '10 minutes'
             WHERE id = $2`,
            [resetToken, user.id]
        );

        // Gửi email
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
        await sendEmail({
            to: email,
            subject: 'Đặt lại mật khẩu',
            text: `Click vào link sau để đặt lại mật khẩu: ${resetUrl}`
        });

        res.status(200).json({
            success: true,
            message: 'Password reset email sent'
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findByPk(decoded.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Mã hóa mật khẩu mới
        const hashedPassword = await bcrypt.hash(password, 10);

        // Cập nhật mật khẩu
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password reset successful'
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
    // Create token
    const token = user.getSignedJwtToken();

    res.status(statusCode).json({
        success: true,
        token,
        user: {
            id: user.id,
            username: user.username,
            email: user.email,
            full_name: user.full_name,
            role: user.role
        }
    });
};

module.exports = {
    register,
    login,
    getMe,
    logout,
    forgotPassword,
    resetPassword
}; 