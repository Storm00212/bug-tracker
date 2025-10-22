/**
 * ISSUE SERVICE
 *
 * Frontend service for issue tracking operations.
 * Handles CRUD operations for issues and related functionality.
 * Provides methods for creating, updating, and querying issues.
 * Supports all Jira-like features: issue types, custom fields, workflows, etc.
 */

import api from '../lib/api';

// Issue types supported by the system
export type IssueType = 'Bug' | 'Task' | 'Story' | 'Epic' | 'Subtask';

// Priority levels
export type Priority = 'Lowest' | 'Low' | 'Medium' | 'High' | 'Highest';

// Status options
export type IssueStatus = 'Open' | 'In Progress' | 'Resolved' | 'Closed' | 'To Do' | 'In Review' | 'Done' | 'Backlog';

// TypeScript interfaces matching backend models
export interface Issue {
  id?: number;
  key?: string;
  title: string;
  description: string;
  type: IssueType;
  priority: Priority;
  status: IssueStatus;
  reporterId: number;
  assigneeId?: number;
  projectId: number;
  parentId?: number;
  epicId?: number;
  storyPoints?: number;
  labels: string[];
  components: string[];
  affectsVersions: string[];
  fixVersions: string[];
  dueDate?: string;
  environment?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateIssueData {
  title: string;
  description: string;
  type: IssueType;
  priority?: Priority;
  status?: IssueStatus;
  reporterId: number;
  assigneeId?: number;
  projectId: number;
  parentId?: number;
  epicId?: number;
  storyPoints?: number;
  labels?: string[];
  components?: string[];
  affectsVersions?: string[];
  fixVersions?: string[];
  dueDate?: string;
  environment?: string;
}

// Legacy Bug interface for backward compatibility
export interface Bug extends Issue {
  severity: Priority; // Maps to priority
  developerId?: number; // Maps to assigneeId
}

export interface CreateBugData extends CreateIssueData {
  severity: Priority;
  developerId?: number;
}

export interface Comment {
  id?: number;
  issueId: number; // Changed from bugId to issueId
  userId: number;
  content: string;
  createdAt?: string;
  username?: string;
}

// Custom Field interfaces
export interface CustomField {
  id?: number;
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'multiselect' | 'date' | 'datetime' | 'number' | 'checkbox' | 'radio' | 'user' | 'version' | 'component';
  description?: string;
  projectId: number;
  required: boolean;
  options?: Array<{ value: string; label: string; color?: string }>;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
  order: number;
  isActive: boolean;
}

export interface CustomFieldValue {
  id?: number;
  issueId: number;
  customFieldId: number;
  value: any;
}

// Workflow interfaces
export interface WorkflowStep {
  id: number;
  name: string;
  status: string;
  order: number;
  isInitial: boolean;
  isFinal: boolean;
}

export interface WorkflowTransition {
  id: number;
  name: string;
  fromStepId: number;
  toStepId: number;
  requiredRoles: string[];
}

/**
 * Issue service class
 * Provides methods for issue-related API operations
 * Supports all Jira-like functionality
 */
export class IssueService {
  /**
   * Create a new issue
   * Any authenticated user can create issues
   */
  static async createIssue(issueData: CreateIssueData): Promise<Issue> {
    try {
      const response = await api.post<{ message: string; issue: Issue }>('/issues', issueData);
      return response.data.issue;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  /**
   * Get all issues for a specific project
   */
  static async getIssuesByProject(projectId: number): Promise<Issue[]> {
    try {
      const response = await api.get<{ issues: Issue[] }>(`/issues/projects/${projectId}/issues`);
      return response.data.issues;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  /**
   * Get all issues across all projects with optional filtering
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
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.priority) params.append('priority', filters.priority);
      if (filters?.type) params.append('type', filters.type);
      if (filters?.reporterId) params.append('reporterId', filters.reporterId.toString());
      if (filters?.assigneeId) params.append('assigneeId', filters.assigneeId.toString());
      if (filters?.projectId) params.append('projectId', filters.projectId.toString());
      if (filters?.labels) params.append('labels', filters.labels.join(','));

      const queryString = params.toString();
      const url = `/issues${queryString ? `?${queryString}` : ''}`;

      const response = await api.get<{ issues: Issue[] }>(url);
      return response.data.issues;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  /**
   * Get a specific issue by ID
   */
  static async getIssueById(issueId: number): Promise<{ issue: Issue; comments: Comment[] }> {
    try {
      const response = await api.get<{ issue: Issue; comments: Comment[] }>(`/issues/${issueId}`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  /**
   * Update issue information
   */
  static async updateIssue(issueId: number, issueData: Partial<Issue>): Promise<Issue> {
    try {
      const response = await api.put<{ message: string; issue: Issue }>(`/issues/${issueId}`, issueData);
      return response.data.issue;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  /**
   * Delete an issue
   */
  static async deleteIssue(issueId: number): Promise<void> {
    try {
      await api.delete(`/issues/${issueId}`);
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  /**
   * Get issues by epic
   */
  static async getIssuesByEpic(epicId: number): Promise<Issue[]> {
    try {
      const response = await api.get<{ issues: Issue[] }>(`/issues/epics/${epicId}/issues`);
      return response.data.issues;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  /**
   * Get subtasks for a parent issue
   */
  static async getSubtasks(parentId: number): Promise<Issue[]> {
    try {
      const response = await api.get<{ issues: Issue[] }>(`/issues/${parentId}/subtasks`);
      return response.data.issues;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }
}

/**
 * Legacy Bug service class for backward compatibility
 * Maps to new Issue service
 */
export class BugService {
  /**
   * Report a new bug (legacy method)
   * Any authenticated user can report bugs
   */
  static async createBug(bugData: CreateBugData): Promise<Bug> {
    try {
      // Map legacy bug data to new issue format
      const issueData: CreateIssueData = {
        ...bugData,
        type: 'Bug',
        priority: bugData.severity,
        assigneeId: bugData.developerId,
        labels: [],
        components: [],
        affectsVersions: [],
        fixVersions: [],
      };

      const issue = await IssueService.createIssue(issueData);

      // Return in legacy Bug format
      return {
        ...issue,
        severity: issue.priority,
        developerId: issue.assigneeId,
      } as Bug;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  /**
   * Get all bugs for a specific project (legacy method)
   * Returns bugs ordered by creation date (newest first)
   */
  static async getBugsByProject(projectId: number): Promise<Bug[]> {
    try {
      const issues = await IssueService.getIssuesByProject(projectId);
      // Convert issues to legacy bug format
      return issues.map(issue => ({
        ...issue,
        severity: issue.priority,
        developerId: issue.assigneeId,
      })) as Bug[];
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  /**
   * Get all bugs across all projects (legacy method)
   */
  static async getAllBugs(): Promise<Bug[]> {
    try {
      const issues = await IssueService.getAllIssues({ type: 'Bug' });
      // Convert issues to legacy bug format
      return issues.map(issue => ({
        ...issue,
        severity: issue.priority,
        developerId: issue.assigneeId,
      })) as Bug[];
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  /**
   * Get a specific bug by ID (legacy method)
   */
  static async getBugById(bugId: number): Promise<Bug> {
    try {
      const { issue } = await IssueService.getIssueById(bugId);
      // Convert to legacy bug format
      return {
        ...issue,
        severity: issue.priority,
        developerId: issue.assigneeId,
      } as Bug;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  /**
   * Update bug information (legacy method)
   * Requires Developer or Admin role
   */
  static async updateBug(bugId: number, bugData: Partial<CreateBugData>): Promise<Bug> {
    try {
      // Map legacy bug data to issue format
      const issueData: Partial<Issue> = {
        ...bugData,
        priority: bugData.severity,
        assigneeId: bugData.developerId,
      };

      const issue = await IssueService.updateIssue(bugId, issueData);

      // Return in legacy format
      return {
        ...issue,
        severity: issue.priority,
        developerId: issue.assigneeId,
      } as Bug;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  /**
   * Delete a bug (legacy method)
   * Requires Admin role
   */
  static async deleteBug(bugId: number): Promise<void> {
    try {
      await IssueService.deleteIssue(bugId);
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  /**
   * Add a comment to an issue
   * Any authenticated user can comment on issues
   */
  static async addComment(commentData: { issueId: number; userId: number; content: string }): Promise<Comment> {
    try {
      const response = await api.post<{ message: string; comment: Comment }>('/comments', commentData);
      return response.data.comment;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  /**
   * Get all comments for a specific issue
   * Returns comments ordered chronologically
   */
  static async getCommentsByIssue(issueId: number): Promise<Comment[]> {
    try {
      const response = await api.get<{ comments: Comment[] }>(`/issues/${issueId}/comments`);
      return response.data.comments;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  /**
   * Legacy method for backward compatibility
   */
  static async getCommentsByBug(bugId: number): Promise<Comment[]> {
    return this.getCommentsByIssue(bugId);
  }

  // Custom Field Methods
  static async getCustomFieldsByProject(projectId: number): Promise<CustomField[]> {
    try {
      const response = await api.get<{ fields: CustomField[] }>(`/custom-fields/projects/${projectId}`);
      return response.data.fields;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  static async createCustomField(fieldData: Omit<CustomField, 'id'>): Promise<CustomField> {
    try {
      const response = await api.post<{ message: string; field: CustomField }>('/custom-fields', fieldData);
      return response.data.field;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  static async setCustomFieldValues(issueId: number, fieldValues: { customFieldId: number; value: any }[]): Promise<CustomFieldValue[]> {
    try {
      const response = await api.post<{ message: string; values: CustomFieldValue[] }>(`/custom-fields/issues/${issueId}/values`, { fieldValues });
      return response.data.values;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  static async getCustomFieldValues(issueId: number): Promise<CustomFieldValue[]> {
    try {
      const response = await api.get<{ values: CustomFieldValue[] }>(`/custom-fields/issues/${issueId}/values`);
      return response.data.values;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }
}