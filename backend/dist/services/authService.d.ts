/**
 * AUTHENTICATION SERVICE
 *
 * Contains business logic for user authentication operations.
 * Services handle the core application logic, separate from HTTP concerns.
 * This service manages user registration, login, and password operations.
 */
import type { User } from "../models/User.js";
export declare class AuthService {
    private static readonly JWT_EXPIRES_IN;
    /**
     * Register a new user account
     *
     * Business Logic:
     * 1. Check if email already exists
     * 2. Hash the password for security
     * 3. Create user record in database
     * 4. Return user data (without password)
     */
    static register(userData: Omit<User, "id" | "createdAt">): Promise<User>;
    /**
     * Authenticate user login
     *
     * Business Logic:
     * 1. Verify email and password combination
     * 2. Generate JWT token for authenticated sessions
     * 3. Return user data and access token
     */
    static login(email: string, password: string): Promise<{
        user: User;
        token: string;
    }>;
    /**
     * Generate JWT token for user authentication
     *
     * Private method: Only used internally by the service
     * Includes user ID and role in token payload for authorization
     */
    private static generateToken;
    /**
     * Hash a plain text password for secure storage
     *
     * Uses bcrypt with salt rounds for security
     * This method is available for future use (currently handled in repository)
     */
    static hashPassword(password: string): Promise<string>;
    /**
     * Compare plain text password with hashed password
     *
     * Used during login to verify user credentials
     * This method is available for future use (currently handled in repository)
     */
    static comparePassword(password: string, hashedPassword: string): Promise<boolean>;
}
//# sourceMappingURL=authService.d.ts.map