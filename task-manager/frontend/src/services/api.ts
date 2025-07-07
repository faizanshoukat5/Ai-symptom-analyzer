import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  User,
  Task,
  TaskStats,
  TasksByCategory,
  TasksResponse,
  AuthResponse,
  LoginCredentials,
  RegisterData,
  ProfileUpdateData,
  PasswordChangeData,
  CreateTaskData,
  UpdateTaskData,
  BulkUpdateData,
  SystemStats,
  ApiResponse,
  TaskFilters,
  TaskSort,
} from '../types';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Helper method to extract data from response
  private extractData<T>(response: AxiosResponse<ApiResponse<T>>): T {
    return response.data.data as T;
  }

  // Auth Service Methods
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await this.api.post<ApiResponse<AuthResponse>>('/api/auth/login', credentials);
    return this.extractData(response);
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await this.api.post<ApiResponse<AuthResponse>>('/api/auth/register', data);
    return this.extractData(response);
  }

  async getCurrentUser(): Promise<{ user: User }> {
    const response = await this.api.get<ApiResponse<{ user: User }>>('/api/auth/me');
    return this.extractData(response);
  }

  async updateProfile(data: ProfileUpdateData): Promise<{ user: User }> {
    const response = await this.api.put<ApiResponse<{ user: User }>>('/api/auth/profile', data);
    return this.extractData(response);
  }

  async changePassword(data: PasswordChangeData): Promise<void> {
    await this.api.put('/api/auth/change-password', data);
  }

  // Task Service Methods
  async getTasks(
    filters: TaskFilters = {},
    sort: TaskSort = { sortBy: 'createdAt', sortOrder: 'desc' },
    page: number = 1,
    limit: number = 10
  ): Promise<TasksResponse> {
    const params = new URLSearchParams();
    
    // Add filters
    if (filters.status) params.append('status', filters.status);
    if (filters.priority) params.append('priority', filters.priority);
    if (filters.category) params.append('category', filters.category);
    if (filters.search) params.append('search', filters.search);
    if (filters.archived !== undefined) params.append('archived', filters.archived.toString());
    
    // Add sorting
    params.append('sortBy', sort.sortBy);
    params.append('sortOrder', sort.sortOrder);
    
    // Add pagination
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const response = await this.api.get<ApiResponse<TasksResponse>>(`/api/tasks?${params.toString()}`);
    return this.extractData(response);
  }

  async getTask(id: string): Promise<{ task: Task }> {
    const response = await this.api.get<ApiResponse<{ task: Task }>>(`/api/tasks/${id}`);
    return this.extractData(response);
  }

  async createTask(data: CreateTaskData): Promise<{ task: Task }> {
    const response = await this.api.post<ApiResponse<{ task: Task }>>('/api/tasks', data);
    return this.extractData(response);
  }

  async updateTask(id: string, data: UpdateTaskData): Promise<{ task: Task }> {
    const response = await this.api.put<ApiResponse<{ task: Task }>>(`/api/tasks/${id}`, data);
    return this.extractData(response);
  }

  async deleteTask(id: string): Promise<void> {
    await this.api.delete(`/api/tasks/${id}`);
  }

  async toggleArchiveTask(id: string, archive: boolean): Promise<{ task: Task }> {
    const response = await this.api.patch<ApiResponse<{ task: Task }>>(`/api/tasks/${id}/archive`, { archive });
    return this.extractData(response);
  }

  async getTaskStats(): Promise<{
    stats: TaskStats;
    tasksByCategory: TasksByCategory[];
    recentCompleted: Task[];
    upcomingDue: Task[];
  }> {
    const response = await this.api.get<ApiResponse<{
      stats: TaskStats;
      tasksByCategory: TasksByCategory[];
      recentCompleted: Task[];
      upcomingDue: Task[];
    }>>('/api/tasks/stats');
    return this.extractData(response);
  }

  async bulkUpdateTasks(data: BulkUpdateData): Promise<{
    matchedCount: number;
    modifiedCount: number;
  }> {
    const response = await this.api.patch<ApiResponse<{
      matchedCount: number;
      modifiedCount: number;
    }>>('/api/tasks/bulk', data);
    return this.extractData(response);
  }

  // Admin Service Methods
  async getAllUsers(
    page: number = 1,
    limit: number = 10,
    search?: string,
    role?: string,
    isActive?: boolean,
    sortBy: string = 'createdAt',
    sortOrder: 'asc' | 'desc' = 'desc'
  ): Promise<{
    users: User[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalUsers: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  }> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    params.append('sortBy', sortBy);
    params.append('sortOrder', sortOrder);
    
    if (search) params.append('search', search);
    if (role) params.append('role', role);
    if (isActive !== undefined) params.append('isActive', isActive.toString());

    const response = await this.api.get<ApiResponse<{
      users: User[];
      pagination: {
        currentPage: number;
        totalPages: number;
        totalUsers: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
      };
    }>>(`/api/admin/users?${params.toString()}`);
    return this.extractData(response);
  }

  async getUserById(id: string): Promise<{
    user: User;
    taskStats: TaskStats;
    recentTasks: Task[];
  }> {
    const response = await this.api.get<ApiResponse<{
      user: User;
      taskStats: TaskStats;
      recentTasks: Task[];
    }>>(`/api/admin/users/${id}`);
    return this.extractData(response);
  }

  async updateUser(id: string, data: {
    name?: string;
    email?: string;
    role?: 'user' | 'admin';
    isActive?: boolean;
  }): Promise<{ user: User }> {
    const response = await this.api.put<ApiResponse<{ user: User }>>(`/api/admin/users/${id}`, data);
    return this.extractData(response);
  }

  async deleteUser(id: string): Promise<void> {
    await this.api.delete(`/api/admin/users/${id}`);
  }

  async getAllTasks(
    filters: TaskFilters = {},
    sort: TaskSort = { sortBy: 'createdAt', sortOrder: 'desc' },
    page: number = 1,
    limit: number = 10,
    userId?: string
  ): Promise<TasksResponse> {
    const params = new URLSearchParams();
    
    // Add filters
    if (filters.status) params.append('status', filters.status);
    if (filters.priority) params.append('priority', filters.priority);
    if (filters.category) params.append('category', filters.category);
    if (filters.search) params.append('search', filters.search);
    if (filters.archived !== undefined) params.append('archived', filters.archived.toString());
    if (userId) params.append('userId', userId);
    
    // Add sorting
    params.append('sortBy', sort.sortBy);
    params.append('sortOrder', sort.sortOrder);
    
    // Add pagination
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const response = await this.api.get<ApiResponse<TasksResponse>>(`/api/admin/tasks?${params.toString()}`);
    return this.extractData(response);
  }

  async getSystemStats(): Promise<SystemStats> {
    const response = await this.api.get<ApiResponse<SystemStats>>('/api/admin/stats');
    return this.extractData(response);
  }

  // Health check
  async healthCheck(): Promise<{
    success: boolean;
    message: string;
    timestamp: string;
    environment: string;
    version: string;
  }> {
    const response = await this.api.get<{
      success: boolean;
      message: string;
      timestamp: string;
      environment: string;
      version: string;
    }>('/health');
    return response.data;
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;