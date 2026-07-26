import { createApp } from "honox/server";
import { api } from "@/api";

// HonoX file-based routes live in app/routes; the existing JSON API is mounted
// under /api via the init hook so its middleware chain is preserved.
const app = createApp({
  init(app) {
    app.route("/api", api);
  },
});

export default app;
