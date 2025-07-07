export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  avatar?: string;
  isEmailVerified: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'work' | 'personal' | 'health' | 'education' | 'shopping' | 'other';
  dueDate?: string;
  completedAt?: string;
  tags: string[];
  user: string | User;
  isArchived: boolean;
  estimatedTime?: number; // in minutes
  actualTime?: number; // in minutes
  createdAt: string;
  updatedAt: string;
  // Virtual fields
  isOverdue?: boolean;
  daysUntilDue?: number;
}

export interface TaskStats {
  total: number;
  completed: number;
  inProgress: number;
  todo: number;
  overdue: number;
}

export interface TasksByCategory {
  _id: string;
  count: number;
  completed: number;
}

export interface TaskFilters {
  status?: Task['status'];
  priority?: Task['priority'];
  category?: Task['category'];
  search?: string;
  archived?: boolean;
}

export interface TaskSort {
  sortBy: 'createdAt' | 'updatedAt' | 'title' | 'dueDate' | 'priority' | 'status';
  sortOrder: 'asc' | 'desc';
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalTasks: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface TasksResponse {
  tasks: Task[];
  pagination: PaginationInfo;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: 'user' | 'admin';
}

export interface ProfileUpdateData {
  name?: string;
  email?: string;
  avatar?: string;
}

export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  status?: Task['status'];
  priority?: Task['priority'];
  category?: Task['category'];
  dueDate?: string;
  tags?: string[];
  estimatedTime?: number;
}

export interface UpdateTaskData extends Partial<CreateTaskData> {
  actualTime?: number;
}

export interface BulkUpdateData {
  taskIds: string[];
  updates: {
    status?: Task['status'];
    priority?: Task['priority'];
    category?: Task['category'];
    isArchived?: boolean;
  };
}

export interface SystemStats {
  users: {
    total: number;
    active: number;
    admins: number;
    recentRegistrations: number;
  };
  tasks: {
    total: number;
    completed: number;
    pending: number;
    overdue: number;
    byStatus: Array<{ _id: string; count: number }>;
    byPriority: Array<{ _id: string; count: number }>;
  };
  mostActiveUsers: Array<{
    name: string;
    email: string;
    taskCount: number;
  }>;
}

export interface NotificationOptions {
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateProfile: (data: ProfileUpdateData) => Promise<void>;
  changePassword: (data: PasswordChangeData) => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface TaskContextType {
  tasks: Task[];
  taskStats: TaskStats | null;
  tasksByCategory: TasksByCategory[];
  pagination: PaginationInfo | null;
  filters: TaskFilters;
  sort: TaskSort;
  isLoading: boolean;
  error: string | null;
  fetchTasks: () => Promise<void>;
  createTask: (data: CreateTaskData) => Promise<void>;
  updateTask: (id: string, data: UpdateTaskData) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleArchiveTask: (id: string, archive: boolean) => Promise<void>;
  bulkUpdateTasks: (data: BulkUpdateData) => Promise<void>;
  setFilters: (filters: Partial<TaskFilters>) => void;
  setSort: (sort: Partial<TaskSort>) => void;
  setPage: (page: number) => void;
  clearFilters: () => void;
  refreshStats: () => Promise<void>;
}

export type PriorityColor = {
  [K in Task['priority']]: {
    bg: string;
    text: string;
    border: string;
  };
};

export type StatusColor = {
  [K in Task['status']]: {
    bg: string;
    text: string;
    border: string;
  };
};

export type CategoryIcon = {
  [K in Task['category']]: string;
};

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: any;
}

export interface FormFieldProps {
  label?: string;
  error?: string;
  required?: boolean;
  className?: string;
}

export interface LoadingState {
  isLoading: boolean;
  error?: string | null;
}

export interface TableColumn<T = any> {
  key: string;
  label: string;
  render?: (item: T) => any;
  sortable?: boolean;
  className?: string;
}