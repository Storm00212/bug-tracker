import { Request, Response, NextFunction } from "express";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("Error:", err.message);

  if (err.code === "ZOD_ERROR") {
    return res.status(400).json({ message: "Validation error", errors: err.errors });
  }

  if (err.code === "ECONNREFUSED" || err.code === "ETIMEOUT") {
    return res.status(503).json({ message: "Database connection error" });
  }

  res.status(500).json({ message: "Internal server error" });
};