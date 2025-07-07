import { Task } from '../types';
import { 
  PRIORITY_COLORS, 
  STATUS_COLORS, 
  CATEGORY_ICONS,
  PRIORITY_LABELS,
  STATUS_LABELS,
  CATEGORY_LABELS 
} from './constants';

/**
 * Format a date string for display
 */
export const formatDate = (dateString: string, format: 'short' | 'long' | 'relative' = 'short'): string => {
  const date = new Date(dateString);
  
  if (format === 'relative') {
    return formatRelativeTime(date);
  }
  
  const options: Intl.DateTimeFormatOptions = format === 'long' 
    ? { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }
    : { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      };
  
  return date.toLocaleDateString('en-US', options);
};

/**
 * Format relative time (e.g., "2 hours ago", "in 3 days")
 */
export const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffInMs = date.getTime() - now.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (Math.abs(diffInMinutes) < 1) {
    return 'Just now';
  }
  
  if (Math.abs(diffInMinutes) < 60) {
    return diffInMinutes > 0 
      ? `in ${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''}`
      : `${Math.abs(diffInMinutes)} minute${Math.abs(diffInMinutes) !== 1 ? 's' : ''} ago`;
  }
  
  if (Math.abs(diffInHours) < 24) {
    return diffInHours > 0 
      ? `in ${diffInHours} hour${diffInHours !== 1 ? 's' : ''}`
      : `${Math.abs(diffInHours)} hour${Math.abs(diffInHours) !== 1 ? 's' : ''} ago`;
  }
  
  return diffInDays > 0 
    ? `in ${diffInDays} day${diffInDays !== 1 ? 's' : ''}`
    : `${Math.abs(diffInDays)} day${Math.abs(diffInDays) !== 1 ? 's' : ''} ago`;
};

/**
 * Get priority styling classes
 */
export const getPriorityStyle = (priority: Task['priority']) => {
  return PRIORITY_COLORS[priority];
};

/**
 * Get status styling classes
 */
export const getStatusStyle = (status: Task['status']) => {
  return STATUS_COLORS[status];
};

/**
 * Get category icon
 */
export const getCategoryIcon = (category: Task['category']) => {
  return CATEGORY_ICONS[category];
};

/**
 * Get human-readable labels
 */
export const getPriorityLabel = (priority: Task['priority']) => {
  return PRIORITY_LABELS[priority];
};

export const getStatusLabel = (status: Task['status']) => {
  return STATUS_LABELS[status];
};

export const getCategoryLabel = (category: Task['category']) => {
  return CATEGORY_LABELS[category];
};

/**
 * Check if a task is overdue
 */
export const isTaskOverdue = (task: Task): boolean => {
  if (!task.dueDate || task.status === 'completed') {
    return false;
  }
  return new Date(task.dueDate) < new Date();
};

/**
 * Get days until due date
 */
export const getDaysUntilDue = (dueDate: string): number => {
  const due = new Date(dueDate);
  const now = new Date();
  const diffTime = due.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Format time duration in minutes to human readable format
 */
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours < 24) {
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  }
  
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  
  return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
};

/**
 * Truncate text to specified length
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

/**
 * Capitalize first letter of a string
 */
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Generate initials from a name
 */
export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 */
export const validatePassword = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  if (password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Deep clone an object
 */
export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Debounce function
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: any;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Generate a random ID
 */
export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

/**
 * Format file size in bytes to human readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Check if user is admin
 */
export const isAdmin = (userRole: string): boolean => {
  return userRole === 'admin';
};

/**
 * Handle API errors and return user-friendly messages
 */
export const handleApiError = (error: any): string => {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    
    if (data?.message) {
      return data.message;
    }
    
    switch (status) {
      case 400:
        return 'Bad request. Please check your input.';
      case 401:
        return 'You are not authorized. Please log in again.';
      case 403:
        return 'Access denied.';
      case 404:
        return 'Resource not found.';
      case 422:
        return 'Validation error. Please check your input.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return 'An unexpected error occurred.';
    }
  } else if (error.request) {
    // Request made but no response received
    return 'Network error. Please check your connection.';
  } else {
    // Something else happened
    return error.message || 'An unexpected error occurred.';
  }
};

/**
 * Local storage helpers with error handling
 */
export const storage = {
  get: (key: string, defaultValue: any = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading from localStorage:`, error);
      return defaultValue;
    }
  },
  
  set: (key: string, value: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing to localStorage:`, error);
    }
  },
  
  remove: (key: string) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing from localStorage:`, error);
    }
  },
  
  clear: () => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error(`Error clearing localStorage:`, error);
    }
  }
};

/**
 * Sort tasks by different criteria
 */
export const sortTasks = (tasks: Task[], sortBy: string, sortOrder: 'asc' | 'desc'): Task[] => {
  return [...tasks].sort((a, b) => {
    let aValue: any;
    let bValue: any;
    
    switch (sortBy) {
      case 'title':
        aValue = a.title.toLowerCase();
        bValue = b.title.toLowerCase();
        break;
      case 'priority':
        const priorityOrder = { low: 1, medium: 2, high: 3, urgent: 4 };
        aValue = priorityOrder[a.priority];
        bValue = priorityOrder[b.priority];
        break;
      case 'status':
        const statusOrder = { todo: 1, 'in-progress': 2, completed: 3 };
        aValue = statusOrder[a.status];
        bValue = statusOrder[b.status];
        break;
      case 'dueDate':
        aValue = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
        bValue = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
        break;
      case 'createdAt':
      case 'updatedAt':
      default:
        aValue = new Date(a[sortBy as keyof Task] as string).getTime();
        bValue = new Date(b[sortBy as keyof Task] as string).getTime();
        break;
    }
    
    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });
};