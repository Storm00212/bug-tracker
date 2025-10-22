/**
 * CUSTOM FIELD ROUTES
 *
 * Handles all custom field-related operations including field management
 * and value setting/getting for issues.
 */

import { Router } from "express";
import {
  createCustomField,
  getCustomFieldsByProject,
  getCustomField,
  updateCustomField,
  deleteCustomField,
  setCustomFieldValues,
  getCustomFieldValues,
  updateCustomFieldValue
} from "../controllers/customFieldController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

// Create Express router for custom field-related endpoints
const router = Router();

/**
 * POST /custom-fields
 * Create a new custom field
 *
 * Body: { name, label, type, projectId, ... }
 * Returns: { message, field }
 * Requires: Admin role
 * Protected: Requires authentication
 */
router.post("/", authMiddleware, authorizeRoles("Admin"), createCustomField);

/**
 * GET /custom-fields/projects/:projectId
 * Get all custom fields for a specific project
 *
 * Params: projectId
 * Returns: { fields: [...] }
 * Protected: Requires authentication
 */
router.get("/projects/:projectId", authMiddleware, getCustomFieldsByProject);

/**
 * GET /custom-fields/:id
 * Get detailed information about a specific custom field
 *
 * Params: id (field ID)
 * Returns: { field: {...} }
 * Protected: Requires authentication
 */
router.get("/:id", authMiddleware, getCustomField);

/**
 * PUT /custom-fields/:id
 * Update custom field information
 *
 * Params: id (field ID)
 * Body: { label?, type?, required?, ... }
 * Returns: { message, field }
 * Requires: Admin role
 * Protected: Requires authentication
 */
router.put("/:id", authMiddleware, authorizeRoles("Admin"), updateCustomField);

/**
 * DELETE /custom-fields/:id
 * Delete a custom field
 *
 * Params: id (field ID)
 * Returns: { message }
 * Requires: Admin role
 * Protected: Requires authentication
 */
router.delete("/:id", authMiddleware, authorizeRoles("Admin"), deleteCustomField);

/**
 * POST /custom-fields/issues/:issueId/values
 * Set custom field values for an issue
 *
 * Params: issueId
 * Body: { fieldValues: [{ customFieldId, value }, ...] }
 * Returns: { message, values }
 * Protected: Requires authentication
 */
router.post("/issues/:issueId/values", authMiddleware, setCustomFieldValues);

/**
 * GET /custom-fields/issues/:issueId/values
 * Get all custom field values for an issue
 *
 * Params: issueId
 * Returns: { values: [...] }
 * Protected: Requires authentication
 */
router.get("/issues/:issueId/values", authMiddleware, getCustomFieldValues);

/**
 * PUT /custom-fields/values/:valueId
 * Update a specific custom field value
 *
 * Params: valueId
 * Body: { value }
 * Returns: { message, value }
 * Protected: Requires authentication
 */
router.put("/values/:valueId", authMiddleware, updateCustomFieldValue);

// Export router for mounting in main application
export default router;