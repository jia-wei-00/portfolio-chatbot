import { TAdminDocument } from "@/types/admin/document";
import { AppBindings } from "@/types/common";

export const queryDB = async (env: AppBindings, ids: string[]) => {
  if (ids.length === 0) return [];

  const placeholder = ids.map(() => "?").join(",");

  const { results } = await env.DB.prepare(
    `
    SELECT 
        title,
        category,
        content
    FROM document_chunk
    WHERE id IN (${placeholder})
        AND status = 'completed'
    `,
  )
    .bind(...ids)
    .all<TAdminDocument>();

  return results;
};
