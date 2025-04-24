const { User } = require('../models/User');
const bcrypt = require('bcryptjs');

// Cập nhật thông tin cá nhân
exports.updateProfile = async (req, res) => {
    try {
        const { full_name, email, phone, address } = req.body;
        const userId = req.user.id;

        console.log('Updating profile for user:', userId);
        console.log('Update data:', { full_name, email, phone, address });

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Kiểm tra email có trùng với người dùng khác không
        if (email && email !== user.email) {
            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                return res.status(400).json({ message: 'Email đã tồn tại' });
            }
        }

        // Cập nhật thông tin người dùng
        await user.update({
            full_name: full_name || user.full_name,
            email: email || user.email,
            phone: phone || user.phone,
            address: address || user.address
        });

        // Lấy lại thông tin user sau khi cập nhật (không bao gồm password)
        const userData = await User.findByPk(userId, {
            attributes: { exclude: ['password'] }
        });

        res.json({ 
            message: 'Cập nhật thông tin thành công',
            user: userData
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ 
            message: 'Lỗi server',
            error: error.message 
        });
    }
};

// Đổi mật khẩu
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id;

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Kiểm tra mật khẩu hiện tại
        const isMatch = await user.matchPassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ message: 'Mật khẩu hiện tại không đúng' });
        }

        // Mã hóa mật khẩu mới
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await user.update({ password: hashedPassword });

        res.json({ message: 'Đổi mật khẩu thành công' });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ 
            message: 'Lỗi server',
            error: error.message 
        });
    }
};

// Lấy thông tin profile
exports.getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findByPk(userId, {
            attributes: { exclude: ['password'] }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error('Error getting profile:', error);
        res.status(500).json({ 
            message: 'Lỗi server',
            error: error.message 
        });
    }
}; 