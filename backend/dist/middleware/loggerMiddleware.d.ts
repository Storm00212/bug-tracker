/**
 * REQUEST LOGGING MIDDLEWARE
 *
 * Logs all incoming HTTP requests for debugging and monitoring.
 * Provides visibility into application usage and helps with troubleshooting.
 * Runs on every request before route handlers.
 */
import { Request, Response, NextFunction } from "express";
/**
 * Request logging middleware
 *
 * Logs HTTP method, URL, and timestamp for each incoming request.
 * Helps with debugging, monitoring, and understanding application usage.
 *
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function to continue processing
 */
export declare const loggerMiddleware: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=loggerMiddleware.d.ts.map