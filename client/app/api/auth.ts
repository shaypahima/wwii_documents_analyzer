import { api } from '../lib/api';
import type { ApiResponse } from '../lib/types';

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name?: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  role: 'ADMIN' | 'USER';
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface UserProfile extends User {
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateProfileData {
  name?: string;
  email?: string;
}

export const authApi = {
  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    console.log('login', credentials.email);
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
    console.log('login response', response.data);
    
    if (response.data.success && response.data.data) {
      // Store token in localStorage
      localStorage.setItem('auth_token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
      
      // Set default auth header for future requests
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.data.token}`;
    }
    
    return response.data.data;
  },

  /**
   * Register new user
   */
  async register(userData: RegisterData): Promise<AuthResponse> {
    console.log('register', userData.email);
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', userData);
    console.log('register response', response.data);
    
    if (response.data.success && response.data.data) {
      // Store token in localStorage
      localStorage.setItem('auth_token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
      
      // Set default auth header for future requests
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.data.token}`;
    }
    
    return response.data.data;
  },

  /**
   * Get current user profile
   */
  async getProfile(): Promise<UserProfile> {
    console.log('getProfile');
    const response = await api.get<ApiResponse<UserProfile>>('/auth/profile');
    console.log('getProfile response', response.data);
    return response.data.data;
  },

  /**
   * Update user profile
   */
  async updateProfile(data: UpdateProfileData): Promise<UserProfile> {
    console.log('updateProfile', data);
    const response = await api.put<ApiResponse<UserProfile>>('/auth/profile', data);
    console.log('updateProfile response', response.data);
    
    // Update stored user data
    if (response.data.success && response.data.data) {
      const updatedUser = {
        id: response.data.data.id,
        email: response.data.data.email,
        name: response.data.data.name,
        role: response.data.data.role,
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
    
    return response.data.data;
  },

  /**
   * Change password
   */
  async changePassword(data: ChangePasswordData): Promise<void> {
    console.log('changePassword');
    await api.put('/auth/change-password', data);
  },

  /**
   * Verify token
   */
  async verifyToken(): Promise<{ user: User }> {
    console.log('verifyToken');
    const response = await api.get<ApiResponse<{ user: User }>>('/auth/verify');
    console.log('verifyToken response', response.data);
    return response.data.data;
  },

  /**
   * Logout user
   */
  logout(): void {
    console.log('logout');
    // Remove token and user data from localStorage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    
    // Remove auth header
    delete api.defaults.headers.common['Authorization'];
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem('auth_token');
    return !!token;
  },

  /**
   * Get stored user data
   */
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  /**
   * Get stored token
   */
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  },

  /**
   * Initialize auth state (call on app start)
   */
  initializeAuth(): void {
    const token = this.getToken();
    if (token) {
      // Set auth header for API requests
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  },

  /**
   * Check if user has admin role
   */
  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'ADMIN';
  },

  /**
   * Admin: Get all users
   */
  async getUsers(params: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Promise<{
    users: UserProfile[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    console.log('getUsers', params);
    const response = await api.get<ApiResponse<UserProfile[]>>('/auth/users', { params });
    console.log('getUsers response', response.data);
    
    // Handle both direct data and paginated response
    if (Array.isArray(response.data.data)) {
      return {
        users: response.data.data,
        total: response.data.data.length,
        page: params.page || 1,
        limit: params.limit || 10,
        totalPages: 1
      };
    } else {
      return response.data.data as any;
    }
  },

  /**
   * Admin: Update user status
   */
  async updateUserStatus(userId: string, isActive: boolean): Promise<UserProfile> {
    console.log('updateUserStatus', userId, isActive);
    const response = await api.put<ApiResponse<UserProfile>>(`/auth/users/${userId}/status`, { isActive });
    console.log('updateUserStatus response', response.data);
    return response.data.data;
  },

  /**
   * Admin: Update user role
   */
  async updateUserRole(userId: string, role: 'ADMIN' | 'USER'): Promise<UserProfile> {
    console.log('updateUserRole', userId, role);
    const response = await api.put<ApiResponse<UserProfile>>(`/auth/users/${userId}/role`, { role });
    console.log('updateUserRole response', response.data);
    return response.data.data;
  },
};