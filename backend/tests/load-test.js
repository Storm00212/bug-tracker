/**
 * LOAD TESTING SCRIPT
 *
 * This k6 script performs load testing on the Bug Tracking System API.
 * Load testing simulates normal production load to ensure the system can handle
 * expected traffic levels without performance degradation.
 *
 * Test Characteristics:
 * - Duration: 5 minutes
 * - Virtual Users: 50 concurrent users
 * - Ramp-up: Gradual increase to full load
 * - Steady State: Maintain load for majority of test
 * - Ramp-down: Gradual decrease
 *
 * Performance Targets:
 * - Response Time: < 500ms for 95% of requests
 * - Error Rate: < 1%
 * - Throughput: Consistent throughout test
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics for detailed monitoring
const errorRate = new Rate('errors');
const responseTimeTrend = new Trend('response_time');

// Test configuration
export const options = {
  stages: [
    // Ramp up to 50 users over 1 minute
    { duration: '1m', target: 50 },

    // Stay at 50 users for 3 minutes (steady state)
    { duration: '3m', target: 50 },

    // Ramp down to 0 users over 1 minute
    { duration: '1m', target: 0 },
  ],

  thresholds: {
    // 95% of requests should complete within 500ms
    http_req_duration: ['p(95)<500'],

    // Error rate should be less than 1%
    http_req_failed: ['rate<0.01'],

    // Custom error rate metric
    errors: ['rate<0.01'],
  },

  // Enable detailed output
  summaryTrendStats: ['avg', 'min', 'med', 'max', 'p(90)', 'p(95)', 'p(99)'],
};

// Base URL for the API (update this to match your environment)
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

// Test data - replace with actual test credentials
const TEST_USER = {
  email: 'test@example.com',
  password: 'testpassword123'
};

let authToken = '';

/**
 * SETUP FUNCTION
 *
 * Executed once before the test starts.
 * Performs initial login to get authentication token.
 */
export function setup() {
  console.log('🔧 Setting up load test...');

  // Login to get authentication token
  const loginResponse = http.post(`${BASE_URL}/auth/login`, {
    email: TEST_USER.email,
    password: TEST_USER.password,
  });

  if (loginResponse.status !== 200) {
    console.error('❌ Failed to login during setup. Check test credentials.');
    return;
  }

  const responseBody = JSON.parse(loginResponse.body);
  authToken = responseBody.token;

  if (!authToken) {
    console.error('❌ No token received from login response');
    return;
  }

  console.log('✅ Setup complete. Authentication token acquired.');
  return { authToken };
}

/**
 * DEFAULT FUNCTION (VU SCRIPT)
 *
 * This function is executed by each virtual user during the test.
 * It simulates typical user behavior patterns.
 */
export default function (data) {
  // Use token from setup
  const token = data.authToken;

  // Set authorization header for authenticated requests
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  // Simulate user behavior with weighted probabilities
  const randomAction = Math.random();

  if (randomAction < 0.3) {
    // 30% - Get user profile (lightweight request)
    getUserProfile(headers);
  } else if (randomAction < 0.6) {
    // 30% - List projects (medium request)
    listProjects(headers);
  } else if (randomAction < 0.8) {
    // 20% - Get bugs list (heavier request)
    listBugs(headers);
  } else {
    // 20% - Create a comment (write operation)
    createComment(headers);
  }

  // Random sleep between 1-3 seconds to simulate user think time
  sleep(Math.random() * 2 + 1);
}

/**
 * GET USER PROFILE
 *
 * Simulates a user checking their profile information.
 * This is a lightweight read operation.
 */
function getUserProfile(headers) {
  const response = http.get(`${BASE_URL}/auth/profile`, { headers });

  const checkResult = check(response, {
    'Profile request successful': (r) => r.status === 200,
    'Profile response time < 200ms': (r) => r.timings.duration < 200,
  });

  errorRate.add(!checkResult);
  responseTimeTrend.add(response.timings.duration);
}

/**
 * LIST PROJECTS
 *
 * Simulates browsing available projects.
 * Medium-weight read operation with potential database queries.
 */
function listProjects(headers) {
  const response = http.get(`${BASE_URL}/projects`, { headers });

  const checkResult = check(response, {
    'Projects list successful': (r) => r.status === 200,
    'Projects response time < 300ms': (r) => r.timings.duration < 300,
    'Response contains projects array': (r) => {
      try {
        const body = JSON.parse(r.body);
        return Array.isArray(body);
      } catch (e) {
        return false;
      }
    },
  });

  errorRate.add(!checkResult);
  responseTimeTrend.add(response.timings.duration);
}

/**
 * LIST BUGS
 *
 * Simulates viewing bug reports.
 * Heavier read operation that may involve joins and filtering.
 */
function listBugs(headers) {
  const response = http.get(`${BASE_URL}/bugs`, { headers });

  const checkResult = check(response, {
    'Bugs list successful': (r) => r.status === 200,
    'Bugs response time < 400ms': (r) => r.timings.duration < 400,
    'Response contains bugs array': (r) => {
      try {
        const body = JSON.parse(r.body);
        return Array.isArray(body);
      } catch (e) {
        return false;
      }
    },
  });

  errorRate.add(!checkResult);
  responseTimeTrend.add(response.timings.duration);
}

/**
 * CREATE COMMENT
 *
 * Simulates adding a comment to a bug report.
 * Write operation that tests database insert performance.
 */
function createComment(headers) {
  // First, get a random bug ID (simplified - in real scenario, you'd query for existing bugs)
  const bugId = Math.floor(Math.random() * 100) + 1;

  const commentData = {
    content: `Load test comment from VU ${__VU} at ${new Date().toISOString()}`,
    bugId: bugId,
  };

  const response = http.post(`${BASE_URL}/comments`, JSON.stringify(commentData), { headers });

  const checkResult = check(response, {
    'Comment creation successful': (r) => r.status === 201 || r.status === 200,
    'Comment response time < 500ms': (r) => r.timings.duration < 500,
  });

  errorRate.add(!checkResult);
  responseTimeTrend.add(response.timings.duration);
}

/**
 * TEARDOWN FUNCTION
 *
 * Executed once after all VUs complete.
 * Used for cleanup or final reporting.
 */
export function teardown(data) {
  console.log('🧹 Load test teardown complete.');
}

/**
 * LOAD TESTING BEST PRACTICES IMPLEMENTED:
 *
 * 1. Realistic User Behavior:
 *    - Weighted actions based on typical usage patterns
 *    - Random think times between requests
 *    - Mix of read and write operations
 *
 * 2. Performance Monitoring:
 *    - Custom metrics for detailed analysis
 *    - Response time trends
 *    - Error rate tracking
 *
 * 3. Test Configuration:
 *    - Gradual ramp-up/down to avoid sudden load spikes
 *    - Steady state period for stable measurements
 *    - Realistic thresholds based on user expectations
 *
 * 4. Error Handling:
 *    - Graceful handling of authentication failures
 *    - Comprehensive response validation
 *    - Detailed error reporting
 *
 * 5. Scalability Considerations:
 *    - Configurable base URL for different environments
 *    - Environment variable support
 *    - Reusable test data patterns
 *
 * INTERPRETING RESULTS:
 *
 * - http_req_duration: Overall response time statistics
 * - http_req_failed: Rate of failed requests
 * - errors: Custom error rate metric
 * - response_time: Trend of response times over time
 *
 * Look for:
 * - Consistent performance during steady state
 * - No performance degradation over time
 * - Low error rates throughout the test
 * - Response times within acceptable limits
 */