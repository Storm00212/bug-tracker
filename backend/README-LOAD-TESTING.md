# Load Testing Guide for Bug Tracking System

This document provides comprehensive information about the load testing setup, configuration, and execution for the Bug Tracking System backend.

## Overview

The system includes three types of performance tests using k6:
- **Load Testing**: Simulates normal production traffic to ensure stable performance
- **Stress Testing**: Finds system breaking points by gradually increasing load
- **Spike Testing**: Tests sudden traffic spikes and system recovery

## Prerequisites

### System Requirements
- Node.js 18+ and pnpm
- k6 installed (automatically included as dev dependency)
- Running backend server
- Test database with sample data

### Environment Setup
1. Ensure the backend server is running:
   ```bash
   cd backend
   pnpm run dev
   ```

2. Verify the server is accessible at `http://localhost:3000`

3. Ensure test user credentials exist in the database:
   - Email: `test@example.com`
   - Password: `testpassword123`

## Test Scripts

### Load Testing (`tests/load-test.js`)
**Purpose**: Validate system performance under normal production load.

**Configuration**:
- Duration: 5 minutes
- Virtual Users: 10 → 50 → 50 → 0 (gradual ramp)
- Target Response Time: < 500ms (95th percentile)
- Target Error Rate: < 1%

**Execution**:
```bash
pnpm run test:load
```

**What it tests**:
- User profile access (30% of requests)
- Project listing (30% of requests)
- Bug listing (20% of requests)
- Comment creation (20% of requests)

### Stress Testing (`tests/stress-test.js`)
**Purpose**: Determine system limits and breaking points.

**Configuration**:
- Duration: 10 minutes
- Virtual Users: 10 → 50 → 100 → 200 → 50 (stress ramp)
- Target Response Time: < 2000ms (95th percentile, lenient)
- Target Error Rate: < 5% (higher tolerance for stress)

**Execution**:
```bash
pnpm run test:stress
```

**What it tests**:
- Bug listing under high load (40% of requests)
- Project browsing (30% of requests)
- Bug creation (30% of requests)

### Spike Testing (`tests/spike-test.js`)
**Purpose**: Test system behavior during sudden traffic spikes.

**Configuration**:
- Duration: 8 minutes
- Virtual Users: Multiple spikes (20→200→20→300→20→400→20→250)
- Target Response Time: < 3000ms (95th percentile, very lenient)
- Target Error Rate: < 10% (highest tolerance for spikes)

**Execution**:
```bash
pnpm run test:spike
```

**What it tests**:
- Critical data access during spikes (50% of requests)
- Write operations under extreme load (50% of requests)

## Running All Tests

Execute all performance tests sequentially:
```bash
pnpm run test:performance
```

This runs load testing, then stress testing, then spike testing.

## Customizing Tests

### Environment Variables
Override default settings using environment variables:

```bash
# Set custom base URL
BASE_URL=http://staging.example.com pnpm run test:load

# Combine with other environment variables
BASE_URL=http://staging.example.com CUSTOM_SETTING=value pnpm run test:stress
```

### Modifying Test Parameters
Edit the test files to adjust:
- Virtual user counts
- Test duration
- Request distributions
- Performance thresholds
- Target endpoints

## Interpreting Results

### Key Metrics to Monitor

#### Response Times
- **p95**: 95th percentile response time
- **p99**: 99th percentile response time
- **avg**: Average response time

#### Error Rates
- **http_req_failed**: Rate of failed requests
- **errors**: Custom error rate metric

#### Throughput
- **http_reqs**: Total requests per second
- **Custom throughput metrics**: Request processing rates

### Load Test Results Interpretation
- **Success**: p95 < 500ms, error rate < 1%
- **Warning**: p95 500-1000ms, error rate 1-5%
- **Failure**: p95 > 1000ms, error rate > 5%

