import { Hono } from "hono";
import zValidator from "@/middlewares/validators/zod.validator";
import {
  creationKeySchema,
  deleteDocumentSchema,
  documentSchema,
} from "@/schemas/admin";
import { getDocumentCreationStatus, listDocuments } from "@/admin/read";
import { createDocumentChunk } from "@/admin/create";
import { cloudflareAccess } from "@/middlewares/auth/cloudflare.auth";
import { removeDocuments } from "@/admin/delete";

const admin = new Hono();

admin.use("*", cloudflareAccess);
admin.get("/documents", listDocuments);
admin.post(
  "/document-chunks",
  zValidator("json", documentSchema),
  createDocumentChunk,
);
admin.delete(
  "/document-chunks",
  zValidator("json", deleteDocumentSchema),
  removeDocuments,
);
admin.get(
  "/document-chunks/status",
  zValidator("query", creationKeySchema),
  getDocumentCreationStatus,
);

export default admin;
