/**
 * PROJECT MANAGEMENT ROUTES
 *
 * Handles all project-related operations in the bug tracking system.
 * Projects are containers for organizing bugs and managing development work.
 */

import { Router } from "express";
import { addProject, listProjects, getProject, updateProject, deleteProject } from "../controllers/projectController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

// Create Express router for project endpoints
const router = Router();

/**
 * POST /projects
 * Create a new project
 *
 * Body: { name, description }
 * Returns: { message, project }
 * Requires: Admin role
 * Protected: Requires authentication
 */
router.post("/", authMiddleware, authorizeRoles("Admin"), addProject);

/**
 * GET /projects
 * Retrieve all projects
 *
 * Returns: { projects: [...] }
 * Protected: Requires authentication
 */
router.get("/", authMiddleware, listProjects);

/**
 * GET /projects/:id
 * Retrieve a specific project by ID
 *
 * Params: id (project ID)
 * Returns: { project: {...} }
 * Protected: Requires authentication
 */
router.get("/:id", authMiddleware, getProject);

/**
 * PUT /projects/:id
 * Update an existing project
 *
 * Params: id (project ID)
 * Body: { name, description }
 * Returns: { message, project }
 * Requires: Admin role
 * Protected: Requires authentication
 */
router.put("/:id", authMiddleware, authorizeRoles("Admin"), updateProject);

/**
 * DELETE /projects/:id
 * Delete a project and all associated bugs
 *
 * Params: id (project ID)
 * Returns: { message }
 * Requires: Admin role
 * Protected: Requires authentication
 */
router.delete("/:id", authMiddleware, authorizeRoles("Admin"), deleteProject);

// Export router for mounting in main application
export default router;