/**
 * AUTHENTICATION SERVICE
 *
 * Frontend service for user authentication operations.
 * Handles login, registration, token management, and user session state.
 * Communicates with backend authentication endpoints.
 */

import api from '../lib/api';

// TypeScript interfaces for authentication data
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  role: 'Admin' | 'Developer' | 'Tester';
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: 'Admin' | 'Developer' | 'Tester';
  createdAt: string;
}

/**
 * Authentication service class
 * Provides methods for user authentication and session management
 */
export class AuthService {
  /**
   * User login
   * Authenticates user credentials and stores session data
   */
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/login', credentials);

      // Validate token format before storing
      const { token, user } = response.data;
      if (!token || typeof token !== 'string' || !token.includes('.')) {
        throw new Error('Invalid token format received from server');
      }

      // Store authentication data in localStorage
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify(user));

      return response.data;
    } catch (error) {
      // Re-throw error for component-level handling
      if (error instanceof Error && error.message === 'Invalid token format received from server') {
        throw error;
      }
      const axiosError = error as any;
      throw axiosError.response?.data || axiosError;
    }
  }

  /**
   * User registration
   * Creates new user account and automatically logs them in
   */
  static async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/register', userData);

      // Validate token format before storing
      const { token, user } = response.data;
      if (!token || typeof token !== 'string' || !token.includes('.')) {
        throw new Error('Invalid token format received from server');
      }

      // Store authentication data in localStorage
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify(user));

      return response.data;
    } catch (error) {
      // Re-throw error for component-level handling
      if (error instanceof Error && error.message === 'Invalid token format received from server') {
        throw error;
      }
      const axiosError = error as any;
      throw axiosError.response?.data || axiosError;
    }
  }

  /**
   * User logout
   * Clears all authentication data from localStorage
   */
  static logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  }

  /**
   * Get current authenticated user
   * Retrieves user data from localStorage
   */
  static getCurrentUser(): User | null {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  }

  /**
   * Get authentication token
   * Retrieves JWT token from localStorage
   */
  static getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  /**
   * Check if user is authenticated
   * Returns true if valid token and user data exist
   */
  static isAuthenticated(): boolean {
    return !!(this.getToken() && this.getCurrentUser());
  }

  /**
   * Check if current user has specific role
   * Used for role-based UI rendering and access control
   */
  static hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  /**
   * Check if current user has admin privileges
   * Convenience method for admin-only features
   */
  static isAdmin(): boolean {
    return this.hasRole('Admin');
  }
}