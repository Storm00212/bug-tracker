/**
 * AUTHENTICATION MIDDLEWARE
 *
 * Protects routes by verifying JWT tokens in request headers.
 * Extracts user information from valid tokens and attaches to request.
 * Must be used before any route that requires authentication.
 */
import { Request, Response, NextFunction } from "express";
/**
 * Extended Request interface to include authenticated user data
 * TypeScript doesn't know about our custom user property, so we extend the interface
 */
interface AuthenticatedRequest extends Request {
    user?: any;
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
export declare const authMiddleware: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export {};
//# sourceMappingURL=authMiddleware.d.ts.map