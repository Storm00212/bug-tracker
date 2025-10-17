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
export declare const errorHandler: (err: any, req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=errorHandler.d.ts.map