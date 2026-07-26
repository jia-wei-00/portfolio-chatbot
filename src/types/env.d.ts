export interface Env {
  GEMINI_API_KEY: string;
  GOOGLE_GENERATIVE_BASE_URL?: string;
  GOOGLE_GENERATIVE_AI_MODEL?: string;
  MERCURY_API_KEY: string;
  MERCURY_BASE_URL?: string;
  MERCURY_MODEL?: string;
  NVIDIA_API_KEY: string;
  NVIDIA_BASE_URL?: string;
  NVIDIA_MODEL?: string;
  SUPABASE_URL?: string;
  // Supabase publishable key — public, safe to expose to the browser.
  SUPABASE_PUBLISHABLE_KEY: string;
  // Supabase secret key — server-only, never sent to the browser.
  SUPABASE_SECRET_KEY?: string;
  // JWKS endpoint used to verify Supabase auth JWTs.
  SUPABASE_JWKS_URL?: string;
  // Embedding
  EMBEDDING_MODEL: string;
  // Firebase web config (public — safe to expose to the browser)
  FIREBASE_API_KEY: string;
  FIREBASE_AUTH_DOMAIN: string;
  FIREBASE_PROJECT_ID: string;
  FIREBASE_STORAGE_BUCKET: string;
  FIREBASE_MESSAGING_SENDER_ID: string;
  FIREBASE_APP_ID: string;

  TEAM_DOMAIN: string;
  POLICY_AUD: string;
  AGENT_LIMITER: RateLimit;
}
