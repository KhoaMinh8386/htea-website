const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { sendEmail, sendResetPasswordEmail } = require('../utils/email');
const { User } = require('../models/User');
const { sequelize } = require('../config/db');
const { Op } = require('sequelize');
const logger = require('../utils/logger');
const ResetToken = require('../models/ResetToken');
const crypto = require('crypto');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
    try {
        const { username, email, password, full_name, phone, address } = req.body;

        // Check if user exists
        const userExists = await User.findOne({
            where: {
                [Op.or]: [
                    { username },
                    { email }
                ]
            }
        });

        if (userExists) {
            return res.status(400).json({
                success: false,
                message: 'Người dùng đã tồn tại'
            });
        }

        // Create user
        const user = await User.create({
            username,
            email,
            password,
            full_name,
            phone,
            address,
            role: 'user'
        });

        // Create token
        const token = user.getSignedJwtToken();

        res.status(201).json({
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
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
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
        console.log('Forgot password request received for email:', email);

        // Validate email
        if (!email) {
            console.log('Email is missing');
            return res.status(400).json({ 
                success: false,
                message: 'Vui lòng cung cấp email' 
            });
        }

        // Find user by email
        console.log('Searching for user with email:', email);
        const user = await User.findOne({ 
            where: { 
                email,
                is_active: true
            } 
        });

        if (!user) {
            console.log('User not found or account is inactive');
            return res.status(404).json({ 
                success: false,
                message: 'Email không tồn tại trong hệ thống hoặc tài khoản đã bị khóa' 
            });
        }
        console.log('User found:', user.id);

        // Check if user already has an active reset token
        console.log('Checking for existing reset tokens');
        const existingToken = await ResetToken.findOne({
            where: {
                user_id: user.id,
                is_used: false,
                expires_at: {
                    [Op.gt]: new Date()
                }
            }
        });

        if (existingToken) {
            console.log('Active reset token found');
            return res.status(400).json({
                success: false,
                message: 'Bạn đã có một yêu cầu đặt lại mật khẩu đang hoạt động. Vui lòng kiểm tra email của bạn.'
            });
        }

        // Generate reset token
        console.log('Generating new reset token');
        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        // Save reset token to database
        console.log('Saving reset token to database');
        const newResetToken = await ResetToken.create({
            user_id: user.id,
            token: hashedToken,
            expires_at: new Date(Date.now() + 30 * 60 * 1000)
        });

        if (!newResetToken) {
            throw new Error('Failed to create reset token');
        }

        // Create reset URL
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
        console.log('Reset URL created:', resetUrl);

        // Send email
        console.log('Sending reset password email');
        await sendResetPasswordEmail(user.email, resetUrl);
        console.log('Reset password email sent successfully');

        res.status(200).json({ 
            success: true,
            message: 'Email đặt lại mật khẩu đã được gửi' 
        });
    } catch (error) {
        console.error('Forgot password error details:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({ 
            success: false,
            message: 'Có lỗi xảy ra khi xử lý yêu cầu',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;
        console.log('Reset password request received for token:', token);

        // Hash the token to match with stored token
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        // Find the reset token
        const resetToken = await ResetToken.findOne({
            where: {
                token: hashedToken,
                is_used: false,
                expires_at: {
                    [Op.gt]: new Date()
                }
            }
        });

        if (!resetToken) {
            console.log('Invalid or expired reset token');
            return res.status(400).json({
                success: false,
                message: 'Token không hợp lệ hoặc đã hết hạn'
            });
        }

        // Find the user
        const user = await User.findByPk(resetToken.user_id);
        if (!user) {
            console.log('User not found');
            return res.status(404).json({
                success: false,
                message: 'Người dùng không tồn tại'
            });
        }

        // Update user's password
        user.password = password;
        await user.save();

        // Mark token as used
        resetToken.is_used = true;
        await resetToken.save();

        console.log('Password reset successful for user:', user.id);
        res.status(200).json({
            success: true,
            message: 'Đặt lại mật khẩu thành công'
        });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra khi đặt lại mật khẩu'
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