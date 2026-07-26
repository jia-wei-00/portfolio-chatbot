import { Env } from "@/types/env";
import type { SupabaseContext } from "@supabase/server";

export interface IAuthMiddleware {
  Bindings: Env;
  Variables: {
    supabaseContext: SupabaseContext;
    accessUser?: {
      email?: string;
      sub?: string;
    };
  };
}
