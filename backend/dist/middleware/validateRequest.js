/**
 * REQUEST VALIDATION MIDDLEWARE
 *
 * Provides reusable request validation using Zod schemas.
 * Can be used with any Zod schema to validate request bodies.
 * Returns detailed validation errors when validation fails.
 */
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
export const validateRequest = (schema) => {
    return (req, res, next) => {
        try {
            // Attempt to validate request body against the schema
            schema.parse(req.body);
            // Validation passed - continue to next middleware/route handler
            next();
        }
        catch (error) {
            // Validation failed - return detailed error information
            return res.status(400).json({
                message: "Validation failed",
                errors: error.issues.map((issue) => issue.message)
            });
        }
    };
};
//# sourceMappingURL=validateRequest.js.map