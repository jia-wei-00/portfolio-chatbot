import { ValidContext } from "@/types/common";
import { IConsumerProps, TAdminDocument } from "@/types/admin/document";
import { consumeDocumentSchema } from "@/schemas/admin";
import { generateEmbedding } from "@/services/embedding/generate";

export const createDocumentChunk = async (c: ValidContext<TAdminDocument>) => {
  const { title, category, content } = c.req.valid("json");
  const creationKey = c.req.header("Idempotency-Key") ?? crypto.randomUUID();

  try {
    await c.env.DOCUMENT_CREATIONS_QUEUE.send({
      creationKey,
      title,
      category,
      content,
    });

    return c.json({ status: "queued", creationKey }, 202);
  } catch (error) {
    console.error(
      JSON.stringify({
        event: "document_creation_enqueue_failed",
        error: error instanceof Error ? error.message : String(error),
      }),
    );
    return c.json({ error: "Failed to queue document creation" }, 500);
  }
};

export const consumeDocumentCreations = async ({
  batch,
  env,
}: IConsumerProps) => {
  for (const message of batch.messages) {
    try {
      const { title, category, content, creationKey } =
        consumeDocumentSchema.parse(message.body);

      const textToEmbed = [
        `Title: ${title}`,
        `Category: ${category}`,
        `Content: ${content}`,
      ].join("\n");

      const embedding = await generateEmbedding(env, textToEmbed);
      const document = await env.DB.prepare(
        `
        INSERT INTO document_chunk (
            creation_key,
            title,
            category,
            content,
            status
        )
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(creation_key) DO UPDATE SET
            creation_key = excluded.creation_key
        RETURNING id
        `,
      )
        .bind(creationKey, title, category, content, "processing")
        .first<{ id: number }>();

      const rowId = document?.id;
      if (!rowId) throw new Error("Failed to create or retrieve document");

      const result = await env.VECTORIZE.upsert([
        {
          id: String(rowId),
          values: embedding,
          metadata: {
            title,
            category,
          },
        },
      ]);

      if (!result.mutationId) throw new Error("Failed to store in VECTORIZE");

      const update = await env.DB.prepare(
        `
        UPDATE document_chunk
        SET status = 'completed'
        WHERE id = ?
        `,
      )
        .bind(rowId)
        .run();

      if (!update.success) throw new Error("Failed update completed");
      message.ack();
    } catch (error) {
      console.error(
        JSON.stringify({
          event: "document_creation_failed",
          messageId: message.id,
          attempt: message.attempts,
          error: error instanceof Error ? error.message : String(error),
        }),
      );
      message.retry({ delaySeconds: 30 });
    }
  }
};
