/**
 * PROJECT SERVICE
 *
 * Contains business logic for project management operations.
 * Services handle core application logic separate from HTTP and data concerns.
 * Projects serve as containers for organizing and grouping related bugs.
 */

import { createProject, getAllProjects } from "../repositories/projectRepository.js";
import type { Project } from "../models/Project.js";

export class ProjectService {
  /**
   * Create a new project
   *
   * Business Logic:
   * - Could validate project name uniqueness
   * - Could check user permissions for project creation
   * - Could set default values or apply business rules
   * - Could send notifications to team members
   */
  static async createProject(projectData: Omit<Project, "id" | "createdAt">): Promise<Project> {
    // Future business logic can be added here:
    // - Validate project name uniqueness across the system
    // - Check if user has permission to create projects
    // - Apply default settings based on organization rules
    // - Send notifications to relevant team members

    // Call repository to persist the project
    const newProject = await createProject(projectData);
    return newProject;
  }

  /**
   * Retrieve all projects
   *
   * Business Logic:
   * - Could filter projects based on user permissions
   * - Could add computed fields (bug counts, active members, etc.)
   * - Could sort projects by priority or recent activity
   * - Could include project statistics
   */
  static async getAllProjects(): Promise<Project[]> {
    // Get all projects from repository
    const projects = await getAllProjects();

    // Future business logic can be added here:
    // - Filter projects based on user's role and permissions
    // - Add computed fields like total bugs, active bugs, team members
    // - Sort by creation date, activity level, or priority
    // - Include project health metrics

    return projects;
  }

  /**
   * Get a specific project by ID
   *
   * Business Logic:
   * - Could check if user has access to this project
   * - Could include additional project details
   * - Could load related data (team members, recent bugs, etc.)
   *
   * Note: This is a basic implementation. In production, you'd want
   * a dedicated repository method for efficient single-project queries.
   */
  static async getProjectById(projectId: number): Promise<Project | null> {
    // This implementation gets all projects and filters (inefficient for production)
    // TODO: Add getProjectById method to repository for better performance

    const projects = await getAllProjects();
    return projects.find(p => p.id === projectId) || null;
  }
}