/**
 * SPIKE TESTING SCRIPT
 *
 * This k6 script performs spike testing on the Bug Tracking System API.
 * Spike testing simulates sudden, extreme increases in load to test how the
 * system handles traffic spikes (e.g., viral social media posts, flash sales).
 *
 * Test Characteristics:
 * - Duration: 8 minutes
 * - Sudden Load Spikes: Rapid increase to extreme load levels
 * - Recovery Testing: Quick load reduction to test system recovery
 * - Multiple Spikes: Several spike events during the test
 *
 * Performance Targets:
 * - System stability during sudden load changes
 * - Quick recovery after load spikes
 * - No data loss or corruption during spikes
 * - Graceful degradation under extreme load
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics for detailed monitoring
const errorRate = new Rate('errors');
const responseTimeTrend = new Trend('response_time');
const spikeThroughput = new Trend('spike_throughput');

// Test configuration
export const options = {
  stages: [
    // Baseline load (20 users)
    { duration: '1m', target: 20 },

    // First spike - sudden jump to 200 users
    { duration: '30s', target: 200 },

    // Recovery - drop back to baseline
    { duration: '1m', target: 20 },

    // Second spike - even higher (300 users)
    { duration: '30s', target: 300 },

    // Recovery period
    { duration: '1m', target: 20 },

    // Third spike - maximum load (400 users)
    { duration: '45s', target: 400 },

    // Extended recovery and cool-down
    { duration: '2m', target: 20 },

    // Final spike - test sustained high load
    { duration: '1m', target: 250 },
  ],

  thresholds: {
    // Very lenient thresholds during spikes (expect degradation)
    http_req_duration: ['p(95)<3000'], // Allow up to 3s during spikes

    // Higher error tolerance during extreme load
    http_req_failed: ['rate<0.10'], // Up to 10% errors during spikes

    // Custom error rate metric
    errors: ['rate<0.10'],
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
  console.log('🔧 Setting up spike test...');

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
 * During spikes, we focus on critical operations that would be most affected.
 */
export default function (data) {
  // Use token from setup
  const token = data.authToken;

  // Set authorization header for authenticated requests
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  // During spikes, focus on high-impact operations
  const randomAction = Math.random();

  if (randomAction < 0.5) {
    // 50% - Critical read operations (most affected by spikes)
    getCriticalData(headers);
  } else {
    // 50% - Write operations (test system under write pressure)
    performWriteOperation(headers);
  }

  // Minimal think time during spikes to maximize load
  sleep(Math.random() * 0.5 + 0.2);
}

/**
 * GET CRITICAL DATA
 *
 * Simulates accessing critical application data during spikes.
 * These are operations users expect to work even under extreme load.
 */
function getCriticalData(headers) {
  const startTime = new Date().getTime();

  // Randomly select critical endpoints
  const endpoints = [
    `${BASE_URL}/bugs`,           // Bug list (most accessed)
    `${BASE_URL}/projects`,       // Projects (navigation critical)
    `${BASE_URL}/auth/profile`,   // User profile (personal critical)
  ];

  const randomEndpoint = endpoints[Math.floor(Math.random() * endpoints.length)];

  const response = http.get(randomEndpoint, { headers });

  const duration = new Date().getTime() - startTime;
  spikeThroughput.add(1, duration);

  const checkResult = check(response, {
    'Critical data request successful': (r) => r.status === 200,
    'Critical data response time reasonable': (r) => r.timings.duration < 2500,
    'Response contains expected data': (r) => r.body.length > 0,
  });

  errorRate.add(!checkResult);
  responseTimeTrend.add(response.timings.duration);

  // Log critical failures during spikes
  if (!checkResult) {
    console.log(`🚨 Critical operation failed during spike: ${response.status} - ${randomEndpoint}`);
  }

  // Log very slow responses during spikes
  if (response.timings.duration > 2000) {
    console.log(`🐌 Very slow response during spike: ${response.timings.duration}ms - ${randomEndpoint}`);
  }
}

/**
 * PERFORM WRITE OPERATION
 *
 * Tests write capabilities during traffic spikes.
 * Critical for ensuring data integrity during sudden load increases.
 */
function performWriteOperation(headers) {
  const startTime = new Date().getTime();

  // Randomly select write operations
  const operations = [
    () => createBugComment(headers),
    () => updateBugStatus(headers),
    () => createIssue(headers),
  ];

  const randomOperation = operations[Math.floor(Math.random() * operations.length)];

  try {
    randomOperation();
  } catch (error) {
    console.log(`❌ Write operation error during spike: ${error.message}`);
    errorRate.add(true);
  }

  const duration = new Date().getTime() - startTime;
  spikeThroughput.add(1, duration);
}

