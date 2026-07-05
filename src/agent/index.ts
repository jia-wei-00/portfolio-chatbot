import { Agent, run } from "@openai/agents";
import { Context } from "hono";

const agent = new Agent({
  name: "History tutor",
  instructions: "You answer history questions clearly and concisely.",
  model: "gpt-5.5",
});

export const agentAsk = async (c: Context) => {
  const result = await run(agent, "When did the Roman Empire fall?");
  return c.json({ result });
};
