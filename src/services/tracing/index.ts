import { OpenAIAgentsTraceProcessor } from "@braintrust/openai-agents";
import {
  getGlobalTraceProvider,
  setTraceProcessors,
} from "@openai/agents";
import { initLogger } from "braintrust";
import type { AppBindings, TContext } from "@/types/common";

// This flag represents isolate-wide telemetry infrastructure only. It never
// contains state belonging to an individual request.
let tracingConfigured = false;

export const ensureTracing = (env: AppBindings): void => {
  if (tracingConfigured) return;

  try {
    const logger = initLogger({
      projectName: "portfolio-agent",
      apiKey: env.BRAINTRUST_API_KEY,
      noExitFlush: true,
      onFlushError: (error) => {
        console.error(
          JSON.stringify({
            event: "braintrust_flush_failed",
            error: error instanceof Error ? error.message : String(error),
          }),
        );
      },
    });

    // Braintrust is the application's only trace destination. Configure the
    // processor once so concurrent streamed requests cannot replace it.
    setTraceProcessors([new OpenAIAgentsTraceProcessor({ logger })]);
    tracingConfigured = true;
  } catch (error) {
    // Observability failures must not prevent the agent request from running.
    console.error(
      JSON.stringify({
        event: "agent_trace_initialization_failed",
        error: error instanceof Error ? error.message : String(error),
      }),
    );
  }
};

export const scheduleTraceFlush = (
  c: TContext,
  streamCompleted: Promise<void>,
): void => {
  const task = streamCompleted
    .catch((error) => {
      console.error(
        JSON.stringify({
          event: "agent_stream_failed",
          error: error instanceof Error ? error.message : String(error),
        }),
      );
    })
    // Workers do not run the Agents SDK's automatic export loop. Flush after
    // the streamed run has finalized its spans without delaying the response.
    .then(() => getGlobalTraceProvider().forceFlush())
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
