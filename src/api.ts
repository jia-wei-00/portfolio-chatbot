import { Hono } from "hono";
import { csrf } from "hono/csrf";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { secureHeaders } from "hono/secure-headers";
import { timing } from "hono/timing";
import agent from "@/routes/agent.routes";
import whatsapp from "@/routes/whatsapp.routes";
import admin from "@/routes/admin.routes";
import type { AppBindings } from "@/types/common";
import { strictAgentOrigin } from "@/middlewares/cors";

// The JSON API, mounted under /api by the HonoX server entry (app/server.ts).
export const api = new Hono<{ Bindings: AppBindings }>()
  .use("*", logger())
  .use("*", strictAgentOrigin)
  .use("*", csrf())
  .use("*", prettyJSON())
  .use("*", secureHeaders())
  .use("*", timing())
  .route("/agent", agent)
  .route("/whatsapp", whatsapp)
  .route("/admin", admin);

export default api;
