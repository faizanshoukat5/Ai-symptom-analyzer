const { body, param, query } = require('express-validator');

// User registration validation
const validateUserRegistration = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  
  body('role')
    .optional()
    .isIn(['user', 'admin'])
    .withMessage('Role must be either user or admin')
];

// User login validation
const validateUserLogin = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Profile update validation
const validateProfileUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('avatar')
    .optional()
    .isURL()
    .withMessage('Avatar must be a valid URL')
];

// Password change validation
const validatePasswordChange = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number'),
  
  body('newPassword')
    .custom((value, { req }) => {
      if (value === req.body.currentPassword) {
        throw new Error('New password must be different from current password');
      }
      return true;
    })
];

// Task creation validation
const validateTaskCreation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Task title is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Task title must be between 1 and 100 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  
  body('status')
    .optional()
    .isIn(['todo', 'in-progress', 'completed'])
    .withMessage('Status must be one of: todo, in-progress, completed'),
  
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Priority must be one of: low, medium, high, urgent'),
  
  body('category')
    .optional()
    .isIn(['work', 'personal', 'health', 'education', 'shopping', 'other'])
    .withMessage('Category must be one of: work, personal, health, education, shopping, other'),
  
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid date')
    .custom((value) => {
      if (new Date(value) < new Date()) {
        throw new Error('Due date cannot be in the past');
      }
      return true;
    }),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  
  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Each tag must be between 1 and 20 characters'),
  
  body('estimatedTime')
    .optional()
    .isInt({ min: 1, max: 10080 })
    .withMessage('Estimated time must be between 1 and 10080 minutes (7 days)')
];

// Task update validation
const validateTaskUpdate = [
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Task title cannot be empty')
    .isLength({ min: 1, max: 100 })
    .withMessage('Task title must be between 1 and 100 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  
  body('status')
    .optional()
    .isIn(['todo', 'in-progress', 'completed'])
    .withMessage('Status must be one of: todo, in-progress, completed'),
  
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Priority must be one of: low, medium, high, urgent'),
  
  body('category')
    .optional()
    .isIn(['work', 'personal', 'health', 'education', 'shopping', 'other'])
    .withMessage('Category must be one of: work, personal, health, education, shopping, other'),
  
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid date'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  
  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Each tag must be between 1 and 20 characters'),
  
  body('estimatedTime')
    .optional()
    .isInt({ min: 1, max: 10080 })
    .withMessage('Estimated time must be between 1 and 10080 minutes (7 days)'),
  
  body('actualTime')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Actual time must be a positive integer')
];

// Bulk task update validation
const validateBulkTaskUpdate = [
  body('taskIds')
    .isArray({ min: 1 })
    .withMessage('taskIds must be a non-empty array'),
  
  body('taskIds.*')
    .isMongoId()
    .withMessage('Each task ID must be a valid MongoDB ObjectId'),
  
  body('updates')
    .isObject()
    .withMessage('updates must be an object'),
  
  body('updates.status')
    .optional()
    .isIn(['todo', 'in-progress', 'completed'])
    .withMessage('Status must be one of: todo, in-progress, completed'),
  
  body('updates.priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Priority must be one of: low, medium, high, urgent'),
  
  body('updates.category')
    .optional()
    .isIn(['work', 'personal', 'health', 'education', 'shopping', 'other'])
    .withMessage('Category must be one of: work, personal, health, education, shopping, other'),
  
  body('updates.isArchived')
    .optional()
    .isBoolean()
    .withMessage('isArchived must be a boolean')
];

// Archive task validation
const validateArchiveTask = [
  body('archive')
    .isBoolean()
    .withMessage('archive field must be a boolean')
];

// MongoDB ObjectId validation
const validateObjectId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format')
];

// Query parameter validation for pagination and filtering
const validateTaskQuery = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('status')
    .optional()
    .isIn(['todo', 'in-progress', 'completed'])
    .withMessage('Status must be one of: todo, in-progress, completed'),
  
  query('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Priority must be one of: low, medium, high, urgent'),
  
  query('category')
    .optional()
    .isIn(['work', 'personal', 'health', 'education', 'shopping', 'other'])
    .withMessage('Category must be one of: work, personal, health, education, shopping, other'),
  
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'updatedAt', 'title', 'dueDate', 'priority', 'status'])
    .withMessage('sortBy must be one of: createdAt, updatedAt, title, dueDate, priority, status'),
  
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('sortOrder must be either asc or desc'),
  
  query('archived')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('archived must be either true or false')
];

// Admin user update validation
const validateAdminUserUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('role')
    .optional()
    .isIn(['user', 'admin'])
    .withMessage('Role must be either user or admin'),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
];

module.exports = {
  validateUserRegistration,
  validateUserLogin,
  validateProfileUpdate,
  validatePasswordChange,
  validateTaskCreation,
  validateTaskUpdate,
  validateBulkTaskUpdate,
  validateArchiveTask,
  validateObjectId,
  validateTaskQuery,
  validateAdminUserUpdate
};