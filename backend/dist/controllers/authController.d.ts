/**
 * AUTHENTICATION CONTROLLERS
 *
 * Handles HTTP requests for user authentication operations.
 * Controllers are responsible for:
 * - Input validation using Zod schemas
 * - Calling appropriate service methods
 * - Formatting responses
 * - Error handling and logging
 */
import { Request, Response } from "express";
/**
 * Handle user registration
 *
 * Process: Validate input → Call service → Return response
 * Input validation ensures data integrity before processing
 */
export declare const registerUser: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Handle user login
 *
 * Process: Extract credentials → Call service → Return token
 * Returns JWT token for authenticated requests
 */
export declare const loginUser: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=authController.d.ts.map