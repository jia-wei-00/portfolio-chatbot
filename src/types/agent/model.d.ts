import type { AppBindings } from "@/types/common";
import { AgentOptions } from "@openai/agents";

export interface ICreateModelAgent
  extends Omit<AgentOptions, "model" | "name"> {
  env: AppBindings;
  name?: string;
}
