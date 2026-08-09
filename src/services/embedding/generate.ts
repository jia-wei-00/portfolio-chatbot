import { getEmbeddingConfig } from "@/constant/agent";
import { AppBindings } from "@/types/common";
import OpenAI from "openai";

export const generateEmbedding = async (
  env: AppBindings,
  textToEmbed: string,
): Promise<number[]> => {
  const { model, ...rest } = getEmbeddingConfig(env);
  const client = new OpenAI(rest);
  const response = await client.embeddings.create({
    model,
    input: textToEmbed,
    dimensions: 768,
  });
  const embedding = response.data[0]?.embedding;
  if (!embedding) throw new Error("Failed to create embedding");
  return embedding;
};
