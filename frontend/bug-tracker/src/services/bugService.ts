/**
 * BUG SERVICE
 *
 * Frontend service for bug tracking operations.
 * Handles CRUD operations for bugs and related functionality.
 * Provides methods for reporting, updating, and querying bugs.
 */

import api from '../lib/api';

// TypeScript interfaces matching backend models
export interface Bug {
  id?: number;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status?: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  reporterId: number;
  developerId?: number;
  projectId: number;
  createdAt?: string;
}

export interface CreateBugData {
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  reporterId: number;
  developerId?: number;
  projectId: number;
}

export interface Comment {
  id?: number;
  bugId: number;
  userId: number;
  content: string;
  createdAt?: string;
  username?: string;
}

/**
 * Bug service class
 * Provides methods for bug-related API operations
 */
export class BugService {
  /**
   * Report a new bug
   * Any authenticated user can report bugs
   */
  static async createBug(bugData: CreateBugData): Promise<Bug> {
    try {
      const response = await api.post<{ message: string; bug: Bug }>('/bugs', bugData);
      return response.data.bug;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  /**
   * Get all bugs for a specific project
   * Returns bugs ordered by creation date (newest first)
   */
  static async getBugsByProject(projectId: number): Promise<Bug[]> {
    try {
      const response = await api.get<{ bugs: Bug[] }>(`/projects/${projectId}/bugs`);
      return response.data.bugs;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  /**
   * Get all bugs across all projects
   * Note: This endpoint is not implemented in backend yet
   */
  static async getAllBugs(): Promise<Bug[]> {
    try {
      const response = await api.get<{ bugs: Bug[] }>('/bugs');
      return response.data.bugs;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  /**
   * Get a specific bug by ID
   * Note: This endpoint is not implemented in backend yet
   */
  static async getBugById(bugId: number): Promise<Bug> {
    try {
      const response = await api.get<{ bug: Bug }>(`/bugs/${bugId}`);
      return response.data.bug;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  /**
   * Update bug information
   * Requires Developer or Admin role
   * Note: This endpoint is not implemented in backend yet
   */
  static async updateBug(bugId: number, bugData: Partial<CreateBugData>): Promise<Bug> {
    try {
      const response = await api.put<{ message: string; bug: Bug }>(`/bugs/${bugId}`, bugData);
      return response.data.bug;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  /**
   * Delete a bug
   * Requires Admin role
   * Note: This endpoint is not implemented in backend yet
   */
  static async deleteBug(bugId: number): Promise<void> {
    try {
      await api.delete(`/bugs/${bugId}`);
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  /**
   * Add a comment to a bug
   * Any authenticated user can comment on bugs
   */
  static async addComment(commentData: { bugId: number; userId: number; content: string }): Promise<Comment> {
    try {
      const response = await api.post<{ message: string; comment: Comment }>('/comments', commentData);
      return response.data.comment;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  /**
   * Get all comments for a specific bug
   * Returns comments ordered chronologically
   */
  static async getCommentsByBug(bugId: number): Promise<Comment[]> {
    try {
      const response = await api.get<{ comments: Comment[] }>(`/bugs/${bugId}/comments`);
      return response.data.comments;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }
}