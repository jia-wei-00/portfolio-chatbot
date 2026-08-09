import {
  getGeminiConfig,
  getMercuryConfig,
  getNvidiaConfig,
} from "../constant/agent";
import { ICreateModelAgent } from "@/types/agent/model";
import { createAgent } from "@/utils/model";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { aisdk } from "@openai/agents-extensions/ai-sdk";

export const createGenAiAgent = ({ env, ...rest }: ICreateModelAgent) => {
  const { apiKey, model } = getGeminiConfig(env);
  const google = createGoogleGenerativeAI({ apiKey });
  return createAgent({
    ...rest,
    name: "gemini",
    customModel: aisdk(google(model)),
  });
};

export const createMercuryAgent = ({ env, ...rest }: ICreateModelAgent) =>
  createAgent({ ...rest, name: "mercury", ...getMercuryConfig(env) });

export const createNvidiaAgent = ({ env, ...rest }: ICreateModelAgent) =>
  createAgent({ ...rest, name: "nvidia", ...getNvidiaConfig(env) });

export const createEmbeddingAgent = ({ env, ...rest }: ICreateModelAgent) =>
  createAgent({ ...rest, name: "nvidia", ...getNvidiaConfig(env) });
