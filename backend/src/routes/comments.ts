import { Router } from "express";
import { addBugComment, listBugComments } from "../controllers/commentController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

// POST /comments - Add comment to bug (authenticated users)
router.post("/", authMiddleware, addBugComment);

// GET /bugs/:bugId/comments - Get comments for a bug (authenticated users)
router.get("/bugs/:bugId/comments", authMiddleware, listBugComments);

export default router;