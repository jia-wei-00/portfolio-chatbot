import { AppBindings } from "@/types/common";
import { createMiddleware } from "hono/factory";
import { setTraceProcessors } from "@openai/agents";
import { OpenAIAgentsTraceProcessor } from "@braintrust/openai-agents";
import { braintrustLogger } from "@/constant/trace";

let traceProcessorConfigured = false;

export const agentTrace = createMiddleware<{ Bindings: AppBindings }>(
  async (c, next) => {
    if (!traceProcessorConfigured) {
      const logger = braintrustLogger(c.env);

      setTraceProcessors([new OpenAIAgentsTraceProcessor({ logger })]);

      traceProcessorConfigured = true;
    }

    await next();
  },
);
