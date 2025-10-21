/**
 * ADMIN SERVICE
 *
 * Frontend service for administrative operations.
 * Handles user management, analytics, and system reports.
 * Communicates with backend admin endpoints.
 */

import api from '../lib/api';

// TypeScript interfaces for admin data
export interface User {
  id: number;
  username: string;
  email: string;
  role: 'Admin' | 'Developer' | 'Tester';
  createdAt: string;
}

export interface Analytics {
  totalUsers: number;
  totalProjects: number;
  totalBugs: number;
  bugsByStatus: Array<{ status: string; count: number }>;
  bugsBySeverity: Array<{ severity: string; count: number }>;
  recentActivity: number;
}

export interface BugReport {
  summary: {
    totalBugs: number;
    openBugs: number;
    inProgressBugs: number;
    resolvedBugs: number;
    criticalBugs: number;
  };
  detailedReport: Array<{
    id: number;
    title: string;
    description: string;
    severity: string;
    status: string;
    reporterId: number;
    developerId?: number;
    projectId: number;
    createdAt: string;
    projectName?: string;
    reporterName?: string;
    developerName?: string;
  }>;
  filters: {
    startDate?: string;
    endDate?: string;
    projectId?: string;
    status?: string;
  };
}

/**
 * Admin service class
 * Provides methods for admin-related API operations
 */
export class AdminService {
  /**
   * Get all users in the system
   * Requires Admin role
   */
  static async getUsers(): Promise<User[]> {
    try {
      const response = await api.get<{ users: User[] }>('/admin/users');
      return response.data.users;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  /**
   * Update a user's role
   * Requires Admin role
   */
  static async updateUserRole(userId: number, role: 'Admin' | 'Developer' | 'Tester'): Promise<User> {
    try {
      const response = await api.put<{ message: string; user: User }>(`/admin/users/${userId}/role`, { role });
      return response.data.user;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  /**
   * Get system analytics
   * Requires Admin role
   */
  static async getAnalytics(): Promise<Analytics> {
    try {
      const response = await api.get<Analytics>('/admin/analytics');
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  /**
   * Generate bug reports with optional filters
   * Requires Admin role
   */
  static async getBugReports(filters?: {
    startDate?: string;
    endDate?: string;
    projectId?: string;
    status?: string;
  }): Promise<BugReport> {
    try {
      const queryString = filters ? new URLSearchParams(filters).toString() : '';
      const response = await api.get<BugReport>(`/admin/reports/bugs?${queryString}`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }
}