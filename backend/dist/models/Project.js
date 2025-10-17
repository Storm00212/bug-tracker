import { z } from "zod";
export const projectSchema = z.object({
    id: z.number().optional(),
    name: z.string().min(3, "Project name must be at least 3 characters long"),
    description: z.string().optional(),
    createdAt: z.date().optional(),
});
//# sourceMappingURL=Project.js.map