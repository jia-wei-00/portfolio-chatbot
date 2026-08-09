import { Env } from "@/types/env";
import { AgentOptions } from "@openai/agents";

export interface ICreateModelAgent
  extends Omit<AgentOptions, "model" | "name"> {
  env: Env;
  name?: string;
}
