import { tool } from "@openai/agents";
import { searchDocuments } from "@/services/embedding/search";
import { queryDB } from "@/services/database/query";
import type { AppBindings } from "@/types/common";
import { retrievePortfolioParameters } from "@/schemas/agent";

export const createRetrievePortfolioTool = (env: AppBindings) =>
  tool({
    name: "retrieve_portfolio",
    description:
      "Search Jia Wei's portfolio documents for relevant background, skills, projects, experience, education, and contact information.",
    parameters: retrievePortfolioParameters,
    execute: async ({ query }, args) => {
      {
        const documentIds = await searchDocuments(env, query);
        if (documentIds.length === 0) {
          return "No relevant portfolio information was found.";
        }

        const documents = await queryDB(env, documentIds);
        if (documents.length === 0) {
          return "No relevant portfolio information was found.";
        }

        return documents
          .map(
            ({ title, category, content }) =>
              `Title: ${title}\nCategory: ${category}\nContent: ${content}`,
          )
          .join("\n\n");
      }
    },
  });
