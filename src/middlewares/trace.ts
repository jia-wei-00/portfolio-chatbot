import { AppBindings } from "@/types/common";
import { createMiddleware } from "hono/factory";
import { setTraceProcessors } from "@openai/agents";
import { OpenAIAgentsTraceProcessor } from "@braintrust/openai-agents";
import { braintrustLogger } from "@/constant/trace";

export const agentTrace = createMiddleware<{ Bindings: AppBindings }>(
  async (c, next) => {
    const logger = braintrustLogger(c.env);
    setTraceProcessors([new OpenAIAgentsTraceProcessor({ logger })]);
    await next();
  },
);
