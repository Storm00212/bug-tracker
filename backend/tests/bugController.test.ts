/**
 * BUG CONTROLLER TESTS
 *
 * Unit tests for bug controller functions.
 * Tests bug creation, retrieval, updates, and deletion.
 *
 * WHAT THIS TEST FILE DOES:
 * - Tests all CRUD operations for bugs (Create, Read, Update, Delete)
 * - Uses mocking to isolate controller logic from database/service dependencies
 * - Tests both successful operations and error scenarios
 * - Validates HTTP status codes, response formats, and service method calls
 *
 * TESTING PATTERNS USED:
 * - AAA Pattern: Arrange (setup), Act (execute), Assert (verify)
 * - Happy Path Testing: Tests successful scenarios
 * - Error Path Testing: Tests failure scenarios and error handling
 * - Mock Verification: Ensures correct service methods are called with right parameters
 */

import request from 'supertest'; // Library for testing HTTP endpoints
import express from 'express';
import { reportBug, getBug, updateBug, deleteBug, getAllBugs } from '../src/controllers/bugController.js';
import { BugService } from '../src/services/bugService.js';

/**
 * MOCKING THE BUG SERVICE:
 * We mock the entire BugService to test ONLY the controller logic.
 * This prevents actual database calls and focuses on how the controller handles requests/responses.
 */
jest.mock('../src/services/bugService.js', () => ({
  BugService: {
    createBug: jest.fn(),      // Mock function for creating bugs
    getBugById: jest.fn(),     // Mock function for getting single bug
    updateBug: jest.fn(),      // Mock function for updating bugs
    deleteBug: jest.fn(),      // Mock function for deleting bugs
    getAllBugs: jest.fn(),     // Mock function for getting all bugs
  },
}));

// Type the mocked service for better TypeScript support and IntelliSense
const mockBugService = BugService as jest.Mocked<typeof BugService>;

/**
 * MOCKING DATABASE CONNECTION:
 * We mock the database connection to avoid actual DB calls during testing.
 * This makes tests faster and prevents test data pollution.
 */
jest.mock('../src/config/db.js', () => ({
  getPool: jest.fn(() => ({
    request: jest.fn(() => ({
      input: jest.fn().mockReturnThis(),  // Chainable mock methods
      query: jest.fn().mockResolvedValue({ recordset: [] }),
    })),
    transaction: jest.fn(() => ({
      begin: jest.fn().mockResolvedValue(undefined),
      commit: jest.fn().mockResolvedValue(undefined),
      rollback: jest.fn().mockResolvedValue(undefined),
      request: jest.fn(() => ({
        input: jest.fn().mockReturnThis(),
        query: jest.fn().mockResolvedValue({ recordset: [], rowsAffected: [1] }),
      })),
    })),
  })),
}));

/**
 * MAIN TEST SUITE:
 * Groups all bug-related tests together.
 * Each describe block focuses on a specific endpoint or functionality.
 */
