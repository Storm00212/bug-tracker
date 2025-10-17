import { createBug, getBugsByProject } from "../repositories/bugRepository.js";
import type { Bug } from "../models/Bug.js";

export class BugService {
  static async createBug(bugData: Omit<Bug, "id" | "createdAt">): Promise<Bug> {
    // Additional business logic can be added here
    // For example: validate project exists, check user permissions, send notifications, etc.

    const newBug = await createBug(bugData);
    return newBug;
  }

  static async getBugsByProject(projectId: number): Promise<Bug[]> {
    // Validate project exists (can be added later)
    const bugs = await getBugsByProject(projectId);

    // Additional business logic can be added here
    // For example: filter bugs based on user role, add computed fields, etc.

    return bugs;
  }

  static async getBugById(bugId: number): Promise<Bug | null> {
    // This would require a new repository method
    // For now, we'll get all bugs from all projects (not efficient for production)
    // TODO: Implement getBugById in repository
    return null;
  }
}