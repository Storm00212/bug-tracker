import { z } from "zod";
export declare const userSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodNumber>;
    username: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    role: z.ZodEnum<{
        admin: "admin";
        developer: "developer";
        tester: "tester";
    }>;
    createdAt: z.ZodOptional<z.ZodDate>;
}, z.core.$strip>;
export type User = z.infer<typeof userSchema>;
//# sourceMappingURL=User.d.ts.map