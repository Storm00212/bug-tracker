import { Request, Response } from "express";
import { BugService } from "../services/bugService.js";
import { bugSchema } from "../models/Bug.js";

export const reportBug = async (req: Request, res: Response) => {
  try {
    const parse = bugSchema.safeParse(req.body);
    if (!parse.success) {
      const errors = parse.error.issues.map((e: any) => e.message).join(", ");
      return res.status(400).json({ message: errors });
    }

    const bug = await BugService.createBug(req.body);
    res.status(201).json({ message: "Bug reported successfully", bug });
  } catch (err: any) {
    console.error("Bug Report Error:", err.message);
    res.status(500).json({ message: "Server error reporting bug" });
  }
};

export const getProjectBugs = async (req: Request, res: Response) => {
  try {
    const projectId = Number(req.params.projectId);
    const bugs = await BugService.getBugsByProject(projectId);
    res.json({ bugs });
  } catch (err: any) {
    console.error("Get Bugs Error:", err.message);
    res.status(500).json({ message: "Server error fetching bugs" });
  }
};
