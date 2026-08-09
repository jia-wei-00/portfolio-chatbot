import { consumeDocumentCreations } from "@/admin/create";
import { consumeDocumentDeletions } from "@/admin/delete";
import type { AppBindings } from "@/types/common";

export const queue = async (
  batch: MessageBatch<unknown>,
  env: AppBindings,
): Promise<void> => {
  switch (batch.queue) {
    case "portfolio-chatbot-document-creations":
      await consumeDocumentCreations({ batch, env });
      break;

    case "portfolio-chatbot-document-deletions":
      await consumeDocumentDeletions({ batch, env });
      break;

    default:
      throw new Error(`Unknown queue: ${batch.queue}`);
  }
};
