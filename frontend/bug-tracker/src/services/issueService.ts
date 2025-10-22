/**
 * ISSUE SERVICE
 *
 * Frontend service for issue tracking operations.
 * Provides methods for creating, updating, and querying issues.
 * Supports all Jira-like features: issue types, custom fields, workflows, etc.
 */

import api from '../lib/api';
import { IssueService as BaseIssueService } from './bugService';
import type { Issue, CreateIssueData, Comment, CustomField, CustomFieldValue, IssueType, Priority, IssueStatus } from './bugService';

// Re-export from bugService for backward compatibility
export type { Issue, CreateIssueData, Comment, CustomField, CustomFieldValue, IssueType, Priority, IssueStatus };

/**
 * Enhanced Issue Service with additional frontend-specific methods
 */
export class IssueService extends BaseIssueService {
  /**
   * Get issues with advanced filtering and pagination
   */
  static async getIssuesAdvanced(filters: {
    status?: string[];
    priority?: string[];
    type?: string[];
    assigneeId?: number;
    reporterId?: number;
    projectId?: number;
    labels?: string[];
    components?: string[];
    epicId?: number;
    parentId?: number;
    searchText?: string;
    sortBy?: 'createdAt' | 'updatedAt' | 'priority' | 'status';
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  } = {}): Promise<{ issues: Issue[]; total: number; page: number; limit: number }> {
    try {
      const params = new URLSearchParams();

      // Handle array filters
      if (filters.status?.length) params.append('status', filters.status.join(','));
      if (filters.priority?.length) params.append('priority', filters.priority.join(','));
      if (filters.type?.length) params.append('type', filters.type.join(','));
      if (filters.labels?.length) params.append('labels', filters.labels.join(','));
      if (filters.components?.length) params.append('components', filters.components.join(','));

      // Handle single value filters
      if (filters.assigneeId) params.append('assigneeId', filters.assigneeId.toString());
      if (filters.reporterId) params.append('reporterId', filters.reporterId.toString());
      if (filters.projectId) params.append('projectId', filters.projectId.toString());
      if (filters.epicId) params.append('epicId', filters.epicId.toString());
      if (filters.parentId) params.append('parentId', filters.parentId.toString());
      if (filters.searchText) params.append('search', filters.searchText);
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());

      const queryString = params.toString();
      const url = `/issues/advanced${queryString ? `?${queryString}` : ''}`;

      const response = await api.get<{ issues: Issue[]; total: number; page: number; limit: number }>(url);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  /**
   * Bulk update issues
   */
  static async bulkUpdateIssues(issueIds: number[], updates: Partial<Issue>): Promise<{ updated: number; failed: number[] }> {
    try {
      const response = await api.put<{ updated: number; failed: number[] }>('/issues/bulk', { issueIds, updates });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  /**
   * Get issue statistics
   */
  static async getIssueStats(projectId?: number): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byPriority: Record<string, number>;
    byType: Record<string, number>;
    byAssignee: Record<number, number>;
    overdue: number;
    unassigned: number;
  }> {
    try {
      const url = projectId ? `/issues/stats?projectId=${projectId}` : '/issues/stats';
      const response = await api.get<{
        total: number;
        byStatus: Record<string, number>;
        byPriority: Record<string, number>;
        byType: Record<string, number>;
        byAssignee: Record<number, number>;
        overdue: number;
        unassigned: number;
      }>(url);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  /**
   * Clone an issue
   */
  static async cloneIssue(issueId: number, options: {
    title?: string;
    assigneeId?: number;
    labels?: string[];
    components?: string[];
    copyAttachments?: boolean;
    copyComments?: boolean;
  } = {}): Promise<Issue> {
    try {
      const response = await api.post<{ message: string; issue: Issue }>(`/issues/${issueId}/clone`, options);
      return response.data.issue;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  /**
   * Get issue activity/history
   */
  static async getIssueHistory(issueId: number): Promise<Array<{
    id: number;
    field: string;
    oldValue: any;
    newValue: any;
    authorId: number;
    authorName: string;
    createdAt: string;
  }>> {
    try {
      const response = await api.get<{
        history: Array<{
          id: number;
          field: string;
          oldValue: any;
          newValue: any;
          authorId: number;
          authorName: string;
          createdAt: string;
        }>
      }>(`/issues/${issueId}/history`);
      return response.data.history;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  /**
   * Link issues together
   */
  static async linkIssues(linkData: {
    sourceIssueId: number;
    targetIssueId: number;
    linkType: string;
  }): Promise<{ message: string }> {
    try {
      const response = await api.post<{ message: string }>('/issues/links', linkData);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  /**
   * Get linked issues
   */
  static async getLinkedIssues(issueId: number): Promise<Array<{
    id: number;
    linkType: string;
    linkedIssue: Issue;
    createdAt: string;
  }>> {
    try {
      const response = await api.get<{
        links: Array<{
          id: number;
          linkType: string;
          linkedIssue: Issue;
          createdAt: string;
        }>
      }>(`/issues/${issueId}/links`);
      return response.data.links;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  /**
   * Add time tracking entry
   */
  static async addWorkLog(workLogData: {
    issueId: number;
    timeSpent: number; // in minutes
    startDate?: string;
    description?: string;
  }): Promise<{ message: string }> {
    try {
      const response = await api.post<{ message: string }>('/worklogs', workLogData);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  /**
   * Get work logs for an issue
   */
  static async getWorkLogs(issueId: number): Promise<Array<{
    id: number;
    timeSpent: number;
    startDate?: string;
    description?: string;
    authorId: number;
    authorName: string;
    createdAt: string;
  }>> {
    try {
      const response = await api.get<{
        worklogs: Array<{
          id: number;
          timeSpent: number;
          startDate?: string;
          description?: string;
          authorId: number;
          authorName: string;
          createdAt: string;
        }>
      }>(`/issues/${issueId}/worklogs`);
      return response.data.worklogs;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  /**
   * Upload attachment to issue
   */
  static async uploadAttachment(issueId: number, file: File, filename?: string): Promise<{
    id: number;
    filename: string;
    originalName: string;
    size: number;
    mimeType: string;
    url: string;
  }> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (filename) formData.append('filename', filename);

      const response = await api.post<{
        attachment: {
          id: number;
          filename: string;
          originalName: string;
          size: number;
          mimeType: string;
          url: string;
        }
      }>(`/issues/${issueId}/attachments`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.attachment;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  /**
   * Get attachments for an issue
   */
  static async getAttachments(issueId: number): Promise<Array<{
    id: number;
    filename: string;
    originalName: string;
    size: number;
    mimeType: string;
    url: string;
    uploadedBy: number;
    uploaderName: string;
    createdAt: string;
  }>> {
    try {
      const response = await api.get<{
        attachments: Array<{
          id: number;
          filename: string;
          originalName: string;
          size: number;
          mimeType: string;
          url: string;
          uploadedBy: number;
          uploaderName: string;
          createdAt: string;
        }>
      }>(`/issues/${issueId}/attachments`);
      return response.data.attachments;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }
}