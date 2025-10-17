/**
 * BUG REPOSITORY
 *
 * Handles direct database operations for Bug entities.
 * Contains SQL queries for bug CRUD operations.
 * Bugs are the core tracking entities in the system.
 */
import type { Bug } from "../models/Bug.js";
/**
 * Create a new bug report in the database
 *
 * Process: Validate → Insert → Return result
 * Bugs can be reported by any authenticated user
 */
export declare const createBug: (bug: Bug) => Promise<any>;
/**
 * Get all bugs for a specific project
 *
 * Returns bugs ordered by creation date (newest first)
 * Used for project-specific bug listings
 */
export declare const getBugsByProject: (projectId: number) => Promise<import("mssql").IRecordSet<any>>;
//# sourceMappingURL=bugRepository.d.ts.map