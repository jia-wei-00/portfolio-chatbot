import { run } from "@openai/agents";
import { createAiSdkUiMessageStreamResponse } from "@openai/agents-extensions/ai-sdk-ui";
import { createGenAiAgent } from "@/agent/model";
import { ValidContext } from "@/types/common";
import { TAgentPrompt } from "@/types/agent/prompt";
import { createRetrievePortfolioTool } from "@/agent/tools/retrievePortfolio";
import { traceFlush } from "@/utils/trace";

export const agentPrompt = async (c: ValidContext<TAgentPrompt>) => {
  try {
    const { env, req } = c;
    const { message } = req.valid("json");
    const agent = createGenAiAgent({
      env,
      tools: [createRetrievePortfolioTool(env)],
    });
    const resultStream = await run(agent, message, { stream: true });
    return createAiSdkUiMessageStreamResponse(resultStream);
  } catch (error) {
    console.error("Agent run failed:", error);
    return c.json({ error: "Agent run failed" }, 500);
  } finally {
    traceFlush(c);
  }
};
