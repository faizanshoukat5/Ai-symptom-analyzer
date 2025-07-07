const express = require('express');
const router = express.Router();

const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getAllTasks,
  getSystemStats
} = require('../controllers/adminController');

const { authenticateUser, requireAdmin } = require('../middleware/auth');

const {
  validateObjectId,
  validateAdminUserUpdate,
  validateTaskQuery
} = require('../middleware/validation');

// Apply authentication and admin authorization to all routes
router.use(authenticateUser);
router.use(requireAdmin);

// @route   GET /api/admin/stats
// @desc    Get system statistics
// @access  Private/Admin
router.get('/stats', getSystemStats);

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private/Admin
router.get('/users', getAllUsers);

// @route   GET /api/admin/users/:id
// @desc    Get single user by ID
// @access  Private/Admin
router.get('/users/:id', validateObjectId, getUserById);

// @route   PUT /api/admin/users/:id
// @desc    Update user
// @access  Private/Admin
router.put('/users/:id', validateObjectId, validateAdminUserUpdate, updateUser);

// @route   DELETE /api/admin/users/:id
// @desc    Delete user
// @access  Private/Admin
router.delete('/users/:id', validateObjectId, deleteUser);

// @route   GET /api/admin/tasks
// @desc    Get all tasks from all users
// @access  Private/Admin
router.get('/tasks', validateTaskQuery, getAllTasks);

module.exports = router;