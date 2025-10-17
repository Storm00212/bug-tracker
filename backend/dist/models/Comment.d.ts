/**
 * COMMENT MODEL
 *
 * Defines the data structure and validation rules for Comment entities.
 * Comments enable team collaboration by allowing users to discuss bugs,
 * provide clarifications, and share information during issue resolution.
 */
import { z } from "zod";
export declare const commentSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodNumber>;
    bugId: z.ZodNumber;
    userId: z.ZodNumber;
    content: z.ZodString;
    createdAt: z.ZodOptional<z.ZodDate>;
    username: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type Comment = z.infer<typeof commentSchema>;
//# sourceMappingURL=Comment.d.ts.map