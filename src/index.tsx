import { Hono } from "hono";
import { cors } from "hono/cors";
import { csrf } from "hono/csrf";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { secureHeaders } from "hono/secure-headers";
import { timing } from "hono/timing";
import { renderer } from "./renderer";
import agent from "./routes/agent.routes";
import whatsapp from "./routes/whatsapp.routes";

const web = new Hono();

web.use(renderer);
web.get("/", (c) => {
  return c.render(<h1>Hello!</h1>);
});

const app = new Hono()
  .basePath("/api")
  // Middleware
  .use("*", logger())
  .use("*", cors())
  .use("*", csrf())
  .use("*", prettyJSON())
  .use("*", secureHeaders())
  .use("*", timing())
  // Routes
  .route("/agent", agent)
  .route("/whatsapp", whatsapp);

export default app;
