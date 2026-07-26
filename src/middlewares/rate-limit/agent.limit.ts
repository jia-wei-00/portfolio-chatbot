import { createMiddleware } from "hono/factory";

export const rateLimit = createMiddleware(async (c, next) => {
  const ip = c.req.header("cf-connecting-ip");
  const { success } = await c.env.AGENT_LIMITER.limit({ key: ip });
  if (!success) return c.json({ error: "Too many requests" }, 429);
  await next();
});
