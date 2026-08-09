import { AppBindings } from "@/types/common";
import { cors } from "hono/cors";
import { createMiddleware } from "hono/factory";

export const strictAgentOrigin = createMiddleware<{ Bindings: AppBindings }>(
  async (c, next) => {
    const origin = c.req.header("Origin");
    const allowedOrigin = c.env.CORS_ORIGIN;

    if (origin !== allowedOrigin) {
      return c.json({ error: "Origin not allowed" }, 403);
    }

    return cors({
      origin: allowedOrigin,
      allowMethods: ["GET"],
      allowHeaders: ["Content-Type"],
      maxAge: 86400,
    })(c, next);
  },
);
