import { Request, Response } from "express";
import { ProjectService } from "../services/projectService.js";
import { projectSchema } from "../models/Project.js";

export const addProject = async (req: Request, res: Response) => {
  try {
    const parse = projectSchema.safeParse(req.body);
    if (!parse.success) {
      const errors = parse.error.issues.map((e: any) => e.message).join(", ");
      return res.status(400).json({ message: errors });
    }

    const project = await ProjectService.createProject(req.body);
    res.status(201).json({ message: "Project created successfully", project });
  } catch (err: any) {
    console.error("Project Creation Error:", err.message);
    res.status(500).json({ message: "Server error creating project" });
  }
};

export const listProjects = async (req: Request, res: Response) => {
  try {
    const projects = await ProjectService.getAllProjects();
    res.json({ projects });
  } catch (err: any) {
    console.error("Fetch Projects Error:", err.message);
    res.status(500).json({ message: "Server error fetching projects" });
  }
};
