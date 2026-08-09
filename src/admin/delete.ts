import { ValidContext } from "@/types/common";
import { IConsumerProps, TDeleteDocument } from "@/types/admin/document";
import { deleteDocumentSchema } from "@/schemas/admin";

export const removeDocuments = async (c: ValidContext<TDeleteDocument>) => {
  const { id } = c.req.valid("json");

  try {
    await c.env.DOCUMENT_DELETIONS_QUEUE.send({ id });
    return c.json({ status: "queued" }, 202);
  } catch (error) {
    console.error("Queue delete documents failed:", error);
    return c.json({ error: "Failed to queue delete documents" }, 500);
  }
};

export const consumeDocumentDeletions = async ({
  batch,
  env,
}: IConsumerProps) => {
  for (const message of batch.messages) {
    try {
      const { id: documentIds } = deleteDocumentSchema.parse(message.body);
      const placeholders = documentIds.map(() => "?").join(",");

      const result = await env.DB.prepare(
        `
        DELETE FROM document_chunk
        WHERE id IN (${placeholders})
        `,
      )
        .bind(...documentIds)
        .run();

      await env.VECTORIZE.deleteByIds(documentIds);
      message.ack();

      console.log(
        JSON.stringify({
          event: "document_deletion_completed",
          messageId: message.id,
          documentIds,
          databaseChanges: result.meta.changes ?? 0,
        }),
      );
    } catch (error) {
      console.error(
        JSON.stringify({
          event: "document_deletion_failed",
          messageId: message.id,
          attempt: message.attempts,
          error: error instanceof Error ? error.message : String(error),
        }),
      );

      message.retry({ delaySeconds: 30 });
    }
  }
};
