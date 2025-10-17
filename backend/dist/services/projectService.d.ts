/**
 * PROJECT SERVICE
 *
 * Contains business logic for project management operations.
 * Services handle core application logic separate from HTTP and data concerns.
 * Projects serve as containers for organizing and grouping related bugs.
 */
import type { Project } from "../models/Project.js";
export declare class ProjectService {
    /**
     * Create a new project
     *
     * Business Logic:
     * - Could validate project name uniqueness
     * - Could check user permissions for project creation
     * - Could set default values or apply business rules
     * - Could send notifications to team members
     */
    static createProject(projectData: Omit<Project, "id" | "createdAt">): Promise<Project>;
    /**
     * Retrieve all projects
     *
     * Business Logic:
     * - Could filter projects based on user permissions
     * - Could add computed fields (bug counts, active members, etc.)
     * - Could sort projects by priority or recent activity
     * - Could include project statistics
     */
    static getAllProjects(): Promise<Project[]>;
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
    static getProjectById(projectId: number): Promise<Project | null>;
}
//# sourceMappingURL=projectService.d.ts.map