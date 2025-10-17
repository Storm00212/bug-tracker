/**
 * BUG MODEL
 *
 * Defines the data structure and validation rules for Bug entities.
 * Bugs are the core entities that track software defects throughout their lifecycle.
 * They contain all information needed to report, track, and resolve issues.
 */
import { z } from "zod";
export declare const bugSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodNumber>;
    title: z.ZodString;
    description: z.ZodString;
    severity: z.ZodEnum<{
        low: "low";
        medium: "medium";
        high: "high";
        critical: "critical";
    }>;
    status: z.ZodOptional<z.ZodEnum<{
        Open: "Open";
        "In Progress": "In Progress";
        Resolved: "Resolved";
        Closed: "Closed";
    }>>;
    reporterId: z.ZodNumber;
    developerId: z.ZodOptional<z.ZodNumber>;
    projectId: z.ZodNumber;
    createdAt: z.ZodOptional<z.ZodDate>;
}, z.core.$strip>;
export type Bug = z.infer<typeof bugSchema>;
//# sourceMappingURL=Bug.d.ts.map