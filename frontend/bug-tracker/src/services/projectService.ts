/**
 * PROJECT SERVICE
 *
 * Frontend service for project management operations.
 * Handles CRUD operations for projects through API calls.
 * Provides methods for creating, reading, and managing projects.
 */

import api from '../lib/api';

// TypeScript interfaces matching backend models
export interface Project {
  id?: number;
  name: string;
  description?: string;
  createdAt?: string;
}

export interface CreateProjectData {
  name: string;
  description?: string;
}

/**
 * Project service class
 * Provides methods for project-related API operations
 */
export class ProjectService {
  /**
   * Create a new project
   * Requires Admin role (enforced by backend)
   */
  static async createProject(projectData: CreateProjectData): Promise<Project> {
    try {
      const response = await api.post<{ message: string; project: Project }>('/projects', projectData);
      return response.data.project;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  /**
   * Get all projects
   * Returns list of all projects user has access to
   */
  static async getAllProjects(): Promise<Project[]> {
    try {
      const response = await api.get<{ projects: Project[] }>('/projects');
      return response.data.projects;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  /**
   * Get a specific project by ID
   * Note: This endpoint is not implemented in backend yet
   */
  static async getProjectById(projectId: number): Promise<Project> {
    try {
      const response = await api.get<{ project: Project }>(`/projects/${projectId}`);
      return response.data.project;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  /**
   * Update an existing project
   * Requires Admin role (enforced by backend)
   * Note: This endpoint is not implemented in backend yet
   */
  static async updateProject(projectId: number, projectData: Partial<CreateProjectData>): Promise<Project> {
    try {
      const response = await api.put<{ message: string; project: Project }>(`/projects/${projectId}`, projectData);
      return response.data.project;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  /**
   * Delete a project
   * Requires Admin role (enforced by backend)
   * Note: This endpoint is not implemented in backend yet
   */
  static async deleteProject(projectId: number): Promise<void> {
    try {
      await api.delete(`/projects/${projectId}`);
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }
}