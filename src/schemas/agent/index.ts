import z from "zod";

export const promptSchema = z.object({
  message: z.string(),
});

export const retrievePortfolioParameters = z.object({
  query: z
    .string()
    .min(1)
    .describe("A focused search query about Jia Wei's portfolio."),
});
