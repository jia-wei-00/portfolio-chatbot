import { z } from "zod";
import {
  documentSchema,
  deleteDocumentSchema,
  creationKeySchema,
  documentStatusRow,
} from "@/schemas/admin";
import { AppBindings } from "@/types/common";

export type TAdminDocument = z.infer<typeof documentSchema>;
export type TDeleteDocument = z.infer<typeof deleteDocumentSchema>;
export type TCreationKey = z.infer<typeof creationKeySchema>;
export type TDocumentStatusRow = z.infer<typeof documentStatusRow>;

export interface IConsumerProps {
  batch: MessageBatch<unknown>;
  env: AppBindings;
}
