import { z } from "zod";

export const GoalSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  priority: z.number().min(1).max(5),
  deadline: z.date().optional(),
});

export type GoalInput = z.infer<typeof GoalSchema>;
