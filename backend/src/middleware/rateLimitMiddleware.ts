/**
 * RATE LIMITING MIDDLEWARE
 *
 * This middleware implements rate limiting to protect the API from abuse and ensure fair usage.
 * It uses the express-rate-limit package to track and limit requests based on IP addresses.
 *
 * Purpose:
 * - Prevent brute force attacks on authentication endpoints
 * - Limit API usage to prevent server overload
 * - Ensure fair resource allocation among users
 *
 * Configuration:
 * - Window: 15 minutes (900000 ms)
 * - Max requests: 100 per window per IP
 * - Standard rate limit exceeded response
 */

import rateLimit from 'express-rate-limit';

/**
 * General API rate limiter
 *
 * Applies to all routes except authentication endpoints.
 * Allows 100 requests per 15-minute window per IP address.
 */
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes in milliseconds
  max: 100, // Maximum number of requests per window
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Skip rate limiting for successful responses (optional, can be removed if not needed)
  skipSuccessfulRequests: false,
  // Skip rate limiting for failed requests (optional, can be removed if not needed)
  skipFailedRequests: false,
});

/**
 * Authentication rate limiter
 *
 * Stricter limits for authentication endpoints to prevent brute force attacks.
 * Allows 5 requests per 15-minute window per IP address.
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Only 5 login attempts per 15 minutes
  message: {
    error: 'Too many login attempts from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Admin endpoints rate limiter
 *
 * Even stricter limits for administrative operations.
 * Allows 20 requests per 15-minute window per IP address.
 */
export const adminRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Stricter limit for admin operations
  message: {
    error: 'Too many admin requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * RATE LIMITING CONFIGURATION NOTES:
 *
 * 1. Window Size (windowMs):
 *    - 15 minutes is a good balance between security and usability
 *    - Shorter windows (e.g., 1 minute) may be too restrictive for normal users
 *    - Longer windows (e.g., 1 hour) may not provide adequate protection
 *
 * 2. Request Limits:
 *    - General API: 100 requests/15min - suitable for most API usage
 *    - Auth endpoints: 5 requests/15min - prevents brute force attacks
 *    - Admin endpoints: 20 requests/15min - balances security with admin needs
 *
 * 3. Headers:
 *    - standardHeaders: true enables RateLimit-* headers for client awareness
 *    - These headers help clients understand their rate limit status
 *
 * 4. Error Messages:
 *    - Include retry-after information for better user experience
 *    - Messages should be clear but not reveal too much about the system
 *
 * 5. Monitoring:
 *    - Consider logging rate limit hits for analysis
 *    - Monitor for IPs that frequently hit limits
 *
 * 6. Customization:
 *    - Adjust limits based on your application's specific needs
 *    - Consider different limits for different user roles
 *    - Use Redis store for distributed rate limiting in production
 */