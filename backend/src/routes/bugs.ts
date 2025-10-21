/**
 * BUG TRACKING ROUTES
 *
 * Handles all bug-related operations including reporting, updating, querying,
 * and managing bug lifecycles in the bug tracking system.
 */

import { Router } from "express";
import { reportBug, getProjectBugs, getAllBugs, getBug, updateBug, deleteBug } from "../controllers/bugController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

// Create Express router for bug-related endpoints
const router = Router();

/**
 * POST /bugs
 * Report a new bug
 *
 * Body: { title, description, severity, reporterId, projectId, developerId? }
 * Returns: { message, bug }
 * Protected: Requires authentication
 */
router.post("/", authMiddleware, reportBug);

/**
 * GET /projects/:projectId/bugs
 * Get all bugs for a specific project
 *
 * Params: projectId
 * Returns: { bugs: [...] }
 * Protected: Requires authentication
 */
router.get("/projects/:projectId/bugs", authMiddleware, getProjectBugs);

/**
 * GET /bugs
 * Get all bugs across all projects
 *
 * Query params: status, severity, reporterId, developerId (optional filters)
 * Returns: { bugs: [...] }
 * Protected: Requires authentication
 */
router.get("/", authMiddleware, getAllBugs);

/**
 * GET /bugs/:id
 * Get detailed information about a specific bug
 *
 * Params: id (bug ID)
 * Returns: { bug: {...}, comments: [...] }
 * Protected: Requires authentication
 */
router.get("/:id", authMiddleware, getBug);

/**
 * PUT /bugs/:id
 * Update bug information (status, assignment, details)
 *
 * Params: id (bug ID)
 * Body: { status?, developerId?, title?, description?, severity? }
 * Returns: { message, bug }
 * Requires: Developer, Tester, or Admin role
 * Protected: Requires authentication
 */
router.put("/:id", authMiddleware, authorizeRoles("Developer", "Tester", "Admin"), updateBug);

/**
 * DELETE /bugs/:id
 * Delete a bug (rarely used, usually bugs are closed instead)
 *
 * Params: id (bug ID)
 * Returns: { message }
 * Requires: Developer, Tester, or Admin role
 * Protected: Requires authentication
 */
router.delete("/:id", authMiddleware, authorizeRoles("Developer", "Tester", "Admin"), deleteBug);

// Export router for mounting in main application
export default router;