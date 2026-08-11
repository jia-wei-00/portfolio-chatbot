import type { AppBindings } from "@/types/common";
import type { SupabaseContext } from "@supabase/server";

export interface IAuthMiddleware {
  Bindings: AppBindings;
  Variables: {
    supabaseContext: SupabaseContext;
    accessUser?: {
      email?: string;
      sub?: string;
    };
  };
}
