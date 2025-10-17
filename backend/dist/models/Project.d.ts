/**
 * PROJECT MODEL
 *
 * Defines the data structure and validation rules for Project entities.
 * Projects serve as containers for organizing and grouping related bugs.
 * They help teams manage work on specific features or components.
 */
import { z } from "zod";
export declare const projectSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodNumber>;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodOptional<z.ZodDate>;
}, z.core.$strip>;
export type Project = z.infer<typeof projectSchema>;
//# sourceMappingURL=Project.d.ts.map