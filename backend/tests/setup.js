/**
 * JEST TEST SETUP
 *
 * Global test configuration and setup for all tests.
 * Configures test environment, mocks, and utilities.
 */

// Load test environment variables
const dotenv = require('dotenv');
dotenv.config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';