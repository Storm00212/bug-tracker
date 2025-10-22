/**
 * JEST TEST SETUP
 *
 * Global test configuration and setup
 */

import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Mock database connection for tests
jest.mock('../src/config/db', () => ({
  getPool: jest.fn(() => ({
    request: jest.fn(() => ({
      input: jest.fn().mockReturnThis(),
      query: jest.fn().mockResolvedValue({ recordset: [] }),
    })),
    transaction: jest.fn(() => ({
      begin: jest.fn().mockResolvedValue(undefined),
      commit: jest.fn().mockResolvedValue(undefined),
      rollback: jest.fn().mockResolvedValue(undefined),
      request: jest.fn(() => ({
        input: jest.fn().mockReturnThis(),
        query: jest.fn().mockResolvedValue({ rowsAffected: [1] }),
      })),
    })),
  })),
  closePool: jest.fn(),
}));

// Global test timeout
jest.setTimeout(10000);