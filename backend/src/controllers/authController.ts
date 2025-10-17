import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { createUser, findUserByEmail, verifyCredentials } from "../repositories/userRepository.js";
import { userSchema } from "../models/User.js";

/** Register a new user */
export const registerUser = async (req: Request, res: Response) => {
  try {
    const parse = userSchema.safeParse(req.body);
    if (!parse.success) {
      const errors = parse.error.errors.map(e => e.message).join(", ");
      return res.status(400).json({ message: `Validation failed: ${errors}` });
    }

    const { email, password } = req.body;
    const existing = await findUserByEmail(email);
    if (existing) return res.status(409).json({ message: "Email already registered" });

    const newUser = await createUser(req.body);
    res.status(201).json({ message: "User registered successfully", user: newUser });
  } catch (err: any) {
    console.error("Register Error:", err.message);
    res.status(500).json({ message: "Server error during registration" });
  }
};

/** Login user */
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await verifyCredentials(email, password);
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" }
    );

    res.json({ message: "Login successful", token, user });
  } catch (err: any) {
    console.error("Login Error:", err.message);
    res.status(500).json({ message: "Server error during login" });
  }
};
