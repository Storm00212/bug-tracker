import { createProject, getAllProjects } from "../repositories/projectRepository.js";
import type { Project } from "../models/Project.js";

export class ProjectService {
  static async createProject(projectData: Omit<Project, "id" | "createdAt">): Promise<Project> {
    // Additional business logic can be added here
    // For example: validate project name uniqueness, check user permissions, etc.

    const newProject = await createProject(projectData);
    return newProject;
  }

  static async getAllProjects(): Promise<Project[]> {
    const projects = await getAllProjects();

    // Additional business logic can be added here
    // For example: filter projects based on user permissions, add computed fields, etc.

    return projects;
  }

  static async getProjectById(projectId: number): Promise<Project | null> {
    // This method can be added to repository if needed
    const projects = await getAllProjects();
    return projects.find(p => p.id === projectId) || null;
  }
}