import { Router } from "express";
import { reportBug, getProjectBugs } from "../controllers/bugController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = Router();

// POST /bugs - Report a bug (authenticated users)
router.post("/", authMiddleware, reportBug);

// GET /projects/:projectId/bugs - Get bugs for a project (authenticated users)
router.get("/projects/:projectId/bugs", authMiddleware, getProjectBugs);

// PUT /bugs/:id - Update bug (developers and admins)
router.put("/:id", authMiddleware, authorizeRoles("Developer", "Admin"), async (req, res) => {
  // TODO: Implement bug update controller
  res.status(501).json({ message: "Bug update not implemented yet" });
});

// DELETE /bugs/:id - Delete bug (admins only)
router.delete("/:id", authMiddleware, authorizeRoles("Admin"), async (req, res) => {
  // TODO: Implement bug delete controller
  res.status(501).json({ message: "Bug delete not implemented yet" });
});

// GET /bugs - Get all bugs (authenticated users)
router.get("/", authMiddleware, async (req, res) => {
  // TODO: Implement get all bugs controller
  res.status(501).json({ message: "Get all bugs not implemented yet" });
});

// GET /bugs/:id - Get single bug (authenticated users)
router.get("/:id", authMiddleware, async (req, res) => {
  // TODO: Implement get single bug controller
  res.status(501).json({ message: "Get single bug not implemented yet" });
});

export default router;