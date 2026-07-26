import { ICreateAgent } from "@/types/utils/model";
import { Agent, OpenAIChatCompletionsModel } from "@openai/agents";
import OpenAI from "openai";
import { SYSTEM_PROMPT } from "@/constant/agent";

export const createAgent = ({
  baseURL,
  apiKey,
  model,
  ...rest
}: ICreateAgent) => {
  const client = new OpenAI({ baseURL, apiKey });
  return new Agent({
    ...rest,
    name: "Assistant",
    instructions: "assistant" || SYSTEM_PROMPT,
    model: new OpenAIChatCompletionsModel(client, model),
  });
};
