import { Router } from "express";
import { registerUser, loginUser } from "../controllers/authController.js";

const router = Router();

// POST /auth/register
router.post("/register", registerUser);

// POST /auth/login
router.post("/login", loginUser);

export default router;