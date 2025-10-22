/**
 * ISSUE TRACKING ROUTES
 *
 * Handles all issue-related operations including creation, updating, querying,
 * and managing issue lifecycles in the issue tracking system.
 */

import { Router } from "express";
import {
  createIssue,
  getProjectIssues,
  getAllIssues,
  getIssue,
  updateIssue,
  deleteIssue,
  getEpicIssues,
  getSubtasks
} from "../controllers/issueController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

// Create Express router for issue-related endpoints
const router = Router();

/**
 * POST /issues
 * Create a new issue
 *
 * Body: { title, description, type, priority, reporterId, projectId, assigneeId?, ... }
 * Returns: { message, issue }
 * Protected: Requires authentication
 */
router.post("/", authMiddleware, createIssue);

/**
 * GET /issues/projects/:projectId/issues
 * Get all issues for a specific project
 *
 * Params: projectId
 * Returns: { issues: [...] }
 * Protected: Requires authentication
 */
router.get("/projects/:projectId/issues", authMiddleware, getProjectIssues);

/**
 * GET /issues
 * Get all issues across all projects
 *
 * Query params: status, priority, type, reporterId, assigneeId, projectId, labels, epicId, parentId (optional filters)
 * Returns: { issues: [...] }
 * Protected: Requires authentication
 */
router.get("/", authMiddleware, getAllIssues);

/**
 * GET /issues/:id
 * Get detailed information about a specific issue
 *
 * Params: id (issue ID)
 * Returns: { issue: {...}, comments: [...] }
 * Protected: Requires authentication
 */
router.get("/:id", authMiddleware, getIssue);

/**
 * PUT /issues/:id
 * Update issue information (status, assignment, details)
 *
 * Params: id (issue ID)
 * Body: { status?, assigneeId?, title?, description?, priority?, type?, ... }
 * Returns: { message, issue }
 * Requires: Appropriate role permissions
 * Protected: Requires authentication
 */
router.put("/:id", authMiddleware, authorizeRoles("Developer", "Tester", "Admin"), updateIssue);

/**
 * DELETE /issues/:id
 * Delete an issue (rarely used, usually issues are closed instead)
 *
 * Params: id (issue ID)
 * Returns: { message }
 * Requires: Admin role
 * Protected: Requires authentication
 */
router.delete("/:id", authMiddleware, authorizeRoles("Admin"), deleteIssue);

/**
 * GET /issues/epics/:epicId/issues
 * Get all issues belonging to a specific epic
 *
 * Params: epicId
 * Returns: { issues: [...] }
 * Protected: Requires authentication
 */
router.get("/epics/:epicId/issues", authMiddleware, getEpicIssues);

/**
 * GET /issues/:parentId/subtasks
 * Get all subtasks for a parent issue
 *
 * Params: parentId
 * Returns: { issues: [...] }
 * Protected: Requires authentication
 */
router.get("/:parentId/subtasks", authMiddleware, getSubtasks);

// Export router for mounting in main application
export default router;