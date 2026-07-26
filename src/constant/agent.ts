import { Env } from "@/types/env";

// GEMINI
export const getGeminiConfig = (env: Env) => ({
  apiKey: env.GEMINI_API_KEY,
  baseURL:
    env.GOOGLE_GENERATIVE_BASE_URL ||
    "https://generativelanguage.googleapis.com/v1beta/openai/",
  model: env.GOOGLE_GENERATIVE_AI_MODEL || "gemini-3.1-flash-lite",
});

// MERCURY
export const getMercuryConfig = (env: Env) => ({
  apiKey: env.MERCURY_API_KEY,
  baseURL: env.MERCURY_BASE_URL || "https://api.inceptionlabs.ai/v1",
  model: env.MERCURY_MODEL || "mercury-2",
});

// NVIDIA
export const getNvidiaConfig = (env: Env) => ({
  apiKey: env.NVIDIA_API_KEY,
  baseURL: env.NVIDIA_BASE_URL || "https://integrate.api.nvidia.com/v1",
  model: env.NVIDIA_MODEL || "nvidia/nemotron-3-ultra-550b-a55b",
});

// EMBEDDING
export const getEmbeddingConfig = (env: Env) => ({
  apiKey: env.GEMINI_API_KEY,
  baseURL:
    env.GOOGLE_GENERATIVE_BASE_URL ||
    "https://generativelanguage.googleapis.com/v1beta/openai/",
  model: env.EMBEDDING_MODEL || "gemini-embedding-2",
});

export const SYSTEM_PROMPT =
  "You are an AI assistant exclusively for Jia Wei's personal portfolio website. " +
  "Your only purpose is to answer questions about Jia Wei — his background, skills, projects, work experience, education, and contact information. " +
  "Always use the retrieve_portfolio tool to find relevant information before answering. " +
  "If the user asks about anything unrelated to Jia Wei (e.g. general knowledge, other people, coding help, current events), " +
  "do NOT attempt to answer. Instead reply with exactly: " +
  '"I\'m only able to answer questions about Jia Wei. Feel free to ask me about his skills, projects, experience, or how to get in touch!" ' +
  "If the retrieved information does not cover a question about Jia Wei, say you don't have that information and suggest the visitor reach out directly.";
