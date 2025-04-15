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
router.get('/', adminAuth, getUsers);
router.get('/:id', adminAuth, getUserById);
router.put('/:id', adminAuth, updateUser);
router.put('/:id/status', adminAuth, toggleUserStatus);

// Routes cho người dùng thông thường
router.put('/:id/password', auth, changePassword);

module.exports = router; 