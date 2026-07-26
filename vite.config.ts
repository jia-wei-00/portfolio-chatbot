import build from "@hono/vite-build/cloudflare-workers";
import honox from "honox/vite";
import { defineConfig } from "vite";
import { fileURLToPath, URL } from "node:url";
import { readFileSync } from "node:fs";

// The Cloudflare dev adapters (getPlatformProxy / @cloudflare/vite-plugin) fail
// to start workerd in this environment, so we run the dev server in plain Node
// via a custom @hono/vite-dev-server adapter that injects the bindings the app
// needs. `.dev.vars` supplies the Supabase/API env; AGENT_LIMITER is stubbed so
// the agent route's rate-limit middleware is a no-op in dev.
const loadDevVars = (): Record<string, string> => {
  const env: Record<string, string> = {};
  try {
    for (const line of readFileSync(".dev.vars", "utf-8").split("\n")) {
      if (line.trim().startsWith("#")) continue;
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
      if (m) env[m[1]] = m[2];
    }
  } catch {
    /* .dev.vars is optional */
  }
  return env;
};

const nodeDevAdapter = () => ({
  env: {
    ...process.env,
    ...loadDevVars(),
    AGENT_LIMITER: { limit: async () => ({ success: true }) },
  },
});

export default defineConfig(({ command }) => ({
  plugins: [
    honox({
      devServer: { adapter: nodeDevAdapter },
      client: { input: ["/app/client.ts", "/app/style.css"] },
    }),
    build({ entry: "./app/server.ts" }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  // honox forces `ssr.noExternal: true`, which inlines every dep into the SSR
  // graph. Node-oriented CJS deps (e.g. `debug` via @openai/agents) break under
  // the dev module runner, so keep the heavy AI/agent stack external IN DEV ONLY.
  // The production build must bundle everything (Workers have no node_modules).
  ssr:
    command === "serve"
      ? {
          external: [
            "debug",
            "@openai/agents",
            "@openai/agents-core",
            "@openai/agents-extensions",
            "ai",
            "@ai-sdk/google",
            "@ai-sdk/openai-compatible",
            "@google/genai",
            "openai",
          ],
        }
      : {},
}));
