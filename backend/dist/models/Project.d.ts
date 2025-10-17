import { z } from "zod";
export declare const projectSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodNumber>;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodOptional<z.ZodDate>;
}, z.core.$strip>;
export type Project = z.infer<typeof projectSchema>;
//# sourceMappingURL=Project.d.ts.map