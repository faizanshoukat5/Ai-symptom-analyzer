const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a task title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  status: {
    type: String,
    enum: ['todo', 'in-progress', 'completed'],
    default: 'todo'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  category: {
    type: String,
    enum: ['work', 'personal', 'health', 'education', 'shopping', 'other'],
    default: 'other'
  },
  dueDate: {
    type: Date,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [20, 'Tag cannot be more than 20 characters']
  }],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  estimatedTime: {
    type: Number, // in minutes
    min: [1, 'Estimated time must be at least 1 minute'],
    max: [10080, 'Estimated time cannot exceed 7 days (10080 minutes)']
  },
  actualTime: {
    type: Number, // in minutes
    default: null
  }
}, {
  timestamps: true
});

// Indexes for better query performance
taskSchema.index({ user: 1, status: 1 });
taskSchema.index({ user: 1, priority: 1 });
taskSchema.index({ user: 1, category: 1 });
taskSchema.index({ user: 1, dueDate: 1 });
taskSchema.index({ user: 1, createdAt: -1 });

// Virtual for checking if task is overdue
taskSchema.virtual('isOverdue').get(function() {
  if (!this.dueDate || this.status === 'completed') {
    return false;
  }
  return new Date() > this.dueDate;
});

// Virtual for days until due
taskSchema.virtual('daysUntilDue').get(function() {
  if (!this.dueDate || this.status === 'completed') {
    return null;
  }
  const now = new Date();
  const due = new Date(this.dueDate);
  const diffTime = due - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Pre-save middleware to set completedAt when status changes to completed
taskSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    if (this.status === 'completed' && !this.completedAt) {
      this.completedAt = new Date();
    } else if (this.status !== 'completed') {
      this.completedAt = null;
    }
  }
  next();
});

// Static method to get task statistics for a user
taskSchema.statics.getTaskStats = async function(userId) {
  const stats = await this.aggregate([
    { $match: { user: mongoose.Types.ObjectId(userId), isArchived: false } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        completed: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        inProgress: {
          $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] }
        },
        todo: {
          $sum: { $cond: [{ $eq: ['$status', 'todo'] }, 1, 0] }
        },
        overdue: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $ne: ['$status', 'completed'] },
                  { $ne: ['$dueDate', null] },
                  { $lt: ['$dueDate', new Date()] }
                ]
              },
              1,
              0
            ]
          }
        }
      }
    }
  ]);

  return stats[0] || {
    total: 0,
    completed: 0,
    inProgress: 0,
    todo: 0,
    overdue: 0
  };
};

// Static method to get tasks by category for a user
taskSchema.statics.getTasksByCategory = async function(userId) {
  return await this.aggregate([
    { $match: { user: mongoose.Types.ObjectId(userId), isArchived: false } },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        completed: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        }
      }
    },
    { $sort: { count: -1 } }
  ]);
};

// Include virtual fields when converting to JSON
taskSchema.set('toJSON', { virtuals: true });
taskSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Task', taskSchema);