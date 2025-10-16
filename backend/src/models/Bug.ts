import { z } from "zod";

export const bugSchema = z.object({
  id: z.number().optional(),
  title: z.string().min(3, "Bug title must be at least 3 characters"),
  description: z.string().min(5, "Bug description must be detailed"),
  severity: z.enum(["low", "medium", "high", "critical"]),
  status: z.enum(["open", "in-progress", "resolved", "closed"]).optional(),
  reporterId: z.number(),
  developerId: z.number().optional(),
  projectId: z.number(),
  createdAt: z.date().optional(),
});

export type Bug = z.infer<typeof bugSchema>;
