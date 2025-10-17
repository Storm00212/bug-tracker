/**
 * ROLE-BASED AUTHORIZATION MIDDLEWARE
 *
 * Restricts access to routes based on user roles.
 * Works with authMiddleware to provide fine-grained access control.
 * Supports multiple allowed roles per route.
 */
import { Request, Response, NextFunction } from "express";
/**
 * Extended Request interface for authenticated requests
 * Includes user information from JWT token verification
 */
interface AuthenticatedRequest extends Request {
    user?: {
        id: number;
        role: string;
    };
}
/**
 * Create role-based authorization middleware
 *
 * Factory function that returns middleware checking for specific roles.
 * Use after authMiddleware to ensure user is authenticated.
 *
 * @param roles - Array of allowed role names (e.g., ["Admin", "Developer"])
 * @returns Express middleware function
 */
export declare const authorizeRoles: (...roles: string[]) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export {};
//# sourceMappingURL=roleMiddleware.d.ts.map