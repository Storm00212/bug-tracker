/**
 * UNIT TESTS FOR ISSUE SERVICE
 *
 * Tests the business logic of the IssueService class
 */

import { IssueService } from '../src/services/issueService';
import { Issue } from '../src/models/Issue';

// Mock the repository layer
jest.mock('../src/repositories/issueRepository', () => ({
  createIssue: jest.fn(),
  getIssuesByProject: jest.fn(),
  getIssueById: jest.fn(),
  getAllIssues: jest.fn(),
  updateIssue: jest.fn(),
  deleteIssue: jest.fn(),
}));

const mockIssueRepository = require('../src/repositories/issueRepository');

describe('IssueService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createIssue', () => {
    it('should create a new issue successfully', async () => {
      const issueData = {
        title: 'Test Issue',
        description: 'Test description',
        type: 'Bug' as const,
        priority: 'High' as const,
        status: 'Open' as const,
        reporterId: 1,
        assigneeId: 2,
        projectId: 1,
        labels: [],
        components: [],
        affectsVersions: [],
        fixVersions: [],
      };

      const expectedIssue: Issue = {
        ...issueData,
        id: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockIssueRepository.createIssue.mockResolvedValue(expectedIssue);

      const result = await IssueService.createIssue(issueData);

      expect(mockIssueRepository.createIssue).toHaveBeenCalledWith(issueData);
      expect(result).toEqual(expectedIssue);
    });

    it('should handle repository errors', async () => {
      const issueData = {
        title: 'Test Issue',
        description: 'Test description',
        type: 'Bug' as const,
        reporterId: 1,
        projectId: 1,
      };

      mockIssueRepository.createIssue.mockRejectedValue(new Error('Database error'));

      await expect(IssueService.createIssue(issueData)).rejects.toThrow('Database error');
    });
  });

  describe('getIssuesByProject', () => {
    it('should return issues for a project', async () => {
      const projectId = 1;
      const mockIssues: Issue[] = [
        {
          id: 1,
          title: 'Issue 1',
          description: 'Description 1',
          type: 'Bug',
          priority: 'High',
          status: 'Open',
          reporterId: 1,
          projectId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockIssueRepository.getIssuesByProject.mockResolvedValue(mockIssues);

      const result = await IssueService.getIssuesByProject(projectId);

      expect(mockIssueRepository.getIssuesByProject).toHaveBeenCalledWith(projectId);
      expect(result).toEqual(mockIssues);
    });
  });

  describe('getIssueById', () => {
    it('should return an issue by ID', async () => {
      const issueId = 1;
      const mockIssue: Issue = {
        id: issueId,
        title: 'Test Issue',
        description: 'Test description',
        type: 'Bug',
        priority: 'High',
        status: 'Open',
        reporterId: 1,
        projectId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockIssueRepository.getIssueById.mockResolvedValue(mockIssue);

      const result = await IssueService.getIssueById(issueId);

      expect(mockIssueRepository.getIssueById).toHaveBeenCalledWith(issueId);
      expect(result).toEqual(mockIssue);
    });

    it('should return null for non-existent issue', async () => {
      const issueId = 999;
      mockIssueRepository.getIssueById.mockResolvedValue(null);

      const result = await IssueService.getIssueById(issueId);

      expect(result).toBeNull();
    });
  });

  describe('getAllIssues', () => {
    it('should return all issues with filters', async () => {
      const filters = {
        status: 'Open',
        priority: 'High',
        type: 'Bug',
      };

      const mockIssues: Issue[] = [
        {
          id: 1,
          title: 'Filtered Issue',
          description: 'Description',
          type: 'Bug',
          priority: 'High',
          status: 'Open',
          reporterId: 1,
          projectId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockIssueRepository.getAllIssues.mockResolvedValue(mockIssues);

      const result = await IssueService.getAllIssues(filters);

      expect(mockIssueRepository.getAllIssues).toHaveBeenCalledWith(filters);
      expect(result).toEqual(mockIssues);
    });

    it('should return all issues without filters', async () => {
      const mockIssues: Issue[] = [];
      mockIssueRepository.getAllIssues.mockResolvedValue(mockIssues);

      const result = await IssueService.getAllIssues();

      expect(mockIssueRepository.getAllIssues).toHaveBeenCalledWith(undefined);
      expect(result).toEqual(mockIssues);
    });
  });

  describe('updateIssue', () => {
    it('should update an issue successfully', async () => {
      const issueId = 1;
      const updateData = {
        status: 'In Progress' as const,
        assigneeId: 2,
      };

      const updatedIssue: Issue = {
        id: issueId,
        title: 'Test Issue',
        description: 'Test description',
        type: 'Bug',
        priority: 'High',
        status: 'In Progress',
        reporterId: 1,
        assigneeId: 2,
        projectId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockIssueRepository.updateIssue.mockResolvedValue(updatedIssue);

      const result = await IssueService.updateIssue(issueId, updateData);

      expect(mockIssueRepository.updateIssue).toHaveBeenCalledWith(issueId, updateData);
      expect(result).toEqual(updatedIssue);
    });
  });

  describe('deleteIssue', () => {
    it('should delete an issue successfully', async () => {
      const issueId = 1;
      mockIssueRepository.deleteIssue.mockResolvedValue(1);

      const result = await IssueService.deleteIssue(issueId);

      expect(mockIssueRepository.deleteIssue).toHaveBeenCalledWith(issueId);
      expect(result).toBe(1);
    });

    it('should return 0 for non-existent issue', async () => {
      const issueId = 999;
      mockIssueRepository.deleteIssue.mockResolvedValue(0);

      const result = await IssueService.deleteIssue(issueId);

      expect(result).toBe(0);
    });
  });

  describe('getIssuesByEpic', () => {
    it('should return issues for an epic', async () => {
      const epicId = 1;
      const mockIssues: Issue[] = [
        {
          id: 2,
          title: 'Story under Epic',
          description: 'Description',
          type: 'Story',
          priority: 'Medium',
          status: 'Open',
          reporterId: 1,
          projectId: 1,
          epicId: epicId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockIssueRepository.getAllIssues.mockResolvedValue(mockIssues);

      const result = await IssueService.getIssuesByEpic(epicId);

      expect(mockIssueRepository.getAllIssues).toHaveBeenCalledWith({ epicId });
      expect(result).toEqual(mockIssues);
    });
  });

  describe('getSubtasks', () => {
    it('should return subtasks for a parent issue', async () => {
      const parentId = 1;
      const mockSubtasks: Issue[] = [
        {
          id: 2,
          title: 'Subtask',
          description: 'Description',
          type: 'Subtask',
          priority: 'Low',
          status: 'Open',
          reporterId: 1,
          projectId: 1,
          parentId: parentId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockIssueRepository.getAllIssues.mockResolvedValue(mockSubtasks);

      const result = await IssueService.getSubtasks(parentId);

      expect(mockIssueRepository.getAllIssues).toHaveBeenCalledWith({ parentId });
      expect(result).toEqual(mockSubtasks);
    });
  });
});