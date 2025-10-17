import type { User } from "../models/User.js";
export declare const createUser: (user: User) => Promise<any>;
export declare const findUserByEmail: (email: string) => Promise<any>;
export declare const verifyCredentials: (email: string, password: string) => Promise<any>;
//# sourceMappingURL=userRepository.d.ts.map