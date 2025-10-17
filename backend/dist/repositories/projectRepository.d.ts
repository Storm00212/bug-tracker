/**
 * PROJECT REPOSITORY
 *
 * Handles direct database operations for Project entities.
 * Contains SQL queries for project CRUD operations.
 * Projects serve as containers for organizing bugs.
 */
import type { Project } from "../models/Project.js";
/**
 * Create a new project in the database
 *
 * Process: Validate → Insert → Return result
 * Projects are created by Admin users only
 */
export declare const createProject: (project: Project) => Promise<any>;
/**
 * Retrieve all projects from the database
 *
 * Returns projects ordered by creation date (newest first)
 * Used for project listings and dropdowns
 */
export declare const getAllProjects: () => Promise<import("mssql").IRecordSet<any>>;
//# sourceMappingURL=projectRepository.d.ts.map