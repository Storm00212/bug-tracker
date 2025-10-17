/**
 * ROLE-BASED AUTHORIZATION MIDDLEWARE
 *
 * Restricts access to routes based on user roles.
 * Works with authMiddleware to provide fine-grained access control.
 * Supports multiple allowed roles per route.
 */
/**
 * Create role-based authorization middleware
 *
 * Factory function that returns middleware checking for specific roles.
 * Use after authMiddleware to ensure user is authenticated.
 *
 * @param roles - Array of allowed role names (e.g., ["Admin", "Developer"])
 * @returns Express middleware function
 */
export const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        // Step 1: Check if user is authenticated (authMiddleware should run first)
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized: no user context" });
        }
        // Step 2: Normalize user role to title case for consistent comparison
        // Handles case-insensitive role matching (e.g., "admin" → "Admin")
        const userRole = req.user.role.charAt(0).toUpperCase() + req.user.role.slice(1).toLowerCase();
        // Step 3: Normalize allowed roles to title case
        const normalizedRoles = roles.map(role => role.charAt(0).toUpperCase() + role.slice(1).toLowerCase());
        // Step 4: Check if user's role is in the allowed roles list
        if (!normalizedRoles.includes(userRole)) {
            return res.status(403).json({
                message: `Access denied. Requires one of: ${roles.join(", ")}`,
            });
        }
        // Step 5: User has required role, continue to next middleware/route
        next();
    };
};
//# sourceMappingURL=roleMiddleware.js.map