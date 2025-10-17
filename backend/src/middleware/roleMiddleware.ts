import { Request, Response, NextFunction } from "express";

interface AuthenticatedRequest extends Request {
  user?: { id: number; role: string };
}

export const authorizeRoles = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
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
