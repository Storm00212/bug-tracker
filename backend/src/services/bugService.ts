/**
 * BUG SERVICE
 *
 * Contains business logic for bug tracking operations.
 * Services handle core application logic for managing software defects.
 * Bugs are the central entities that track issues throughout their lifecycle.
 */

import { createBug, getBugsByProject, getBugById, getAllBugs, updateBug, deleteBug } from "../repositories/bugRepository.js";
import type { Bug } from "../models/Bug.js";

export class BugService {
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
  static async createBug(bugData: Omit<Bug, "id" | "createdAt">): Promise<Bug> {
    // Future business logic can be added here:
    // - Validate project exists and user has access to it
    // - Check if reporter is a valid user
    // - Validate developer ID if provided
    // - Set default status to "Open" if not specified
    // - Send email notifications to relevant team members
    // - Create audit log entry for bug creation

    // Call repository to persist the bug
    const newBug = await createBug(bugData);
    return newBug;
  }

  /**
   * Get all bugs for a specific project
   *
   * Business Logic:
   * - Could filter bugs based on user permissions
   * - Could add computed fields (comment counts, time since creation, etc.)
   * - Could sort bugs by priority, status, or creation date
   * - Could include user information for reporter/developer
   */
  static async getBugsByProject(projectId: number): Promise<Bug[]> {
    // Future validation: Check if project exists and user has access

    // Get bugs from repository
    const bugs = await getBugsByProject(projectId);

    // Future business logic can be added here:
    // - Filter bugs based on user's role (testers see different bugs than developers)
    // - Add computed fields like comment count, days open, priority score
    // - Sort by status, severity, or creation date
    // - Include reporter and developer user information
    // - Apply pagination for large bug lists

    return bugs;
  }

  /**
   * Get a specific bug by ID
   *
   * Business Logic:
   * - Could check if user has permission to view this bug
   * - Could load related data (comments, attachments, history)
   * - Could include detailed user information
   * - Could track bug view analytics
   */
  static async getBugById(bugId: number): Promise<Bug | null> {
    // Future business logic can be added here:
    // - Check if user has permission to view this bug
    // - Include reporter and developer user information
    // - Load related comments and attachments
    // - Track bug view analytics

    return await getBugById(bugId);
  }

  /**
   * Get all bugs with optional filtering
   *
   * Business Logic:
   * - Could filter bugs based on user permissions
   * - Could add computed fields (comment counts, time since creation, etc.)
   * - Could sort bugs by priority, status, or creation date
   * - Could include user information for reporter/developer
   */
  static async getAllBugs(filters?: {
    status?: string;
    severity?: string;
    reporterId?: number;
    developerId?: number;
  }): Promise<Bug[]> {
    // Future business logic can be added here:
    // - Filter bugs based on user's role and permissions
    // - Add computed fields like comment count, days open, priority score
    // - Sort by status, severity, or creation date
    // - Include reporter and developer user information
    // - Apply pagination for large bug lists

    return await getAllBugs(filters);
  }

  /**
   * Update bug information
   *
   * Business Logic:
   * - Could validate status transitions
   * - Could check user permissions for specific updates
   * - Could send notifications to relevant users
   * - Could create audit log entries
   */
  static async updateBug(bugId: number, bugData: Partial<Bug>): Promise<Bug> {
    // Future business logic can be added here:
    // - Validate status transitions (e.g., can't go from Resolved to Open)
    // - Check if user has permission to make this update
    // - Send notifications to bug reporter and assigned developer
    // - Create audit log entry for bug changes

    return await updateBug(bugId, bugData);
  }

  /**
   * Delete a bug
   *
   * Business Logic:
   * - Could check if user has delete permissions
   * - Could verify bug is in appropriate state for deletion
   * - Could send notifications to team members
   * - Could create audit log entries
   */
  static async deleteBug(bugId: number): Promise<number> {
    // Future business logic can be added here:
    // - Check if user has permission to delete bugs
    // - Verify bug is in appropriate state (not critical unresolved bugs)
    // - Send notifications to bug reporter and assigned developer
    // - Create audit log entry for bug deletion

    const result = await deleteBug(bugId);
    return result || 0;
  }
}