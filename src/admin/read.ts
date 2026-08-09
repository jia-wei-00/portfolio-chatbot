import { TCreationKey, TDocumentStatusRow } from "@/types/admin/document";
import { TContext, ValidContext } from "@/types/common";

export const listDocuments = async (c: TContext) => {
  try {
    const { results } = await c.env.DB.prepare(
      `
      SELECT *
      FROM document_chunk
      ORDER BY id DESC
      `,
    ).all();

    return c.json({ data: results });
  } catch (error) {
    console.error("List documents failed:", error);
    return c.json({ error: "Failed to load documents" }, 500);
  }
};

export const getDocumentCreationStatus = async (
  c: ValidContext<TCreationKey>,
) => {
  const { creationKey } = c.req.valid("query");
  const uniqueKeys = [...new Set(creationKey)];
  const keys = uniqueKeys.map(() => "?").join(",");

  try {
    const { results } = await c.env.DB.prepare(
      `
    SELECT 
      id, 
      creation_key AS creationKey,
      status
    FROM document_chunk
    WHERE creation_key IN (${keys})
    `,
    )
      .bind(...uniqueKeys)
      .all<TDocumentStatusRow>();

    return c.json({ data: results }, 202);
  } catch (error) {
    return c.json(
      { error: "Failed to get status" + JSON.stringify(error) },
      500,
    );
  }
};
