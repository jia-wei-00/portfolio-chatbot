import {
  getGeminiConfig,
  getMercuryConfig,
  getNvidiaConfig,
} from "../constant/agent";
import { ICreateModelAgent } from "@/types/agent/model";
import { createAgent } from "@/utils/model";

export const createGenAiAgent = ({ env, ...rest }: ICreateModelAgent) =>
  createAgent({ ...rest, name: "gemini", ...getGeminiConfig(env) });

export const createMercuryAgent = ({ env, ...rest }: ICreateModelAgent) =>
  createAgent({ ...rest, name: "mercury", ...getMercuryConfig(env) });

export const createNvidiaAgent = ({ env, ...rest }: ICreateModelAgent) =>
  createAgent({ ...rest, name: "nvidia", ...getNvidiaConfig(env) });

export const createEmbeddingAgent = ({ env, ...rest }: ICreateModelAgent) =>
  createAgent({ ...rest, name: "nvidia", ...getNvidiaConfig(env) });
