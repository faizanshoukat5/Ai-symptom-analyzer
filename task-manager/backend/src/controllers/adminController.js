const User = require('../models/User');
const Task = require('../models/Task');

// @desc    Get all users (Admin only)
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      role,
      isActive,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
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
    const users = await User.find(filter)
      .select('-password')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNumber);

    // Get total count for pagination
    const totalUsers = await User.countDocuments(filter);
    const totalPages = Math.ceil(totalUsers / limitNumber);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: pageNumber,
          totalPages,
          totalUsers,
          hasNextPage: pageNumber < totalPages,
          hasPrevPage: pageNumber > 1
        }
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching users'
    });
  }
};

// @desc    Get single user by ID (Admin only)
// @route   GET /api/admin/users/:id
// @access  Private/Admin
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user's task statistics
    const taskStats = await Task.getTaskStats(user._id);
    
    // Get user's recent tasks
    const recentTasks = await Task.find({ user: user._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title status priority dueDate createdAt');

    res.json({
      success: true,
      data: {
        user,
        taskStats,
        recentTasks
      }
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error fetching user'
    });
  }
};

// @desc    Update user (Admin only)
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
  try {
    const { name, email, role, isActive } = req.body;
    
    // Prevent admin from deactivating themselves
    if (req.params.id === req.user.id && isActive === false) {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own account'
      });
    }

    // Check if email already exists (if being changed)
    if (email) {
      const existingUser = await User.findOne({ 
        email, 
        _id: { $ne: req.params.id } 
      });
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User updated successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Update user error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error updating user'
    });
  }
};

// @desc    Delete user (Admin only)
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    // Prevent admin from deleting themselves
    if (req.params.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Delete all tasks associated with this user
    await Task.deleteMany({ user: req.params.id });

    res.json({
      success: true,
      message: 'User and associated tasks deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error deleting user'
    });
  }
};

// @desc    Get all tasks from all users (Admin only)
// @route   GET /api/admin/tasks
// @access  Private/Admin
const getAllTasks = async (req, res) => {
  try {
    const {
      status,
      priority,
      category,
      search,
      userId,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
      archived = false
    } = req.query;

    // Build filter object
    const filter = { isArchived: archived === 'true' };
    
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;
    if (userId) filter.user = userId;

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
      .populate('user', 'name email role');

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
    console.error('Get all tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching tasks'
    });
  }
};

// @desc    Get system statistics (Admin only)
// @route   GET /api/admin/stats
// @access  Private/Admin
const getSystemStats = async (req, res) => {
  try {
    // User statistics
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const adminUsers = await User.countDocuments({ role: 'admin' });
    
    // Task statistics
    const totalTasks = await Task.countDocuments();
    const completedTasks = await Task.countDocuments({ status: 'completed' });
    const pendingTasks = await Task.countDocuments({ status: { $ne: 'completed' } });
    const overdueTasks = await Task.countDocuments({
      status: { $ne: 'completed' },
      dueDate: { $lt: new Date() }
    });

    // Tasks by status
    const tasksByStatus = await Task.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Tasks by priority
    const tasksByPriority = await Task.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    // Recent user registrations (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentRegistrations = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Most active users (by task count)
    const mostActiveUsers = await Task.aggregate([
      {
        $group: {
          _id: '$user',
          taskCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          name: '$user.name',
          email: '$user.email',
          taskCount: 1
        }
      },
      {
        $sort: { taskCount: -1 }
      },
      {
        $limit: 5
      }
    ]);

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          active: activeUsers,
          admins: adminUsers,
          recentRegistrations
        },
        tasks: {
          total: totalTasks,
          completed: completedTasks,
          pending: pendingTasks,
          overdue: overdueTasks,
          byStatus: tasksByStatus,
          byPriority: tasksByPriority
        },
        mostActiveUsers
      }
    });
  } catch (error) {
    console.error('Get system stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching system statistics'
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getAllTasks,
  getSystemStats
};