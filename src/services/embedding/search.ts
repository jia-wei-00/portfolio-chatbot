import { generateEmbedding } from "@/services/embedding/generate";
import { AppBindings } from "@/types/common";

export const searchDocuments = async (
  env: AppBindings,
  query: string,
  topK = 5,
) => {
  const embedding = await generateEmbedding(env, query);
  const result = await env.VECTORIZE.query(embedding, {
    topK,
    returnMetadata: "none",
    returnValues: false,
  });
  return result.matches.map((match) => match.id);
};
