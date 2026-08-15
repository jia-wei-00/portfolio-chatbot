import {
  run,
  type Agent,
  type AgentInputItem,
  type StreamRunOptions,
} from "@openai/agents";
import type { TContext } from "@/types/common";
import { scheduleTraceFlush } from "@/services/tracing";

export const runStreamedAgent = async <
  TAgent extends Agent,
  TAgentContext = undefined,
>(
  c: TContext,
  agent: TAgent,
  input: string | AgentInputItem[],
  options?: Omit<StreamRunOptions<TAgentContext, TAgent>, "stream">,
) => {
  let streamCompleted: Promise<void> = Promise.resolve();

  try {
    const resultStream = await run(agent, input, {
      ...options,
      stream: true,
    });
    streamCompleted = resultStream.completed;

    return resultStream;
  } finally {
    // Register the flush even when run() fails before returning a stream.
    scheduleTraceFlush(c, streamCompleted);
  }
};
