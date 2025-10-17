import { Router } from "express";
import { addProject, listProjects } from "../controllers/projectController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = Router();

// POST /projects - Create project (admin only)
router.post("/", authMiddleware, authorizeRoles("admin"), addProject);

// GET /projects - List all projects (authenticated users)
router.get("/", authMiddleware, listProjects);

export default router;