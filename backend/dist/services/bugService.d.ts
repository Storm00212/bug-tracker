/**
 * BUG SERVICE
 *
 * Contains business logic for bug tracking operations.
 * Services handle core application logic for managing software defects.
 * Bugs are the central entities that track issues throughout their lifecycle.
 */
import type { Bug } from "../models/Bug.js";
export declare class BugService {
    /**
     * Create a new bug report
     *
     * Business Logic:
     * - Could validate that the project exists
     * - Could check user permissions to report bugs in this project
     * - Could set default values (status = "Open")
     * - Could send notifications to assigned developers
     * - Could validate reporter and developer user IDs exist
     */
    static createBug(bugData: Omit<Bug, "id" | "createdAt">): Promise<Bug>;
    /**
     * Get all bugs for a specific project
     *
     * Business Logic:
     * - Could filter bugs based on user permissions
     * - Could add computed fields (comment counts, time since creation, etc.)
     * - Could sort bugs by priority, status, or creation date
     * - Could include user information for reporter/developer
     */
    static getBugsByProject(projectId: number): Promise<Bug[]>;
    /**
     * Get a specific bug by ID
     *
     * Business Logic:
     * - Could check if user has permission to view this bug
     * - Could load related data (comments, attachments, history)
     * - Could include detailed user information
     * - Could track bug view analytics
     *
     * Note: This is a placeholder implementation.
     * In production, you'd want a dedicated repository method for efficient queries.
     */
    static getBugById(bugId: number): Promise<Bug | null>;
}
//# sourceMappingURL=bugService.d.ts.map