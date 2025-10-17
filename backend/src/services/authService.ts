import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { createUser, findUserByEmail, verifyCredentials } from "../repositories/userRepository.js";
import type { User } from "../models/User.js";

export class AuthService {
  private static readonly JWT_EXPIRES_IN = "1h";

  static async register(userData: Omit<User, "id" | "createdAt">): Promise<User> {
    // Check if user already exists
    const existingUser = await findUserByEmail(userData.email);
    if (existingUser) {
      throw new Error("Email already registered");
    }

    // Create new user
    const newUser = await createUser(userData);
    return newUser;
  }

  static async login(email: string, password: string): Promise<{ user: User; token: string }> {
    // Verify credentials
    const user = await verifyCredentials(email, password);
    if (!user) {
      throw new Error("Invalid credentials");
    }

    // Generate JWT token
    const token = this.generateToken(user);

    return { user, token };
  }

  private static generateToken(user: User): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET not configured");
    }

    return jwt.sign(
      { id: user.id, role: user.role },
      secret,
      { expiresIn: this.JWT_EXPIRES_IN }
    );
  }

  static async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }

  static async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }
}