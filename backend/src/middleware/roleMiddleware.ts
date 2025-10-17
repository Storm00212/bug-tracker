import { Request, Response, NextFunction } from "express";

interface AuthenticatedRequest extends Request {
  user?: { id: number; role: string };
}

export const authorizeRoles = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized: no user context" });
    }

    // Convert roles to title case for comparison
    const userRole = req.user.role.charAt(0).toUpperCase() + req.user.role.slice(1).toLowerCase();
    const normalizedRoles = roles.map(role => role.charAt(0).toUpperCase() + role.slice(1).toLowerCase());

    if (!normalizedRoles.includes(userRole)) {
      return res.status(403).json({
        message: `Access denied. Requires one of: ${roles.join(", ")}`,
      });
    }

    next();
  };
};
