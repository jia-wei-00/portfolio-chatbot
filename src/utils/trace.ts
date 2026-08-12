import { TContext } from "@/types/common";
import type { AppBindings } from "@/types/common";
import { initLogger } from "braintrust";
import { getGlobalTraceProvider } from "@openai/agents";

let logger: ReturnType<typeof initLogger> | undefined;

export const scheduleTraceFlush = (
  c: TContext,
  streamCompleted: Promise<void>,
) => {
  const task = streamCompleted
    .catch((error) => {
      console.error(
        JSON.stringify({
          event: "agent_stream_failed",
          error: error instanceof Error ? error.message : String(error),
        }),
      );
    })
    .then(async () => {
      await getGlobalTraceProvider().forceFlush();
    })
    .catch((error) => {
      console.error(
        JSON.stringify({
          event: "agent_trace_flush_failed",
          error: error instanceof Error ? error.message : String(error),
        }),
      );
    });

  c.executionCtx.waitUntil(task);
};

export const braintrustLogger = (env: AppBindings) => {
  if (!logger) {
    logger = initLogger({
      projectName: "portfolio-agent",
      apiKey: env.BRAINTRUST_API_KEY,

      // Cloudflare Workers have no normal Node process-exit lifecycle.
      noExitFlush: true,

      onFlushError(error) {
        console.error(
          JSON.stringify({
            event: "braintrust_flush_failed",
            error: error instanceof Error ? error.message : String(error),
          }),
        );
      },
    });
  }

  return logger;
};
