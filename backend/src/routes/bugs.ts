import { Router } from "express";
import { reportBug, getProjectBugs } from "../controllers/bugController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

// POST /bugs - Report a bug (authenticated users)
router.post("/", authMiddleware, reportBug);

// GET /projects/:projectId/bugs - Get bugs for a project (authenticated users)
router.get("/projects/:projectId/bugs", authMiddleware, getProjectBugs);

export default router;