/**
 * USER REPOSITORY
 *
 * Handles direct database operations for User entities.
 * Repositories contain data access logic and SQL queries.
 * They provide a clean interface between services and the database.
 */
import type { User } from "../models/User.js";
/**
 * Create a new user in the database
 *
 * Process: Validate → Hash password → Insert → Return result
 * Handles user registration data persistence
 */
export declare const createUser: (user: User) => Promise<any>;
/**
 * Find a user by their email address
 *
 * Used for login authentication and duplicate email checking
 * Returns user record or undefined if not found
 */
export declare const findUserByEmail: (email: string) => Promise<any>;
/**
 * Verify user credentials for login
 *
 * Process: Find user → Compare password → Return result
 * Used by authentication service for login validation
 */
export declare const verifyCredentials: (email: string, password: string) => Promise<any>;
//# sourceMappingURL=userRepository.d.ts.map