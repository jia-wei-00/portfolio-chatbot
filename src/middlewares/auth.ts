import { Context, Next } from "hono";
import { createRemoteJWKSet, jwtVerify } from "jose";

export const requireAuth = async (c: Context, next: Next) => {
  const supabaseUrl = c.env.SUPABASE_URL;
  if (!supabaseUrl) {
    return c.json({ error: "Server misconfigured: SUPABASE_URL not set" }, 500);
  }

  const authHeader = c.req.header("Authorization");
  const token = authHeader?.split(" ")[1];

  if (!token) return c.json({ error: "Missing token" }, 401);

  try {
    const { payload } = await jwtVerify(
      token,
      createRemoteJWKSet(
        new URL(`${supabaseUrl}/auth/v1/.well-known/jwks.json`),
      ),
    );
    c.set("userId", payload.sub);
    c.set("userEmail", payload.email);
    await next();
  } catch (err) {
    return c.json({ error: "Invalid or expired token" }, 401);
  }
};
