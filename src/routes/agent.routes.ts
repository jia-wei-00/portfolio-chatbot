import { Hono } from "hono";
import { requireAuth } from "../middlewares/auth";
import { agentAsk } from "../agent";

const app = new Hono();

app.use("*", requireAuth);
app.post("/", agentAsk);

export default app;
