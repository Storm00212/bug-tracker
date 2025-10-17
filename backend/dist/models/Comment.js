import { z } from "zod";
export const commentSchema = z.object({
    id: z.number().optional(),
    bugId: z.number(),
    userId: z.number(),
    content: z.string().min(2, "Comment cannot be empty"),
    createdAt: z.date().optional(),
    username: z.string().optional(), // for joined query output
});
//# sourceMappingURL=Comment.js.map