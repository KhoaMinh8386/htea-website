const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { auth } = require('../middleware/auth');

// Lấy thông tin profile
router.get('/', auth, profileController.getProfile);

// Cập nhật thông tin profile
router.put('/', auth, profileController.updateProfile);

// Đổi mật khẩu
router.post('/change-password', auth, profileController.changePassword);

module.exports = router; 