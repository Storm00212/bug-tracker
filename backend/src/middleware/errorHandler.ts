/**
 * GLOBAL ERROR HANDLING MIDDLEWARE
 *
 * Catches and handles all errors that occur during request processing.
 * Provides consistent error responses and logging.
 * Must be the last middleware in the Express app (after all routes).
 */

import { Request, Response, NextFunction } from "express";

/**
 * Global error handler middleware
 *
 * Processes errors from anywhere in the application and returns appropriate responses.
 * Different error types get different HTTP status codes and messages.
 *
 * @param err - Error object thrown from anywhere in the app
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function (not used in error handlers)
 */
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log error for debugging and monitoring
  console.error("Error:", err.message);

  // Handle Zod validation errors (data validation failures)
  if (err.code === "ZOD_ERROR") {
    return res.status(400).json({
      message: "Validation error",
      errors: err.errors // Array of validation error details
    });
  }

  // Handle database connection errors
  if (err.code === "ECONNREFUSED" || err.code === "ETIMEOUT") {
    return res.status(503).json({ message: "Database connection error" });
  }

  // Default: Generic server error for unexpected issues
  // Don't expose internal error details to clients for security
  res.status(500).json({ message: "Internal server error" });
};