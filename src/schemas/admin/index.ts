import z from "zod";

export const documentSchema = z.object({
  title: z.string().min(1).max(200),
  category: z.string().min(1).max(50),
  content: z.string().min(1).max(5000),
});
