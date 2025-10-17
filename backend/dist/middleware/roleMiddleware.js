export const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized: no user context" });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: `Access denied. Requires one of: ${roles.join(", ")}`,
            });
        }
        next();
    };
};
//# sourceMappingURL=roleMiddleware.js.map