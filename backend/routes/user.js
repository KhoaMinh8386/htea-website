const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middleware/auth');
const {
    getUsers,
    getUserById,
    updateUser,
    changePassword,
    toggleUserStatus
} = require('../controllers/userController');

// Routes yêu cầu quyền admin
router.get('/', auth, adminAuth('admin'), getUsers);
router.get('/:id', auth, adminAuth('admin'), getUserById);
router.put('/:id', auth, adminAuth('admin'), updateUser);
router.put('/:id/status', auth, adminAuth('admin'), toggleUserStatus);

// Routes cho người dùng thông thường
router.put('/:id/password', auth, changePassword);

module.exports = router; 