import { Agent } from "@openai/agents";

export interface ICreateAgent extends Partial<Agent> {
  name: string;
  baseURL: string;
  apiKey?: string;
  model: string;
}
