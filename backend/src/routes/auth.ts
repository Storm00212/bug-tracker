/**
 * AUTHENTICATION ROUTES
 *
 * Handles user authentication operations including registration and login.
 * These routes are public (no authentication required) and provide JWT tokens
 * for accessing protected routes throughout the application.
 */

import { Router } from "express";
import { registerUser, loginUser } from "../controllers/authController.js";
import { authRateLimiter } from "../middleware/rateLimitMiddleware.js";

// Create Express router instance for authentication endpoints
const router = Router();

/**
 * POST /auth/register
 * Register a new user account
 *
 * Body: { username, email, password, role }
 * Returns: { message, user }
 * Public endpoint - no authentication required
 * Rate limited: 5 requests per 15 minutes per IP
 */
router.post("/register", authRateLimiter, registerUser);

/**
 * POST /auth/login
 * Authenticate user and return JWT token
 *
 * Body: { email, password }
 * Returns: { message, token, user }
 * Public endpoint - no authentication required
 * Rate limited: 5 requests per 15 minutes per IP
 */
router.post("/login", authRateLimiter, loginUser);

// Export router to be mounted in main application
export default router;