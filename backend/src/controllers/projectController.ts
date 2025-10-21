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
 * Handle fetching a single project by ID
 *
 * Process: Extract project ID → Get project from service → Return result
 * All authenticated users can view project details
 */
export const getProject = async (req: Request, res: Response) => {
  try {
    // Step 1: Extract and convert project ID from URL parameters
    const projectId = Number(req.params.id);

    // Step 2: Call service to get the project
    const project = await ProjectService.getProjectById(projectId);

    // Step 3: Check if project exists
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Step 4: Return project data
    res.json({ project });
  } catch (err: any) {
    // Log error and return generic server error
    console.error("Get Project Error:", err.message);
    res.status(500).json({ message: "Server error fetching project" });
  }
};

/**
 * Handle project update
 *
 * Process: Validate input → Update project → Return result
 * Only Admin users can update projects
 */
export const updateProject = async (req: Request, res: Response) => {
  try {
    // Step 1: Extract project ID from URL parameters
    const projectId = Number(req.params.id);

    // Step 2: Validate update data using partial schema
    const updateData = req.body;

    // Step 3: Call service to update the project
    const project = await ProjectService.updateProject(projectId, updateData);

    // Step 4: Return success response with updated project
    res.json({ message: "Project updated successfully", project });
  } catch (err: any) {
    // Log error and return generic server error
    console.error("Update Project Error:", err.message);
    res.status(500).json({ message: "Server error updating project" });
  }
};

/**
 * Handle project deletion
 *
 * Process: Delete project → Return result
 * Only Admin users can delete projects
 */
export const deleteProject = async (req: Request, res: Response) => {
  try {
    // Step 1: Extract project ID from URL parameters
    const projectId = Number(req.params.id);

    // Step 2: Call service to delete the project
    const affectedRows = await ProjectService.deleteProject(projectId);

    // Step 3: Check if project was found and deleted
    if (affectedRows === 0) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Step 4: Return success response
    res.json({ message: "Project deleted successfully" });
  } catch (err: any) {
    // Log error and return generic server error
    console.error("Delete Project Error:", err.message);
    res.status(500).json({ message: "Server error deleting project" });
  }
};

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
