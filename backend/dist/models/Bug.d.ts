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
        open: "open";
        "in-progress": "in-progress";
        resolved: "resolved";
        closed: "closed";
    }>>;
    reporterId: z.ZodNumber;
    developerId: z.ZodOptional<z.ZodNumber>;
    projectId: z.ZodNumber;
    createdAt: z.ZodOptional<z.ZodDate>;
}, z.core.$strip>;
export type Bug = z.infer<typeof bugSchema>;
//# sourceMappingURL=Bug.d.ts.map