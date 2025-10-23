/**
 * STRESS TESTING SCRIPT
 *
 * This k6 script performs stress testing on the Bug Tracking System API.
 * Stress testing determines the system's breaking point by gradually increasing
 * load until performance degrades significantly or the system fails.
 *
 * Test Characteristics:
 * - Duration: 10 minutes
 * - Virtual Users: Ramp from 10 to 200 users
 * - Continuous Load Increase: Gradual ramp-up to find limits
 * - Breaking Point Detection: Identify when system starts failing
 *
 * Performance Targets:
 * - Find maximum sustainable load
 * - Identify performance degradation points
 * - Determine system failure thresholds
 * - Monitor resource utilization patterns
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics for detailed monitoring
const errorRate = new Rate('errors');
const responseTimeTrend = new Trend('response_time');
const throughputTrend = new Trend('throughput');

// Test configuration
export const options = {
  stages: [
    // Start with normal load (10 users)
    { duration: '1m', target: 10 },

    // Gradually increase to moderate load (50 users)
    { duration: '2m', target: 50 },

    // Increase to high load (100 users)
    { duration: '2m', target: 100 },

    // Stress test - push to very high load (200 users)
    { duration: '3m', target: 200 },

    // Recovery phase - reduce load to see if system recovers
    { duration: '2m', target: 50 },
  ],

  thresholds: {
    // More lenient thresholds for stress testing
    // We expect some degradation under extreme load
    http_req_duration: ['p(95)<2000'], // Allow up to 2s under stress

    // Allow higher error rate during stress testing
    http_req_failed: ['rate<0.05'], // Up to 5% errors acceptable

    // Custom error rate metric
    errors: ['rate<0.05'],
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
  console.log('🔧 Setting up stress test...');

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
 * Under stress, we focus on core functionality that would be most impacted.
 */
export default function (data) {
  // Use token from setup
  const token = data.authToken;

  // Set authorization header for authenticated requests
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  // Under stress, focus on critical operations
  const randomAction = Math.random();

  if (randomAction < 0.4) {
    // 40% - Get bugs list (most common operation)
    listBugs(headers);
  } else if (randomAction < 0.7) {
    // 30% - Get projects (frequent navigation)
    listProjects(headers);
  } else {
    // 30% - Create operations (stress write performance)
    createBug(headers);
  }

  // Shorter think time under stress to increase load
  sleep(Math.random() * 1 + 0.5);
}

/**
 * LIST BUGS (HIGH FREQUENCY)
 *
 * Most common operation - getting bug lists.
 * Critical for performance under stress.
 */
function listBugs(headers) {
  const startTime = new Date().getTime();

  const response = http.get(`${BASE_URL}/bugs`, { headers });

  const duration = new Date().getTime() - startTime;
  throughputTrend.add(1, duration); // Track throughput

  const checkResult = check(response, {
    'Bugs list successful': (r) => r.status === 200,
    'Bugs response time acceptable': (r) => r.timings.duration < 1500, // More lenient under stress
    'Response contains data': (r) => r.body.length > 0,
  });

  errorRate.add(!checkResult);
  responseTimeTrend.add(response.timings.duration);

  // Log slow responses for analysis
  if (response.timings.duration > 1000) {
    console.log(`🐌 Slow bug list response: ${response.timings.duration}ms`);
  }
}

/**
 * LIST PROJECTS (MEDIUM FREQUENCY)
 *
 * Project browsing operation.
 * Tests database read performance under load.
 */
function listProjects(headers) {
  const startTime = new Date().getTime();

  const response = http.get(`${BASE_URL}/projects`, { headers });

  const duration = new Date().getTime() - startTime;
  throughputTrend.add(1, duration);

  const checkResult = check(response, {
    'Projects list successful': (r) => r.status === 200,
    'Projects response time acceptable': (r) => r.timings.duration < 1000,
    'Response contains projects': (r) => {
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
 * CREATE BUG (WRITE OPERATION)
 *
 * Tests write performance and database insert capacity under stress.
 * More complex operation that stresses multiple system components.
 */
function createBug(headers) {
  const startTime = new Date().getTime();

  // Generate test data
  const bugData = {
    title: `Stress test bug from VU ${__VU} at ${new Date().toISOString()}`,
    description: `This bug was created during stress testing to evaluate system performance under high load. Timestamp: ${Date.now()}`,
    severity: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)],
    priority: ['low', 'medium', 'high', 'urgent'][Math.floor(Math.random() * 4)],
    status: 'Open',
    projectId: Math.floor(Math.random() * 10) + 1, // Random project ID
    reporterId: Math.floor(Math.random() * 50) + 1, // Random user ID
  };

  const response = http.post(`${BASE_URL}/bugs`, JSON.stringify(bugData), { headers });

  const duration = new Date().getTime() - startTime;
  throughputTrend.add(1, duration);

  const checkResult = check(response, {
    'Bug creation successful': (r) => r.status === 201 || r.status === 200,
    'Bug creation response time acceptable': (r) => r.timings.duration < 2000,
  });

  errorRate.add(!checkResult);
  responseTimeTrend.add(response.timings.duration);

  // Log failures for analysis
  if (!checkResult) {
    console.log(`❌ Bug creation failed: ${response.status} - ${response.body}`);
  }
}

/**
 * TEARDOWN FUNCTION
 *
 * Executed once after all VUs complete.
 * Used for cleanup and final reporting.
 */
export function teardown(data) {
  console.log('🧹 Stress test teardown complete.');
}

/**
 * STRESS TESTING METHODOLOGY:
 *
 * 1. Gradual Load Increase:
 *    - Start with normal load to establish baseline
 *    - Gradually increase to find breaking points
 *    - Include recovery phase to test system resilience
 *
 * 2. Breaking Point Detection:
 *    - Monitor response times for exponential degradation
 *    - Track error rate increases
 *    - Identify throughput limits
 *    - Watch for system failures (crashes, timeouts)
 *
 * 3. System Component Stress:
 *    - Database read/write operations
 *    - API request processing
 *    - Memory and CPU utilization
 *    - Network throughput
 *
 * 4. Recovery Testing:
 *    - Load reduction to test system recovery
 *    - Monitor if performance returns to normal
 *    - Check for memory leaks or resource exhaustion
 *
 * INTERPRETING STRESS TEST RESULTS:
 *
 * Key Metrics to Analyze:
 * - Response Time Trends: Look for exponential increases
 * - Error Rate: Point where errors start occurring frequently
 * - Throughput: Maximum sustainable request rate
 * - Resource Utilization: CPU, memory, database connections
 *
 * Breaking Point Indicators:
 * - Response times > 2 seconds consistently
 * - Error rate > 5%
 * - System becomes unresponsive
 * - Database connection pool exhaustion
 *
 * Post-Stress Analysis:
 * - Check application logs for errors
 * - Monitor database performance
 * - Review system resource usage
 * - Identify bottlenecks and optimization opportunities
 */