import { Request, Response } from "express";
import { createBug, getBugsByProject } from "../repositories/bugRepository.js";
import { bugSchema } from "../models/Bug.js";

export const reportBug = async (req: Request, res: Response) => {
  try {
    const parse = bugSchema.safeParse(req.body);
    if (!parse.success) {
      const errors = parse.error.errors.map(e => e.message).join(", ");
      return res.status(400).json({ message: errors });
    }

    const bug = await createBug(req.body);
    res.status(201).json({ message: "Bug reported successfully", bug });
  } catch (err: any) {
    console.error("Bug Report Error:", err.message);
    res.status(500).json({ message: "Server error reporting bug" });
  }
};

export const getProjectBugs = async (req: Request, res: Response) => {
  try {
    const projectId = Number(req.params.projectId);
    const bugs = await getBugsByProject(projectId);
    res.json({ bugs });
  } catch (err: any) {
    console.error("Get Bugs Error:", err.message);
    res.status(500).json({ message: "Server error fetching bugs" });
  }
};
