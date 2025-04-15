const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
    register,
    login,
    forgotPassword,
    resetPassword,
    logout
} = require('../controllers/authController');
const { body, validationResult } = require('express-validator');
const { User } = require('../models/User');
const { sequelize } = require('sequelize');

router.get("/users", async (req, res) => {
    try {
      const result = await db.query("SELECT id, username, created_at FROM users");
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: "Lỗi server" });
    }
});

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
router.post(
  '/register',
  [
    body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),
    body('email').isEmail().withMessage('Please include a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('full_name').optional().trim().notEmpty().withMessage('Full name cannot be empty')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password, full_name } = req.body;

    try {
      // Check if user exists
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

      // Create user
      const user = await User.create({
        username,
        email,
        password,
        full_name
      });

      sendTokenResponse(user, 201, res);
    } catch (err) {
      console.error(err);
      res.status(500).json({
        success: false,
        message: 'Server Error'
      });
    }
  }
);

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please include a valid email'),
    body('password').exists().withMessage('Password is required')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      // Check for user
      const user = await User.findOne({ where: { email } });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Check if password matches
      const isMatch = await user.matchPassword(password);

      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Update last login
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
  }
);

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', auth, async (req, res) => {
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
});

// @desc    Log user out / clear cookie
// @route   GET /api/auth/logout
// @access  Private
router.get('/logout', auth, logout);



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

module.exports = router;
