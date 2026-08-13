import type { AppBindings } from "@/types/common";
import { createMiddleware } from "hono/factory";
import { ensureTracing } from "@/services/tracing";

export const agentTrace = createMiddleware<{ Bindings: AppBindings }>(
  async (c, next) => {
    ensureTracing(c.env);
    await next();
  },
);
