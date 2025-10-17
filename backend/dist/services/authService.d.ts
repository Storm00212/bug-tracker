import type { User } from "../models/User.js";
export declare class AuthService {
    private static readonly JWT_EXPIRES_IN;
    static register(userData: Omit<User, "id" | "createdAt">): Promise<User>;
    static login(email: string, password: string): Promise<{
        user: User;
        token: string;
    }>;
    private static generateToken;
    static hashPassword(password: string): Promise<string>;
    static comparePassword(password: string, hashedPassword: string): Promise<boolean>;
}
//# sourceMappingURL=authService.d.ts.map