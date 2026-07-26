import type { Context } from "hono";
import type { ValidationTargets } from "hono";
import type { SupabaseContext } from "@supabase/server";
import { Env } from "@/types/env";

// Variables populated by the `supabaseAuth` middleware.
export type AuthVariables = {
  supabaseContext: SupabaseContext;
  accessUSer: {
    email: string;
    sub: string;
  };
};

export type ValidContext<
  T,
  Target extends keyof ValidationTargets = "json",
> = Context<
  { Bindings: Env; Variables: AuthVariables },
  string,
  { in: Record<Target, T>; out: Record<Target, T> }
>;

// For handlers without a validated body (e.g. GET routes) that still need the
// authenticated context variables.
export type AuthContext = Context<{
  Bindings: Env;
  Variables: AuthVariables;
}>;
