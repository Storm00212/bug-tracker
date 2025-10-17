/**
 * REQUEST VALIDATION MIDDLEWARE
 *
 * Provides reusable request validation using Zod schemas.
 * Can be used with any Zod schema to validate request bodies.
 * Returns detailed validation errors when validation fails.
 */
import { Request, Response, NextFunction } from "express";
import { z } from "zod";
/**
 * Create request validation middleware for a specific Zod schema
 *
 * Factory function that returns middleware to validate request bodies.
 * Use this to ensure incoming data matches expected structure.
 *
 * @param schema - Zod schema to validate request body against
 * @returns Express middleware function
 *
 * @example
 * const userSchema = z.object({ name: z.string(), email: z.string().email() });
 * app.post('/users', validateRequest(userSchema), createUser);
 */
export declare const validateRequest: (schema: z.ZodSchema) => (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=validateRequest.d.ts.map