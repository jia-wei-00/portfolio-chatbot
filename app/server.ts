import { createApp } from "honox/server";
import { api } from "@/api";
import { queue } from "@/queue";

// HonoX file-based routes live in app/routes; the existing JSON API is mounted
// under /api via the init hook so its middleware chain is preserved.
const app = createApp({
  init(app) {
    app.route("/api", api);
  },
});

const worker = Object.assign(app, { queue });

export default worker;
