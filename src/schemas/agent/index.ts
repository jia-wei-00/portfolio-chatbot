import z from "zod";
import { protocol } from "@openai/agents";

export const promptSchema = z.array(protocol.ModelItem).min(1);

export const retrievePortfolioParameters = z.object({
  query: z
    .string()
    .min(1)
    .describe("A focused search query about Jia Wei's portfolio."),
});
