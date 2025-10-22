/**
 * AUTHENTICATION CONTROLLERS
 *
 * Handles HTTP requests for user authentication operations.
 * Controllers are responsible for:
 * - Input validation using Zod schemas
 * - Calling appropriate service methods
 * - Formatting responses
 * - Error handling and logging
 */

import { Request, Response } from "express";
import { AuthService } from "../services/authService.js";
import { userSchema } from "../models/User.js";

/**
 * Handle user registration
 *
 * Process: Validate input → Call service → Return response
 * Input validation ensures data integrity before processing
 */
export const registerUser = async (req: Request, res: Response) => {
  try {
    // Step 1: Validate input data using Zod schema
    const parse = userSchema.safeParse(req.body);
    if (!parse.success) {
      // Extract validation error messages and return them
      const errors = parse.error.issues.map((e: any) => e.message).join(", ");
      return res.status(400).json({ message: `Validation failed: ${errors}` });
    }

    // Step 2: Call service to handle business logic
    const user = await AuthService.register(req.body);

    // Step 3: Return success response with created user
    res.status(201).json({ message: "User registered successfully", user });
  } catch (err: any) {
    // Log error for debugging
    console.error("Register Error:", err.message);

    // Handle specific business logic errors
    if (err.message === "Email already registered") {
      return res.status(409).json({ message: err.message });
    }

    // Generic server error for unexpected issues
    res.status(500).json({ message: "Server error during registration" });
  }
};

/**
 * Handle user login
 *
 * Process: Extract credentials → Call service → Return token
 * Returns JWT token for authenticated requests
 */
export const loginUser = async (req: Request, res: Response) => {
  try {
    // Extract login credentials from request body
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Step 1: Call service to authenticate user
    const { user, token } = await AuthService.login(email, password);

    // Step 2: Return success response with user data and JWT token
    res.json({ message: "Login successful", token, user });
  } catch (err: any) {
    // Log error for debugging
    console.error("Login Error:", err.message);

    // Handle authentication-specific errors
    if (err.message === "Invalid credentials") {
      return res.status(401).json({ message: err.message });
    }

    // Generic server error for unexpected issues
    res.status(500).json({ message: "Server error during login" });
  }
};
