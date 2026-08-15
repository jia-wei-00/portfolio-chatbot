import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    ignores: [
      "dist/**",
      ".wrangler/**",
      "node_modules/**",
      "src/types/worker-configuration.d.ts",
    ],
  },
  tseslint.configs.recommended,
  {
    files: ["src/**/*.{js,ts,tsx}", "app/**/*.{js,ts,tsx}"],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      "no-unused-vars": "warn",
    },
  },
]);
