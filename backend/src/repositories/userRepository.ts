/**
 * USER REPOSITORY
 *
 * Handles direct database operations for User entities.
 * Repositories contain data access logic and SQL queries.
 * They provide a clean interface between services and the database.
 */

import { getPool } from "../config/db.js";
import bcrypt from "bcryptjs";
import { userSchema } from "../models/User.js";
import type { User } from "../models/User.js";

/**
 * Create a new user in the database
 *
 * Process: Validate → Hash password → Insert → Return result
 * Handles user registration data persistence
 */
export const createUser = async (user: User) => {
  // Step 1: Validate user data using Zod schema
  const parsed = userSchema.safeParse(user);
  if (!parsed.success) {
    const errors = parsed.error.issues.map((e: any) => e.message).join(", ");
    throw new Error(`User validation failed: ${errors}`);
  }

  // Step 2: Get database connection from pool
  const pool = await getPool();

  // Step 3: Hash password for secure storage
  const hashedPassword = await bcrypt.hash(user.password, 10);

  // Step 4: Execute INSERT query with parameterized values
  const result = await pool.request()
    .input("username", user.username)
    .input("email", user.email)
    .input("password", hashedPassword)
    .input("role", user.role)
    .query(`
      INSERT INTO Users (username, email, password, role)
      VALUES (@username, @email, @password, @role);
      SELECT SCOPE_IDENTITY() AS id;
    `);

  // Step 5: Return the newly created user record with generated ID
  return result.recordset[0];
};

/**
 * Find a user by their email address
 *
 * Used for login authentication and duplicate email checking
 * Returns user record or undefined if not found
 */
export const findUserByEmail = async (email: string) => {
  const pool = await getPool();
  const result = await pool.request()
    .input("email", email)
    .query(`SELECT * FROM Users WHERE email = @email`);
  return result.recordset[0]; // Returns undefined if no user found
};

/**
 * Verify user credentials for login
 *
 * Process: Find user → Compare password → Return result
 * Used by authentication service for login validation
 */
export const verifyCredentials = async (email: string, password: string) => {
  // Step 1: Find user by email
  const user = await findUserByEmail(email);
  if (!user) return null;

  // Step 2: Compare provided password with stored hash
  const isValid = await bcrypt.compare(password, user.password);

  // Step 3: Return user if credentials are valid, null otherwise
  return isValid ? user : null;
};

/**
 * Get all users in the system
 *
 * Returns all users ordered by creation date
 * Used for admin user management
 */
export const getAllUsers = async () => {
  const pool = await getPool();
  const result = await pool.request().query(`SELECT id, username, email, role, createdAt FROM Users ORDER BY createdAt DESC`);
  return result.recordset;
};

/**
 * Update a user's role
 *
 * Process: Validate role → Update → Return result
 * Only Admin users can update user roles
 */
export const updateUserRole = async (userId: number, newRole: string) => {
  // Validate role
  const validRoles = ["Admin", "Developer", "Tester"];
  if (!validRoles.includes(newRole)) {
    throw new Error(`Invalid role. Must be one of: ${validRoles.join(", ")}`);
  }

  // Step 1: Get database connection from pool
  const pool = await getPool();

  // Step 2: Execute UPDATE query
  await pool.request()
    .input("id", userId)
    .input("role", newRole)
    .query(`UPDATE Users SET role = @role WHERE id = @id`);

  // Step 3: Return the updated user
  return await findUserById(userId);
};

/**
 * Get a user by ID (internal use)
 *
 * Returns user record without password
 */
const findUserById = async (userId: number) => {
  const pool = await getPool();
  const result = await pool.request()
    .input("id", userId)
    .query(`SELECT id, username, email, role, createdAt FROM Users WHERE id = @id`);
  return result.recordset[0] || null;
};
