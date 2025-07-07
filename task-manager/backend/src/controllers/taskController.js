const { validationResult } = require('express-validator');
const Task = require('../models/Task');
const mongoose = require('mongoose');

// @desc    Get all tasks for authenticated user
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
  try {
    const {
      status,
      priority,
      category,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
      archived = false
    } = req.query;

    // Build filter object
    const filter = { 
      user: req.user.id,
      isArchived: archived === 'true'
    };

    // Add filters if provided
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;

    // Add search functionality
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Pagination
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query
    const tasks = await Task.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNumber)
      .populate('user', 'name email');

    // Get total count for pagination
    const totalTasks = await Task.countDocuments(filter);
    const totalPages = Math.ceil(totalTasks / limitNumber);

    res.json({
      success: true,
      data: {
        tasks,
        pagination: {
          currentPage: pageNumber,
          totalPages,
          totalTasks,
          hasNextPage: pageNumber < totalPages,
          hasPrevPage: pageNumber > 1
        }
      }
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching tasks'
    });
  }
};

// @desc    Get single task by ID
// @route   GET /api/tasks/:id
// @access  Private
const getTask = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user.id
    }).populate('user', 'name email');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.json({
      success: true,
      data: { task }
    });
  } catch (error) {
    console.error('Get task error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid task ID'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error fetching task'
    });
  }
};

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const taskData = {
      ...req.body,
      user: req.user.id
    };

    const task = await Task.create(taskData);
    
    // Populate user data
    await task.populate('user', 'name email');

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: { task }
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating task'
    });
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true, runValidators: true }
    ).populate('user', 'name email');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.json({
      success: true,
      message: 'Task updated successfully',
      data: { task }
    });
  } catch (error) {
    console.error('Update task error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid task ID'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error updating task'
    });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Delete task error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid task ID'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error deleting task'
    });
  }
};

// @desc    Archive/Unarchive task
// @route   PATCH /api/tasks/:id/archive
// @access  Private
const toggleArchiveTask = async (req, res) => {
  try {
    const { archive } = req.body;

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { isArchived: archive },
      { new: true }
    ).populate('user', 'name email');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.json({
      success: true,
      message: `Task ${archive ? 'archived' : 'unarchived'} successfully`,
      data: { task }
    });
  } catch (error) {
    console.error('Toggle archive task error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid task ID'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error archiving task'
    });
  }
};

// @desc    Get task statistics for user
// @route   GET /api/tasks/stats
// @access  Private
const getTaskStats = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get basic stats
    const stats = await Task.getTaskStats(userId);
    
    // Get tasks by category
    const tasksByCategory = await Task.getTasksByCategory(userId);
    
    // Get recent completed tasks
    const recentCompleted = await Task.find({
      user: userId,
      status: 'completed',
      isArchived: false
    })
    .sort({ completedAt: -1 })
    .limit(5)
    .select('title completedAt');

    // Get upcoming due tasks
    const upcomingDue = await Task.find({
      user: userId,
      status: { $ne: 'completed' },
      dueDate: { $gte: new Date() },
      isArchived: false
    })
    .sort({ dueDate: 1 })
    .limit(5)
    .select('title dueDate priority');

    res.json({
      success: true,
      data: {
        stats,
        tasksByCategory,
        recentCompleted,
        upcomingDue
      }
    });
  } catch (error) {
    console.error('Get task stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching task statistics'
    });
  }
};

// @desc    Bulk update tasks
// @route   PATCH /api/tasks/bulk
// @access  Private
const bulkUpdateTasks = async (req, res) => {
  try {
    const { taskIds, updates } = req.body;

    if (!taskIds || !Array.isArray(taskIds) || taskIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Task IDs array is required'
      });
    }

    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Updates object is required'
      });
    }

    // Convert string IDs to ObjectIds
    const objectIds = taskIds.map(id => mongoose.Types.ObjectId(id));

    const result = await Task.updateMany(
      { 
        _id: { $in: objectIds },
        user: req.user.id 
      },
      updates,
      { runValidators: true }
    );

    res.json({
      success: true,
      message: `${result.modifiedCount} tasks updated successfully`,
      data: {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount
      }
    });
  } catch (error) {
    console.error('Bulk update tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating tasks'
    });
  }
};

module.exports = {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  toggleArchiveTask,
  getTaskStats,
  bulkUpdateTasks
};