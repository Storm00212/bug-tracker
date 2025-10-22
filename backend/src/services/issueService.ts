/**
 * ISSUE SERVICE
 *
 * Contains business logic for issue tracking operations.
 * Services handle core application logic for managing work items.
 * Issues are the central entities that track work throughout their lifecycle.
 */

import { createIssue, getIssuesByProject, getIssueById, getAllIssues, updateIssue, deleteIssue } from "../repositories/issueRepository.js";
import type { Issue } from "../models/Issue.js";

export class IssueService {
  /**
   * Create a new issue
   *
   * Business Logic:
   * - Could validate that the project exists
   * - Could check user permissions to create issues in this project
   * - Could set default values based on issue type
   * - Could send notifications to relevant users
   * - Could validate reporter and assignee user IDs exist
   * - Could generate issue key (PROJ-123)
   */
  static async createIssue(issueData: Omit<Issue, "id" | "createdAt" | "updatedAt">): Promise<Issue> {
    // Future business logic can be added here:
    // - Validate project exists and user has access to it
    // - Check if reporter is a valid user
    // - Validate assignee ID if provided
    // - Set default status based on issue type
    // - Generate unique issue key
    // - Send email notifications to relevant team members
    // - Create audit log entry for issue creation

    // Call repository to persist the issue
    const newIssue = await createIssue(issueData);
    return newIssue;
  }

  /**
   * Get all issues for a specific project
   *
   * Business Logic:
   * - Could filter issues based on user permissions
   * - Could add computed fields (comment counts, time since creation, etc.)
   * - Could sort issues by priority, status, or creation date
   * - Could include user information for reporter/assignee
   */
  static async getIssuesByProject(projectId: number): Promise<Issue[]> {
    // Future validation: Check if project exists and user has access

    // Get issues from repository
    const issues = await getIssuesByProject(projectId);

    // Future business logic can be added here:
    // - Filter issues based on user's role
    // - Add computed fields like comment count, days open, priority score
    // - Sort by status, priority, or creation date
    // - Include reporter and assignee user information
    // - Apply pagination for large issue lists

    return issues;
  }

  /**
   * Get a specific issue by ID
   *
   * Business Logic:
   * - Could check if user has permission to view this issue
   * - Could load related data (comments, attachments, history)
   * - Could include detailed user information
   * - Could track issue view analytics
   */
  static async getIssueById(issueId: number): Promise<Issue | null> {
    // Future business logic can be added here:
    // - Check if user has permission to view this issue
    // - Include reporter and assignee user information
    // - Load related comments and attachments
    // - Track issue view analytics

    return await getIssueById(issueId);
  }

  /**
   * Get all issues with optional filtering
   *
   * Business Logic:
   * - Could filter issues based on user permissions
   * - Could add computed fields (comment counts, time since creation, etc.)
   * - Could sort issues by priority, status, or creation date
   * - Could include user information for reporter/assignee
   */
  static async getAllIssues(filters?: {
    status?: string;
    priority?: string;
    type?: string;
    reporterId?: number;
    assigneeId?: number;
    projectId?: number;
    labels?: string[];
  }): Promise<Issue[]> {
    // Future business logic can be added here:
    // - Filter issues based on user's role and permissions
    // - Add computed fields like comment count, days open, priority score
    // - Sort by status, priority, or creation date
    // - Include reporter and assignee user information
    // - Apply pagination for large issue lists

    return await getAllIssues(filters);
  }

  /**
   * Update issue information
   *
   * Business Logic:
   * - Could validate status transitions
   * - Could check user permissions for specific updates
   * - Could send notifications to relevant users
   * - Could create audit log entries
   */
  static async updateIssue(issueId: number, issueData: Partial<Issue>): Promise<Issue> {
    // Future business logic can be added here:
    // - Validate status transitions based on workflow
    // - Check if user has permission to make this update
    // - Send notifications to issue reporter and assigned user
    // - Create audit log entry for issue changes
    // - Update timestamps

    return await updateIssue(issueId, issueData);
  }

  /**
   * Delete an issue
   *
   * Business Logic:
   * - Could check if user has delete permissions
   * - Could verify issue is in appropriate state for deletion
   * - Could send notifications to team members
   * - Could create audit log entries
   */
  static async deleteIssue(issueId: number): Promise<number> {
    // Future business logic can be added here:
    // - Check if user has permission to delete issues
    // - Verify issue is in appropriate state
    // - Send notifications to issue reporter and assigned user
    // - Create audit log entry for issue deletion

    const result = await deleteIssue(issueId);
    return result || 0;
  }

  /**
   * Get issues by epic
   */
  static async getIssuesByEpic(epicId: number): Promise<Issue[]> {
    return await getAllIssues({ epicId });
  }

  /**
   * Get subtasks for a parent issue
   */
  static async getSubtasks(parentId: number): Promise<Issue[]> {
    return await getAllIssues({ parentId });
  }

  /**
   * Get issues by component
   */
  static async getIssuesByComponent(component: string): Promise<Issue[]> {
    return await getAllIssues({ components: [component] });
  }

  /**
   * Get issues by version
   */
  static async getIssuesByVersion(version: string, type: 'affects' | 'fix' = 'fix'): Promise<Issue[]> {
    if (type === 'affects') {
      return await getAllIssues({ affectsVersions: [version] });
    } else {
      return await getAllIssues({ fixVersions: [version] });
    }
  }
}