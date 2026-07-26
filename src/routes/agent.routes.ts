import { Hono } from "hono";
import { agentPrompt } from "@/agent";
import zValidator from "@/middlewares/validators/zod.validator";
import { promptSchema } from "@/schemas/agent";
import { rateLimit } from "@/middlewares/rate-limit/agent.limit";

const app = new Hono();

app
  .use("*", rateLimit)
  .post("/", zValidator("json", promptSchema), agentPrompt);

export default app;
