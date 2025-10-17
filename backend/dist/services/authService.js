/**
 * AUTHENTICATION SERVICE
 *
 * Contains business logic for user authentication operations.
 * Services handle the core application logic, separate from HTTP concerns.
 * This service manages user registration, login, and password operations.
 */
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { createUser, findUserByEmail, verifyCredentials } from "../repositories/userRepository.js";
export class AuthService {
    // JWT token expiration time
    static JWT_EXPIRES_IN = "1h";
    /**
     * Register a new user account
     *
     * Business Logic:
     * 1. Check if email already exists
     * 2. Hash the password for security
     * 3. Create user record in database
     * 4. Return user data (without password)
     */
    static async register(userData) {
        // Step 1: Check if user already exists to prevent duplicates
        const existingUser = await findUserByEmail(userData.email);
        if (existingUser) {
            throw new Error("Email already registered");
        }
        // Step 2: Create new user (password hashing happens in repository)
        const newUser = await createUser(userData);
        return newUser;
    }
    /**
     * Authenticate user login
     *
     * Business Logic:
     * 1. Verify email and password combination
     * 2. Generate JWT token for authenticated sessions
     * 3. Return user data and access token
     */
    static async login(email, password) {
        // Step 1: Verify user credentials (email + password)
        const user = await verifyCredentials(email, password);
        if (!user) {
            throw new Error("Invalid credentials");
        }
        // Step 2: Generate JWT token for this user session
        const token = this.generateToken(user);
        return { user, token };
    }
    /**
     * Generate JWT token for user authentication
     *
     * Private method: Only used internally by the service
     * Includes user ID and role in token payload for authorization
     */
    static generateToken(user) {
        // Step 1: Get JWT secret from environment variables
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error("JWT_SECRET not configured");
        }
        // Step 2: Create JWT with user info and expiration
        return jwt.sign({ id: user.id, role: user.role }, secret, { expiresIn: this.JWT_EXPIRES_IN });
    }
    /**
     * Hash a plain text password for secure storage
     *
     * Uses bcrypt with salt rounds for security
     * This method is available for future use (currently handled in repository)
     */
    static async hashPassword(password) {
        return await bcrypt.hash(password, 10);
    }
    /**
     * Compare plain text password with hashed password
     *
     * Used during login to verify user credentials
     * This method is available for future use (currently handled in repository)
     */
    static async comparePassword(password, hashedPassword) {
        return await bcrypt.compare(password, hashedPassword);
    }
}
//# sourceMappingURL=authService.js.map