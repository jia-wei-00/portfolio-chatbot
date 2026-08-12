import { run } from "@openai/agents";
import { createAiSdkUiMessageStreamResponse } from "@openai/agents-extensions/ai-sdk-ui";
import { createGenAiAgent } from "@/agent/model";
import { ValidContext } from "@/types/common";
import { TAgentPrompt } from "@/types/agent/prompt";
import { createRetrievePortfolioTool } from "@/agent/tools/retrievePortfolio";
import { scheduleTraceFlush } from "@/utils/trace";

export const agentPrompt = async (c: ValidContext<TAgentPrompt>) => {
  try {
    const { env, req } = c;
    const { message } = req.valid("json");
    const agent = createGenAiAgent({
      env,
      tools: [createRetrievePortfolioTool(env)],
    });
    const resultStream = await run(agent, message, { stream: true });
    const response = createAiSdkUiMessageStreamResponse(resultStream);
    scheduleTraceFlush(c, resultStream.completed);
    return response;
  } catch (error) {
    console.error("Agent run failed:", error);
    return c.json({ error: "Agent run failed" }, 500);
  }
};
