/**
 * AUTHENTICATION MIDDLEWARE
 *
 * Protects routes by verifying JWT tokens in request headers.
 * Extracts user information from valid tokens and attaches to request.
 * Must be used before any route that requires authentication.
 */

import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

/**
 * Extended Request interface to include authenticated user data
 * TypeScript doesn't know about our custom user property, so we extend the interface
 */
interface AuthenticatedRequest extends Request {
  user?: any; // Contains decoded JWT payload (id, role)
}

/**
 * Authentication middleware function
 *
 * Process: Extract token → Verify JWT → Attach user to request → Continue
 * Protects routes that require user authentication
 *
 * @param req - Express request object (extended with user property)
 * @param res - Express response object
 * @param next - Express next function to continue request processing
 */
export const authMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Step 1: Extract Authorization header from request
    const authHeader = req.headers.authorization;

    // Step 2: Check if Authorization header exists and has correct format
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    // Step 3: Extract JWT token from "Bearer <token>" format
    const token = authHeader.split(" ")[1];

    // Step 4: Get JWT secret from environment variables
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET not configured");
    }

    // Step 5: Verify JWT token and decode payload
    // Payload contains: { id: number, role: string }
    const decoded = (jwt.verify as any)(token, secret!);

    // Step 6: Attach decoded user information to request object
    // This makes user data available in subsequent middleware and controllers
    req.user = decoded;

    // Step 7: Continue to next middleware or route handler
    next();
  } catch (err: any) {
    // Handle JWT verification errors (expired, invalid, malformed tokens)
    console.error("Authentication Error:", err.message);
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};
