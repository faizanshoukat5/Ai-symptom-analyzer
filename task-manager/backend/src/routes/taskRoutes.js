const express = require('express');
const router = express.Router();

const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  toggleArchiveTask,
  getTaskStats,
  bulkUpdateTasks
} = require('../controllers/taskController');

const { authenticateUser } = require('../middleware/auth');

const {
  validateTaskCreation,
  validateTaskUpdate,
  validateBulkTaskUpdate,
  validateArchiveTask,
  validateObjectId,
  validateTaskQuery
} = require('../middleware/validation');

// Apply authentication to all routes
router.use(authenticateUser);

// @route   GET /api/tasks/stats
// @desc    Get task statistics for user
// @access  Private
// Note: This route must come before /:id route to avoid conflicts
router.get('/stats', getTaskStats);

// @route   GET /api/tasks
// @desc    Get all tasks for authenticated user
// @access  Private
router.get('/', validateTaskQuery, getTasks);

// @route   GET /api/tasks/:id
// @desc    Get single task by ID
// @access  Private
router.get('/:id', validateObjectId, getTask);

// @route   POST /api/tasks
// @desc    Create new task
// @access  Private
router.post('/', validateTaskCreation, createTask);

// @route   PUT /api/tasks/:id
// @desc    Update task
// @access  Private
router.put('/:id', validateObjectId, validateTaskUpdate, updateTask);

// @route   DELETE /api/tasks/:id
// @desc    Delete task
// @access  Private
router.delete('/:id', validateObjectId, deleteTask);

// @route   PATCH /api/tasks/:id/archive
// @desc    Archive/Unarchive task
// @access  Private
router.patch('/:id/archive', validateObjectId, validateArchiveTask, toggleArchiveTask);

// @route   PATCH /api/tasks/bulk
// @desc    Bulk update tasks
// @access  Private
router.patch('/bulk', validateBulkTaskUpdate, bulkUpdateTasks);

module.exports = router;