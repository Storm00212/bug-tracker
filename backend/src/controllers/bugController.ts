/**
 * BUG CONTROLLERS
 *
 * Handles HTTP requests for bug tracking operations.
 * Controllers manage bug reporting, status updates, and queries.
 * Bugs are the core entities that track software issues.
 */

import { Request, Response } from "express";
import { BugService } from "../services/bugService.js";
import { bugSchema } from "../models/Bug.js";
import { CommentService } from "../services/commentService.js";

/**
 * Handle fetching all bugs with optional filtering
 *
 * Process: Extract filters → Get bugs from service → Return list
 * All authenticated users can view bugs with appropriate filtering
 */
export const getAllBugs = async (req: Request, res: Response) => {
  try {
    // Step 1: Extract query parameters for filtering
    const filters: {
      status?: string;
      severity?: string;
      reporterId?: number;
      developerId?: number;
    } = {};

    if (req.query.status) filters.status = req.query.status as string;
    if (req.query.severity) filters.severity = req.query.severity as string;
    if (req.query.reporterId) filters.reporterId = Number(req.query.reporterId);
    if (req.query.developerId) filters.developerId = Number(req.query.developerId);

    // Step 2: Call service to get filtered bugs
    const bugs = await BugService.getAllBugs(filters);

    // Step 3: Return bugs list
    res.json({ bugs });
  } catch (err: any) {
    // Log error and return generic server error
    console.error("Get All Bugs Error:", err.message);
    res.status(500).json({ message: "Server error fetching bugs" });
  }
};

/**
 * Handle fetching a single bug by ID
 *
 * Process: Extract bug ID → Get bug from service → Get comments → Return result
 * All authenticated users can view bug details
 */
export const getBug = async (req: Request, res: Response) => {
  try {
    // Step 1: Extract and convert bug ID from URL parameters
    const bugId = Number(req.params.id);

    // Step 2: Call service to get the bug
    const bug = await BugService.getBugById(bugId);

    // Step 3: Check if bug exists
    if (!bug) {
      return res.status(404).json({ message: "Bug not found" });
    }

    // Step 4: Get comments for this bug
    const comments = await CommentService.getCommentsByBug(bugId);

    // Step 5: Return bug data with comments
    res.json({ bug, comments });
  } catch (err: any) {
    // Log error and return generic server error
    console.error("Get Bug Error:", err.message);
    res.status(500).json({ message: "Server error fetching bug" });
  }
};

/**
 * Handle bug update
 *
 * Process: Validate input → Update bug → Return result
 * Developers and Admins can update bugs
 */
export const updateBug = async (req: Request, res: Response) => {
  try {
    // Step 1: Extract bug ID from URL parameters
    const bugId = Number(req.params.id);

    // Step 2: Extract update data from request body
    const updateData = req.body;

    // Step 3: Call service to update the bug
    const bug = await BugService.updateBug(bugId, updateData);

    // Step 4: Return success response with updated bug
    res.json({ message: "Bug updated successfully", bug });
  } catch (err: any) {
    // Log error and return generic server error
    console.error("Update Bug Error:", err.message);
    res.status(500).json({ message: "Server error updating bug" });
  }
};

/**
 * Handle bug deletion
 *
 * Process: Delete bug → Return result
 * Only Admin users can delete bugs
 */
export const deleteBug = async (req: Request, res: Response) => {
  try {
    // Step 1: Extract bug ID from URL parameters
    const bugId = Number(req.params.id);

    // Step 2: Call service to delete the bug
    const affectedRows = await BugService.deleteBug(bugId);

    // Step 3: Check if bug was found and deleted
    if (affectedRows === 0) {
      return res.status(404).json({ message: "Bug not found" });
    }

    // Step 4: Return success response
    res.json({ message: "Bug deleted successfully" });
  } catch (err: any) {
    // Log error and return generic server error
    console.error("Delete Bug Error:", err.message);
    res.status(500).json({ message: "Server error deleting bug" });
  }
};

/**
 * Handle bug reporting
 *
 * Process: Validate input → Create bug → Return result
 * Any authenticated user can report bugs
 */
export const reportBug = async (req: Request, res: Response) => {
  try {
    // Step 1: Validate bug data using Zod schema
    const parse = bugSchema.safeParse(req.body);
    if (!parse.success) {
      // Return validation errors if input is invalid
      const errors = parse.error.issues.map((e: any) => e.message).join(", ");
      return res.status(400).json({ message: errors });
    }

    // Step 2: Call service to create the bug
    const bug = await BugService.createBug(req.body);

    // Step 3: Return success response with created bug
    res.status(201).json({ message: "Bug reported successfully", bug });
  } catch (err: any) {
    // Log error and return generic server error
    console.error("Bug Report Error:", err.message);
    res.status(500).json({ message: "Server error reporting bug" });
  }
};

/**
 * Handle fetching bugs for a specific project
 *
 * Process: Extract project ID → Get bugs from service → Return list
 * All authenticated users can view bugs in projects they have access to
 */
export const getProjectBugs = async (req: Request, res: Response) => {
  try {
    // Step 1: Extract and convert project ID from URL parameters
    const projectId = Number(req.params.projectId);

    // Step 2: Call service to get bugs for this project
    const bugs = await BugService.getBugsByProject(projectId);

    // Step 3: Return bugs list
    res.json({ bugs });
  } catch (err: any) {
    // Log error and return generic server error
    console.error("Get Bugs Error:", err.message);
    res.status(500).json({ message: "Server error fetching bugs" });
  }
};
