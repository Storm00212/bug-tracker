/**
 * AUTH CONTROLLER TESTS
 *
 * Unit tests for authentication controller functions.
 * Tests user registration, login, and authentication middleware.
 *
 * WHAT ARE UNIT TESTS?
 * Unit tests verify that individual pieces of code (units) work correctly in isolation.
 * They help catch bugs early, ensure code reliability, and make refactoring safer.
 *
 * JEST BASICS FOR BEGINNERS:
 * - describe(): Groups related tests together (like a test suite)
 * - it(): Defines a single test case (also can use test())
 * - expect(): Makes assertions about what the code should do
 * - beforeEach(): Runs setup code before each test
 * - jest.mock(): Creates fake versions of dependencies so we test only our code
 * - jest.clearAllMocks(): Resets mock call history between tests
 */

import request from 'supertest'; // HTTP testing library for Express apps
import express from 'express';
import { registerUser, loginUser } from '../src/controllers/authController.js';
import { AuthService } from '../src/services/authService.js';

/**
 * MOCKING EXPLANATION:
 * We mock the AuthService because we want to test ONLY the controller logic,
 * not the actual database operations or business logic in the service layer.
 * This isolates our tests and makes them faster and more reliable.
 */
jest.mock('../src/services/authService.js', () => ({
  AuthService: {
    register: jest.fn(), // Mock function that we can control in tests
    login: jest.fn(),
  },
}));

// Type the mocked service for better TypeScript support
const mockAuthService = AuthService as jest.Mocked<typeof AuthService>;

/**
 * DESCRIBE BLOCK:
 * This is our main test suite for the Auth Controller.
 * All tests related to authentication will be grouped here.
 */
describe('Auth Controller', () => {
  let app: express.Application; // Express app instance for testing

  /**
   * BEFORE EACH:
   * This setup runs before EVERY individual test (it() block).
   * It ensures each test starts with a clean, consistent state.
   * We create a fresh Express app and set up routes for each test.
   */
  beforeEach(() => {
    // Create a new Express application for each test
    app = express();
    app.use(express.json()); // Enable JSON parsing middleware

    // Set up the routes we want to test
    app.post('/register', registerUser);
    app.post('/login', loginUser);

    // Reset all mocks to ensure clean state between tests
    jest.clearAllMocks();
  });

  /**
   * TESTING POST /register ENDPOINT
   * This describe block groups all tests for the user registration functionality.
   */
  describe('POST /register', () => {
    /**
     * HAPPY PATH TEST:
     * Tests the successful user registration scenario.
     * This is the most common use case we want to ensure works correctly.
     */
    it('should register a new user successfully', async () => {
      // ARRANGE: Set up test data and mock behavior
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        role: 'Developer'
      };

      // Define what the service should return when called
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        role: 'Developer',
        createdAt: new Date()
      };

      // Mock the service to return our fake user data
      mockAuthService.register.mockResolvedValue(mockUser);

      // ACT: Make the actual HTTP request to our endpoint
      const response = await request(app)
        .post('/register')        // HTTP method and endpoint
        .send(userData)           // Request body data
        .expect(201);             // Expected HTTP status code

      // ASSERT: Verify the response and that our service was called correctly
      expect(response.body.message).toBe('User registered successfully'); // Check success message
      expect(response.body.user).toEqual(mockUser);                      // Check returned user data
      expect(mockAuthService.register).toHaveBeenCalledWith(userData);   // Verify service was called with correct data
    });

    /**
     * ERROR HANDLING TEST:
     * Tests what happens when invalid data is sent.
     * This ensures our validation works and prevents bad data from reaching the service.
     */
    it('should return 400 for invalid input', async () => {
      // Test data with validation errors
      const invalidData = {
        username: '',              // Invalid: empty username
        email: 'invalid-email',    // Invalid: malformed email
        password: '123'            // Invalid: too short (should be at least 6 chars)
      };

      // Make request with invalid data
      const response = await request(app)
        .post('/register')
        .send(invalidData)
        .expect(400); // Should return Bad Request

      // Verify error response and that service was NOT called
      expect(response.body.message).toContain('Validation failed');
      expect(mockAuthService.register).not.toHaveBeenCalled(); // Service should not be called with invalid data
    });

    /**
     * SERVER ERROR TEST:
     * Tests what happens when the service layer throws an error (like database issues).
     * This ensures our error handling works correctly and returns appropriate error responses.
     */
    it('should return 500 for server errors', async () => {
      // Valid user data
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        role: 'Developer'
      };

      // Mock the service to throw an error (simulating database failure)
      mockAuthService.register.mockRejectedValue(new Error('Database error'));

      // Make the request
      const response = await request(app)
        .post('/register')
        .send(userData)
        .expect(500); // Should return Internal Server Error

      // Verify error message
      expect(response.body.message).toBe('Server error registering user');
    });
  });

  /**
   * TESTING POST /login ENDPOINT
   * This describe block groups all tests for the user login functionality.
   */
  describe('POST /login', () => {
    /**
     * SUCCESSFUL LOGIN TEST:
     * Tests the happy path for user authentication.
     * Verifies that valid credentials return a token and user data.
     */
    it('should login user successfully', async () => {
      // Test data
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      // Mock response data
      const mockToken = 'jwt-token-here';
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        role: 'Developer'
      };

      // Configure mock to return success data
      mockAuthService.login.mockResolvedValue({ token: mockToken, user: mockUser });

      // Make login request
      const response = await request(app)
        .post('/login')
        .send(loginData)
        .expect(200); // Success status

      // Verify all response components
      expect(response.body.message).toBe('Login successful');
      expect(response.body.token).toBe(mockToken);
      expect(response.body.user).toBe(mockUser);
      expect(mockAuthService.login).toHaveBeenCalledWith(loginData.email, loginData.password);
    });

    /**
     * MISSING CREDENTIALS TEST:
     * Tests validation when required fields are missing.
     * Ensures the API properly validates input before processing.
     */
    it('should return 400 for missing credentials', async () => {
      // Send empty object (no email/password)
      const response = await request(app)
        .post('/login')
        .send({}) // Empty request body
        .expect(400); // Bad Request

      // Verify validation error and that service wasn't called
      expect(response.body.message).toContain('Validation failed');
      expect(mockAuthService.login).not.toHaveBeenCalled();
    });

    /**
     * INVALID CREDENTIALS TEST:
     * Tests what happens when wrong email/password is provided.
     * Ensures proper authentication failure handling.
     */
    it('should return 401 for invalid credentials', async () => {
      // Test data with wrong credentials
      const loginData = {
        email: 'wrong@example.com',
        password: 'wrongpassword'
      };

      // Mock service to reject with authentication error
      mockAuthService.login.mockRejectedValue(new Error('Invalid credentials'));

      // Make request
      const response = await request(app)
        .post('/login')
        .send(loginData)
        .expect(401); // Unauthorized

      // Verify error message
      expect(response.body.message).toBe('Invalid email or password');
    });
  });
});