describe('Bug Controller', () => {
  let app: express.Application; // Express app instance for testing

  /**
   * SETUP BEFORE EACH TEST:
   * Creates a fresh Express app and sets up routes for every test.
   * This ensures test isolation - no state carries over between tests.
   */
  beforeEach(() => {
    // Create new Express app for each test
    app = express();
    app.use(express.json()); // Enable JSON parsing

    // Register all bug-related routes
    app.post('/bugs', reportBug);      // Create bug
    app.get('/bugs', getAllBugs);      // Get all bugs
    app.get('/bugs/:id', getBug);      // Get single bug
    app.put('/bugs/:id', updateBug);   // Update bug
    app.delete('/bugs/:id', deleteBug); // Delete bug

    // Reset all mocks to clean state
    jest.clearAllMocks();
  });

  /**
   * TESTING BUG CREATION (POST /bugs)
   * This endpoint allows users to report new bugs in the system.
   */
  describe('POST /bugs', () => {
    /**
     * SUCCESSFUL BUG CREATION TEST:
     * Tests the happy path where a user successfully reports a bug.
     * This is the most common and important use case.
     */
    it('should create a new bug successfully', async () => {
      // ARRANGE: Prepare test data and mock responses
      const bugData = {
        title: 'Test Bug',
        description: 'This is a test bug',
        type: 'Bug',
        priority: 'High',
        status: 'Open',
        reporterId: 1,
        projectId: 1,
        labels: [],
        components: [],
        affectsVersions: [],
        fixVersions: [],
      };

      // Expected bug object that service should return
      const mockBug = {
        id: 1,                   // Auto-generated ID
        ...bugData,              // Spread original data
        createdAt: new Date()    // Auto-generated timestamp
      };

      // Configure mock to return our expected bug
      mockBugService.createBug.mockResolvedValue(mockBug);

      // ACT: Make the HTTP request to create a bug
      const response = await request(app)
        .post('/bugs')           // POST endpoint for bug creation
        .send(bugData)           // Send bug data in request body
        .expect(201);            // Expect HTTP 201 Created status

      // ASSERT: Verify the response and service interaction
      expect(response.body.message).toBe('Bug reported successfully');  // Success message
      expect(response.body.bug).toEqual(mockBug);                      // Returned bug data
      expect(mockBugService.createBug).toHaveBeenCalledWith(bugData);   // Service called correctly
    });

    it('should return 400 for invalid bug data', async () => {
      const invalidData = {
        title: '', // Invalid: empty title
        description: 'Test description',
        type: 'Bug',
        priority: 'Invalid', // Invalid priority
        reporterId: 1,
        projectId: 1,
        labels: [],
        components: [],
        affectsVersions: [],
        fixVersions: [],
      };

      const response = await request(app)
        .post('/bugs')
        .send(invalidData)
        .expect(400);

      expect(response.body.message).toContain('Bug title must be at least 3 characters');
      expect(mockBugService.createBug).not.toHaveBeenCalled();
    });

    it('should return 500 for server errors', async () => {
      const bugData = {
        title: 'Test Bug',
        description: 'This is a test bug',
        type: 'Bug',
        priority: 'High',
        status: 'Open',
        reporterId: 1,
        projectId: 1,
        labels: [],
        components: [],
        affectsVersions: [],
        fixVersions: [],
      };

      mockBugService.createBug.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/bugs')
        .send(bugData)
        .expect(500);

      expect(response.body.message).toBe('Server error reporting bug');
    });
  });

  describe('GET /bugs', () => {
    it('should return all bugs', async () => {
      const mockBugs = [
        { id: 1, title: 'Bug 1', status: 'Open' },
        { id: 2, title: 'Bug 2', status: 'Closed' }
      ];

      mockBugService.getAllBugs.mockResolvedValue(mockBugs);

      const response = await request(app)
        .get('/bugs')
        .expect(200);

      expect(response.body.bugs).toEqual(mockBugs);
      expect(mockBugService.getAllBugs).toHaveBeenCalledWith(undefined);
    });

    it('should filter bugs by status', async () => {
      const mockBugs = [{ id: 1, title: 'Open Bug', status: 'Open' }];
      const filters = { status: 'Open' };

      mockBugService.getAllBugs.mockResolvedValue(mockBugs);

      const response = await request(app)
        .get('/bugs?status=Open')
        .expect(200);

      expect(response.body.bugs).toEqual(mockBugs);
      expect(mockBugService.getAllBugs).toHaveBeenCalledWith(filters);
    });
  });

  describe('GET /bugs/:id', () => {
    it('should return a specific bug', async () => {
      const mockBug = {
        id: 1,
        title: 'Test Bug',
        description: 'Bug description',
        status: 'Open'
      };

      mockBugService.getBugById.mockResolvedValue(mockBug);

      const response = await request(app)
        .get('/bugs/1')
        .expect(200);

      expect(response.body.bug).toEqual(mockBug);
      expect(mockBugService.getBugById).toHaveBeenCalledWith(1);
    });

    it('should return 404 for non-existent bug', async () => {
      mockBugService.getBugById.mockResolvedValue(null);

      const response = await request(app)
        .get('/bugs/999')
        .expect(404);

      expect(response.body.message).toBe('Bug not found');
    });
  });

  describe('PUT /bugs/:id', () => {
    it('should update a bug successfully', async () => {
      const updateData = { status: 'Resolved', developerId: 2 };
      const mockUpdatedBug = {
        id: 1,
        title: 'Test Bug',
        status: 'Resolved',
        developerId: 2
      };

      mockBugService.updateBug.mockResolvedValue(mockUpdatedBug);

      const response = await request(app)
        .put('/bugs/1')
        .send(updateData)
        .expect(200);

      expect(response.body.message).toBe('Bug updated successfully');
      expect(response.body.bug).toEqual(mockUpdatedBug);
      expect(mockBugService.updateBug).toHaveBeenCalledWith(1, updateData);
    });

    it('should return 500 for update errors', async () => {
      const updateData = { status: 'Resolved' };

      mockBugService.updateBug.mockRejectedValue(new Error('Update failed'));

      const response = await request(app)
        .put('/bugs/1')
        .send(updateData)
        .expect(500);

      expect(response.body.message).toBe('Server error updating bug');
    });
  });

  describe('DELETE /bugs/:id', () => {
    it('should delete a bug successfully', async () => {
      mockBugService.deleteBug.mockResolvedValue(1);

      const response = await request(app)
        .delete('/bugs/1')
        .expect(200);

      expect(response.body.message).toBe('Bug deleted successfully');
      expect(mockBugService.deleteBug).toHaveBeenCalledWith(1);
    });

    it('should return 404 for non-existent bug', async () => {
      mockBugService.deleteBug.mockResolvedValue(0);

      const response = await request(app)
        .delete('/bugs/999')
        .expect(404);

      expect(response.body.message).toBe('Bug not found');
    });
  });
});