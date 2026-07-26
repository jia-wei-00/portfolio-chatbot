import { z } from "zod";
import { documentSchema } from "@/schemas/admin";

export type TAdminDocument = z.infer<typeof documentSchema>;

// A row returned to the client (without the large embedding vector).
export interface IPortfolioDocument {
  id: string;
  title: string | null;
  category: string | null;
  content: string | null;
  created_at: string | null;
}
