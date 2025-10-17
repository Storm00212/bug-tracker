import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { createUser, findUserByEmail, verifyCredentials } from "../repositories/userRepository.js";
export class AuthService {
    static JWT_EXPIRES_IN = "1h";
    static async register(userData) {
        // Check if user already exists
        const existingUser = await findUserByEmail(userData.email);
        if (existingUser) {
            throw new Error("Email already registered");
        }
        // Create new user
        const newUser = await createUser(userData);
        return newUser;
    }
    static async login(email, password) {
        // Verify credentials
        const user = await verifyCredentials(email, password);
        if (!user) {
            throw new Error("Invalid credentials");
        }
        // Generate JWT token
        const token = this.generateToken(user);
        return { user, token };
    }
    static generateToken(user) {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error("JWT_SECRET not configured");
        }
        return jwt.sign({ id: user.id, role: user.role }, secret, { expiresIn: this.JWT_EXPIRES_IN });
    }
    static async hashPassword(password) {
        return await bcrypt.hash(password, 10);
    }
    static async comparePassword(password, hashedPassword) {
        return await bcrypt.compare(password, hashedPassword);
    }
}
//# sourceMappingURL=authService.js.map