/**
 * PROJECT CONTROLLERS
 *
 * Handles HTTP requests for project management operations.
 * Controllers validate input, call services, and format responses.
 * Projects are containers for organizing and managing bug reports.
 */

import { Request, Response } from "express";
import { ProjectService } from "../services/projectService.js";
import { projectSchema } from "../models/Project.js";

/**
 * Handle project creation
 *
 * Process: Validate input → Create project → Return result
 * Only Admin users can create projects
 */
export const addProject = async (req: Request, res: Response) => {
  try {
    // Step 1: Validate project data using Zod schema
    const parse = projectSchema.safeParse(req.body);
    if (!parse.success) {
      // Return validation errors if input is invalid
      const errors = parse.error.issues.map((e: any) => e.message).join(", ");
      return res.status(400).json({ message: errors });
    }

    // Step 2: Call service to create the project
    const project = await ProjectService.createProject(req.body);

    // Step 3: Return success response with created project
    res.status(201).json({ message: "Project created successfully", project });
  } catch (err: any) {
    // Log error and return generic server error
    console.error("Project Creation Error:", err.message);
    res.status(500).json({ message: "Server error creating project" });
  }
};

/**
 * Handle fetching all projects
 *
 * Process: Get projects from service → Return list
 * All authenticated users can view projects
 */
export const listProjects = async (req: Request, res: Response) => {
  try {
    // Step 1: Call service to get all projects
    const projects = await ProjectService.getAllProjects();

    // Step 2: Return projects list
    res.json({ projects });
  } catch (err: any) {
    // Log error and return generic server error
    console.error("Fetch Projects Error:", err.message);
    res.status(500).json({ message: "Server error fetching projects" });
  }
};
