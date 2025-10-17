import { z } from "zod";

// Zod Schema
export const userSchema = z.object({
  id: z.number().optional(),
  username: z.string().min(3, "Username must be at least 3 characters long"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(4, "Password must be at least 4 characters long"),
  role: z.enum(["Admin", "Developer", "Tester"]),
  createdAt: z.date().optional(),
});

// TypeScript Type from Zod Schema
export type User = z.infer<typeof userSchema>;
