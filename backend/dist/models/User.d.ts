/**
 * USER MODEL
 *
 * Defines the data structure and validation rules for User entities.
 * Uses Zod for runtime type validation and TypeScript type inference.
 * Users are the core entities representing system users with different roles.
 */
import { z } from "zod";
export declare const userSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodNumber>;
    username: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    role: z.ZodEnum<{
        Admin: "Admin";
        Developer: "Developer";
        Tester: "Tester";
    }>;
    createdAt: z.ZodOptional<z.ZodDate>;
}, z.core.$strip>;
export type User = z.infer<typeof userSchema>;
//# sourceMappingURL=User.d.ts.map