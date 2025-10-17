import { Router } from "express";
import { addProject, listProjects } from "../controllers/projectController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
const router = Router();
// POST /projects - Create project (admin only)
router.post("/", authMiddleware, authorizeRoles("admin"), addProject);
// GET /projects - List all projects (authenticated users)
router.get("/", authMiddleware, listProjects);
// GET /projects/:id - Get single project (authenticated users)
router.get("/:id", authMiddleware, async (req, res) => {
    // TODO: Implement get single project controller
    res.status(501).json({ message: "Get single project not implemented yet" });
});
// PUT /projects/:id - Update project (admin only)
router.put("/:id", authMiddleware, authorizeRoles("Admin"), async (req, res) => {
    // TODO: Implement update project controller
    res.status(501).json({ message: "Update project not implemented yet" });
});
// DELETE /projects/:id - Delete project (admin only)
router.delete("/:id", authMiddleware, authorizeRoles("Admin"), async (req, res) => {
    // TODO: Implement delete project controller
    res.status(501).json({ message: "Delete project not implemented yet" });
});
export default router;
//# sourceMappingURL=projects.js.map