### Stress Test Results Interpretation
- **Breaking Point**: Point where response times exceed 2000ms consistently
- **Maximum Capacity**: Highest load before error rate exceeds 5%
- **Recovery**: How quickly performance returns to normal after load reduction

### Spike Test Results Interpretation
- **Spike Handling**: System stability during sudden load increases
- **Recovery Time**: Time to return to normal performance after spikes
- **Data Integrity**: No corruption or lost operations during spikes

## Troubleshooting

### Common Issues

#### Authentication Failures
- Ensure test user exists in database
- Verify credentials in test scripts
- Check JWT token generation

#### Connection Errors
- Verify backend server is running
- Check BASE_URL configuration
- Ensure firewall allows connections

#### Database Issues
- Ensure sufficient database connections
- Check database server capacity
- Monitor for connection pool exhaustion

#### Rate Limiting
- Tests may trigger rate limiting (expected behavior)
- Monitor rate limit headers in responses
- Adjust rate limits for testing if needed

### Performance Optimization Tips

#### Database Tuning
- Index frequently queried columns
- Optimize complex queries
- Monitor slow query logs

#### Application Optimization
- Implement caching for read-heavy endpoints
- Optimize middleware order
- Use connection pooling

#### Infrastructure Scaling
- Implement auto-scaling based on load
- Use load balancers for distribution
- Monitor resource utilization

## Best Practices

### Test Data Management
- Use realistic test data volumes
- Ensure data consistency across test runs
- Clean up test data after execution

### Monitoring Integration
- Integrate with application monitoring tools
- Monitor server resources during tests
- Log performance metrics for analysis

### Continuous Integration
- Include performance tests in CI/CD pipeline
- Set performance regression alerts
- Automate test execution on deployments

## Rate Limiting Configuration

The system includes rate limiting to prevent abuse:

### General API Limits
- **Window**: 15 minutes
- **Max Requests**: 100 per IP
- **Applies to**: All routes except auth

### Authentication Limits
- **Window**: 15 minutes
- **Max Requests**: 5 per IP
- **Applies to**: Login and registration endpoints

### Admin Limits
- **Window**: 15 minutes
- **Max Requests**: 20 per IP
- **Applies to**: Admin-only endpoints

Rate limiting is implemented using `express-rate-limit` and includes:
- Standard RateLimit headers in responses
- Clear error messages for exceeded limits
- Configurable limits per endpoint type

## Security Considerations

### Test Credentials
- Use dedicated test accounts
- Never use production credentials
- Rotate test credentials regularly

### Data Privacy
- Avoid testing with real user data
- Use anonymized or synthetic data
- Ensure test data doesn't contain sensitive information

### Network Security
- Run tests in isolated networks when possible
- Monitor for unauthorized access attempts
- Use HTTPS for production testing

## Advanced Configuration

### Custom Metrics
Add custom metrics in test scripts:
```javascript
import { Trend, Rate } from 'k6/metrics';

const customTrend = new Trend('custom_operation_time');
const customRate = new Rate('custom_success_rate');
```

### Thresholds Configuration
Define custom thresholds:
```javascript
export const options = {
  thresholds: {
    'custom_operation_time': ['p(95)<1000'],
    'custom_success_rate': ['rate>0.95'],
  },
};
```

### Scenario-Based Testing
Create complex test scenarios:
```javascript
export const options = {
  scenarios: {
    'normal_load': {
      executor: 'ramping-vus',
      stages: [...],
    },
    'spike_load': {
      executor: 'constant-vus',
      vus: 100,
      duration: '30s',
    },
  },
};
```

## Support and Maintenance

### Updating Tests
- Review and update test scripts with API changes
- Adjust thresholds based on performance improvements
- Update documentation with new features

### Monitoring Changes
- Track performance trends over time
- Set up alerts for performance regressions
- Document performance baselines

### Team Collaboration
- Share test results with development team
- Include performance considerations in code reviews
- Document performance requirements for new features