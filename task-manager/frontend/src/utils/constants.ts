import { PriorityColor, StatusColor, CategoryIcon } from '../types';

export const TASK_PRIORITIES = ['low', 'medium', 'high', 'urgent'] as const;
export const TASK_STATUSES = ['todo', 'in-progress', 'completed'] as const;
export const TASK_CATEGORIES = ['work', 'personal', 'health', 'education', 'shopping', 'other'] as const;
export const USER_ROLES = ['user', 'admin'] as const;

export const PRIORITY_COLORS: PriorityColor = {
  low: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-200'
  },
  medium: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-yellow-200'
  },
  high: {
    bg: 'bg-orange-100',
    text: 'text-orange-800',
    border: 'border-orange-200'
  },
  urgent: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-200'
  }
};

export const STATUS_COLORS: StatusColor = {
  todo: {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    border: 'border-gray-200'
  },
  'in-progress': {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-200'
  },
  completed: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-200'
  }
};

export const CATEGORY_ICONS: CategoryIcon = {
  work: '💼',
  personal: '👤',
  health: '🏥',
  education: '📚',
  shopping: '🛒',
  other: '📝'
};

export const PRIORITY_LABELS = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent'
};

export const STATUS_LABELS = {
  todo: 'To Do',
  'in-progress': 'In Progress',
  completed: 'Completed'
};

export const CATEGORY_LABELS = {
  work: 'Work',
  personal: 'Personal',
  health: 'Health',
  education: 'Education',
  shopping: 'Shopping',
  other: 'Other'
};

export const DATE_FORMATS = {
  display: 'MMM dd, yyyy',
  displayWithTime: 'MMM dd, yyyy HH:mm',
  input: 'yyyy-MM-dd',
  inputWithTime: "yyyy-MM-dd'T'HH:mm"
};

export const PAGINATION_LIMITS = [5, 10, 20, 50] as const;

export const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Created Date' },
  { value: 'updatedAt', label: 'Updated Date' },
  { value: 'title', label: 'Title' },
  { value: 'dueDate', label: 'Due Date' },
  { value: 'priority', label: 'Priority' },
  { value: 'status', label: 'Status' }
] as const;

export const SORT_ORDERS = [
  { value: 'desc', label: 'Descending' },
  { value: 'asc', label: 'Ascending' }
] as const;

export const DEFAULT_TASK_FILTERS = {
  status: undefined,
  priority: undefined,
  category: undefined,
  search: undefined,
  archived: false
};

export const DEFAULT_TASK_SORT = {
  sortBy: 'createdAt' as const,
  sortOrder: 'desc' as const
};

export const LOCAL_STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  THEME: 'theme',
  TASK_FILTERS: 'taskFilters',
  TASK_SORT: 'taskSort'
} as const;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    ME: '/api/auth/me',
    PROFILE: '/api/auth/profile',
    CHANGE_PASSWORD: '/api/auth/change-password'
  },
  TASKS: {
    BASE: '/api/tasks',
    STATS: '/api/tasks/stats',
    BULK: '/api/tasks/bulk',
    ARCHIVE: (id: string) => `/api/tasks/${id}/archive`
  },
  ADMIN: {
    USERS: '/api/admin/users',
    TASKS: '/api/admin/tasks',
    STATS: '/api/admin/stats'
  },
  HEALTH: '/health'
} as const;

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied.',
  NOT_FOUND: 'Resource not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNKNOWN_ERROR: 'An unexpected error occurred.'
} as const;

export const SUCCESS_MESSAGES = {
  LOGIN: 'Successfully logged in!',
  REGISTER: 'Account created successfully!',
  LOGOUT: 'Successfully logged out!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  PASSWORD_CHANGED: 'Password changed successfully!',
  TASK_CREATED: 'Task created successfully!',
  TASK_UPDATED: 'Task updated successfully!',
  TASK_DELETED: 'Task deleted successfully!',
  TASK_ARCHIVED: 'Task archived successfully!',
  TASK_UNARCHIVED: 'Task unarchived successfully!',
  BULK_UPDATE: 'Tasks updated successfully!'
} as const;