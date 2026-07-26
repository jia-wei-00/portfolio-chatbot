// src/middleware/access.ts  (add this)
import { IAuthMiddleware } from "@/types/middlewares/auth";
import { createMiddleware } from "hono/factory";
import { createRemoteJWKSet, jwtVerify } from "jose";

export const cloudflareAccess = createMiddleware<IAuthMiddleware>(
  async (c, next) => {
    const token = c.req.raw.headers.get("Cf-Access-Jwt-Assertion");
    if (!token) return c.json({ error: "Unauthorized" }, 401);

    const jwks = createRemoteJWKSet(
      new URL(`${c.env.TEAM_DOMAIN}/cdn-cgi/access/certs`),
    );

    const { payload } = await jwtVerify(token, jwks, {
      audience: c.env.POLICY_AUD,
      issuer: c.env.TEAM_DOMAIN,
    });

    if (!payload) return c.json({ error: "Unauthorized" }, 401);

    c.set("accessUser", {
      email: typeof payload.email === "string" ? payload.email : undefined,
      sub: typeof payload.sub === "string" ? payload.sub : undefined,
    });

    await next();
  },
);
