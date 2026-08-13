import { createAiSdkUiMessageStreamResponse } from "@openai/agents-extensions/ai-sdk-ui";
import { createGenAiAgent } from "@/agent/model";
import type { ValidContext } from "@/types/common";
import type { TAgentPrompt } from "@/types/agent/prompt";
import { createRetrievePortfolioTool } from "@/agent/tools/retrievePortfolio";
import { runStreamedAgent } from "@/services/agent-runner";

export const agentPrompt = async (c: ValidContext<TAgentPrompt>) => {
  try {
    const { env, req } = c;
    const input = req.valid("json");
    const agent = createGenAiAgent({
      env,
      tools: [createRetrievePortfolioTool(env)],
    });
    const resultStream = await runStreamedAgent(c, agent, input);

    return createAiSdkUiMessageStreamResponse(resultStream);
  } catch (error) {
    console.error("Agent run failed:", error);
    return c.json({ error: "Agent run failed" }, 500);
  }
};