/**
 * CREATE BUG COMMENT
 *
 * Simulates users adding comments during high-traffic periods.
 */
function createBugComment(headers) {
  const commentData = {
    content: `Spike test comment - ${new Date().toISOString()}`,
    bugId: Math.floor(Math.random() * 100) + 1,
  };

  const response = http.post(`${BASE_URL}/comments`, JSON.stringify(commentData), { headers });

  const checkResult = check(response, {
    'Comment creation during spike successful': (r) => r.status === 201 || r.status === 200,
    'Comment creation response time acceptable': (r) => r.timings.duration < 3000,
  });

  errorRate.add(!checkResult);
  responseTimeTrend.add(response.timings.duration);
}

/**
 * UPDATE BUG STATUS
 *
 * Simulates bug status updates during traffic spikes.
 */
function updateBugStatus(headers) {
  const bugId = Math.floor(Math.random() * 100) + 1;
  const statusUpdate = {
    status: ['Open', 'In Progress', 'Resolved', 'Closed'][Math.floor(Math.random() * 4)],
  };

  const response = http.put(`${BASE_URL}/bugs/${bugId}/status`, JSON.stringify(statusUpdate), { headers });

  const checkResult = check(response, {
    'Bug status update during spike successful': (r) => r.status === 200,
    'Bug status update response time acceptable': (r) => r.timings.duration < 3000,
  });

  errorRate.add(!checkResult);
  responseTimeTrend.add(response.timings.duration);
}

/**
 * CREATE ISSUE
 *
 * Simulates issue creation during traffic spikes.
 */
function createIssue(headers) {
  const issueData = {
    title: `Spike test issue - ${new Date().toISOString()}`,
    description: 'Issue created during spike testing to evaluate system performance under extreme load.',
    priority: ['low', 'medium', 'high', 'urgent'][Math.floor(Math.random() * 4)],
    projectId: Math.floor(Math.random() * 10) + 1,
  };

  const response = http.post(`${BASE_URL}/issues`, JSON.stringify(issueData), { headers });

  const checkResult = check(response, {
    'Issue creation during spike successful': (r) => r.status === 201 || r.status === 200,
    'Issue creation response time acceptable': (r) => r.timings.duration < 3000,
  });

  errorRate.add(!checkResult);
  responseTimeTrend.add(response.timings.duration);
}

/**
 * TEARDOWN FUNCTION
 *
 * Executed once after all VUs complete.
 * Used for cleanup and final reporting.
 */
export function teardown(data) {
  console.log('🧹 Spike test teardown complete.');
}

/**
 * SPIKE TESTING METHODOLOGY:
 *
 * 1. Sudden Load Changes:
 *    - Immediate jumps from baseline to extreme load
 *    - Tests auto-scaling capabilities
 *    - Evaluates system elasticity
 *
 * 2. Multiple Spike Patterns:
 *    - Different spike magnitudes (200, 300, 400 users)
 *    - Varying spike durations (30s, 45s, 1m)
 *    - Recovery periods between spikes
 *
 * 3. Critical Operation Focus:
 *    - Prioritize operations essential for business continuity
 *    - Test both read and write operations under stress
 *    - Monitor for data consistency issues
 *
 * 4. Recovery Validation:
 *    - Quick load reduction to test system recovery speed
 *    - Monitor if performance returns to normal
 *    - Check for cumulative effects from multiple spikes
 *
 * INTERPRETING SPIKE TEST RESULTS:
 *
 * Key Metrics to Analyze:
 * - Response Time Spikes: How quickly system degrades under sudden load
 * - Recovery Time: How long to return to normal performance
 * - Error Patterns: Types of failures during spikes
 * - Data Integrity: Check for corruption or lost operations
 *
 * Spike Test Success Criteria:
 * - System remains operational during spikes (no crashes)
 * - Recovery within acceptable timeframes
 * - No permanent performance degradation
 * - Data consistency maintained
 * - Graceful error handling for non-critical operations
 *
 * Common Spike Test Findings:
 * - Database connection pool exhaustion
 * - Memory leaks during high load
 * - Queue backlogs in async operations
 * - Auto-scaling delays
 * - Cache invalidation issues
 */