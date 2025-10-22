/**
 * ISSUE CONTROLLERS
 *
 * Handles HTTP requests for issue tracking operations.
 * Controllers manage issue reporting, status updates, and queries.
 * Issues are the core entities that track work items.
 */

import { Request, Response } from "express";
import { IssueService } from "../services/issueService.js";
import { issueSchema } from "../models/Issue.js";
import { CommentService } from "../services/commentService.js";

/**
 * Handle fetching all issues with optional filtering
 *
 * Process: Extract filters → Get issues from service → Return list
 * All authenticated users can view issues with appropriate filtering
 */
export const getAllIssues = async (req: Request, res: Response) => {
  try {
    // Step 1: Extract query parameters for filtering
    const filters: {
      status?: string;
      priority?: string;
      type?: string;
      reporterId?: number;
      assigneeId?: number;
      projectId?: number;
      labels?: string[];
      epicId?: number;
      parentId?: number;
    } = {};

    if (req.query.status) filters.status = req.query.status as string;
    if (req.query.priority) filters.priority = req.query.priority as string;
    if (req.query.type) filters.type = req.query.type as string;
    if (req.query.reporterId) filters.reporterId = Number(req.query.reporterId);
    if (req.query.assigneeId) filters.assigneeId = Number(req.query.assigneeId);
    if (req.query.projectId) filters.projectId = Number(req.query.projectId);
    if (req.query.epicId) filters.epicId = Number(req.query.epicId);
    if (req.query.parentId) filters.parentId = Number(req.query.parentId);
    if (req.query.labels) filters.labels = (req.query.labels as string).split(',');

    // Step 2: Call service to get filtered issues
    const issues = await IssueService.getAllIssues(filters);

    // Step 3: Return issues list
    res.json({ issues });
  } catch (err: any) {
    // Log error and return generic server error
    console.error("Get All Issues Error:", err.message);
    res.status(500).json({ message: "Server error fetching issues" });
  }
};

/**
 * Handle fetching a single issue by ID
 *
 * Process: Extract issue ID → Get issue from service → Get comments → Return result
 * All authenticated users can view issue details
 */
export const getIssue = async (req: Request, res: Response) => {
  try {
    // Step 1: Extract and convert issue ID from URL parameters
    const issueId = Number(req.params.id);

    // Step 2: Call service to get the issue
    const issue = await IssueService.getIssueById(issueId);

    // Step 3: Check if issue exists
    if (!issue) {
      return res.status(404).json({ message: "Issue not found" });
    }

    // Step 4: Get comments for this issue
    const comments = await CommentService.getCommentsByBug(issueId);

    // Step 5: Return issue data with comments
    res.json({ issue, comments });
  } catch (err: any) {
    // Log error and return generic server error
    console.error("Get Issue Error:", err.message);
    res.status(500).json({ message: "Server error fetching issue" });
  }
};

/**
 * Handle issue update
 *
 * Process: Validate input → Update issue → Return result
 * Users with appropriate roles can update issues
 */
export const updateIssue = async (req: Request, res: Response) => {
  try {
    // Step 1: Extract issue ID from URL parameters
    const issueId = Number(req.params.id);

    // Step 2: Extract update data from request body
    const updateData = req.body;

    // Step 3: Call service to update the issue
    const issue = await IssueService.updateIssue(issueId, updateData);

    // Step 4: Return success response with updated issue
    res.json({ message: "Issue updated successfully", issue });
  } catch (err: any) {
    // Log error and return generic server error
    console.error("Update Issue Error:", err.message);
    res.status(500).json({ message: "Server error updating issue" });
  }
};

/**
 * Handle issue deletion
 *
 * Process: Delete issue → Return result
 * Only users with appropriate permissions can delete issues
 */
export const deleteIssue = async (req: Request, res: Response) => {
  try {
    // Step 1: Extract issue ID from URL parameters
    const issueId = Number(req.params.id);

    // Step 2: Call service to delete the issue
    const affectedRows = await IssueService.deleteIssue(issueId);

    // Step 3: Check if issue was found and deleted
    if (affectedRows === 0) {
      return res.status(404).json({ message: "Issue not found" });
    }

    // Step 4: Return success response
    res.json({ message: "Issue deleted successfully" });
  } catch (err: any) {
    // Log error and return generic server error
    console.error("Delete Issue Error:", err.message);
    res.status(500).json({ message: "Server error deleting issue" });
  }
};

/**
 * Handle issue creation
 *
 * Process: Validate input → Create issue → Return result
 * Any authenticated user can create issues
 */
export const createIssue = async (req: Request, res: Response) => {
  try {
    // Step 1: Validate issue data using Zod schema
    const parse = issueSchema.safeParse(req.body);
    if (!parse.success) {
      // Return validation errors if input is invalid
      const errors = parse.error.issues.map((e: any) => e.message).join(", ");
      return res.status(400).json({ message: errors });
    }

    // Step 2: Call service to create the issue
    const issue = await IssueService.createIssue(req.body);

    // Step 3: Return success response with created issue
    res.status(201).json({ message: "Issue created successfully", issue });
  } catch (err: any) {
    // Log error and return generic server error
    console.error("Issue Creation Error:", err.message);
    res.status(500).json({ message: "Server error creating issue" });
  }
};

/**
 * Handle fetching issues for a specific project
 *
 * Process: Extract project ID → Get issues from service → Return list
 * All authenticated users can view issues in projects they have access to
 */
export const getProjectIssues = async (req: Request, res: Response) => {
  try {
    // Step 1: Extract and convert project ID from URL parameters
    const projectId = Number(req.params.projectId);

    // Step 2: Call service to get issues for this project
    const issues = await IssueService.getIssuesByProject(projectId);

    // Step 3: Return issues list
    res.json({ issues });
  } catch (err: any) {
    // Log error and return generic server error
    console.error("Get Project Issues Error:", err.message);
    res.status(500).json({ message: "Server error fetching project issues" });
  }
};

/**
 * Handle fetching issues by epic
 */
export const getEpicIssues = async (req: Request, res: Response) => {
  try {
    const epicId = Number(req.params.epicId);
    const issues = await IssueService.getIssuesByEpic(epicId);
    res.json({ issues });
  } catch (err: any) {
    console.error("Get Epic Issues Error:", err.message);
    res.status(500).json({ message: "Server error fetching epic issues" });
  }
};

/**
 * Handle fetching subtasks for a parent issue
 */
export const getSubtasks = async (req: Request, res: Response) => {
  try {
    const parentId = Number(req.params.parentId);
    const issues = await IssueService.getSubtasks(parentId);
    res.json({ issues });
  } catch (err: any) {
    console.error("Get Subtasks Error:", err.message);
    res.status(500).json({ message: "Server error fetching subtasks" });
  }
};