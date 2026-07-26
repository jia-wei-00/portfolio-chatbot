import { run } from "@openai/agents";
import { createAiSdkUiMessageStreamResponse } from "@openai/agents-extensions/ai-sdk-ui";
import {
  createNvidiaAgent,
  createGenAiAgent,
  createMercuryAgent,
} from "@/agent/model";
import { ValidContext } from "@/types/common";
import { TAgentPrompt } from "@/types/agent/prompt";

export const agentPrompt = async (c: ValidContext<TAgentPrompt>) => {
  try {
    const { message } = c.req.valid("json");
    const agent = createNvidiaAgent({
      env: c.env,
    });
    const resultStream = await run(agent, message, { stream: true });
    return createAiSdkUiMessageStreamResponse(resultStream);
  } catch (error) {
    console.error("Agent run failed:", error);
    return c.json({ error: "Agent run failed" }, 500);
  }
};
