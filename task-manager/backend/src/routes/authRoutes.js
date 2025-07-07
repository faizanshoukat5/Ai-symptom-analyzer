const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');

const {
  registerUser,
  loginUser,
  getCurrentUser,
  updateProfile,
  changePassword
} = require('../controllers/authController');

const { authenticateUser } = require('../middleware/auth');

const {
  validateUserRegistration,
  validateUserLogin,
  validateProfileUpdate,
  validatePasswordChange
} = require('../middleware/validation');

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per windowMs
  message: {
    success: false,
    message: 'Too many login attempts, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true // Don't count successful requests
});

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', authLimiter, validateUserRegistration, registerUser);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', loginLimiter, validateUserLogin, loginUser);

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', authenticateUser, getCurrentUser);

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', authenticateUser, validateProfileUpdate, updateProfile);

// @route   PUT /api/auth/change-password
// @desc    Change user password
// @access  Private
router.put('/change-password', authenticateUser, validatePasswordChange, changePassword);

module.exports = router;