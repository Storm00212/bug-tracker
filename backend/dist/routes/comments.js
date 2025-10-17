/**
 * COMMENT SYSTEM ROUTES
 *
 * Handles all comment-related operations for bug discussions and clarifications.
 * Comments allow team members to discuss bugs, provide updates, and share information.
 */
import { Router } from "express";
import { addBugComment, listBugComments } from "../controllers/commentController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
// Create Express router for comment endpoints
const router = Router();
/**
 * POST /comments
 * Add a new comment to a bug
 *
 * Body: { bugId, userId, content }
 * Returns: { message, comment }
 * Protected: Requires authentication
 */
router.post("/", authMiddleware, addBugComment);
/**
 * GET /bugs/:bugId/comments
 * Get all comments for a specific bug
 *
 * Params: bugId
 * Returns: { comments: [...] }
 * Protected: Requires authentication
 */
router.get("/bugs/:bugId/comments", authMiddleware, listBugComments);
// Export router for mounting in main application
export default router;
//# sourceMappingURL=comments.js.map