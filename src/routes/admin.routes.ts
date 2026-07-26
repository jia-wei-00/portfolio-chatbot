import { Hono } from "hono";
import zValidator from "@/middlewares/validators/zod.validator";
import { documentSchema } from "@/schemas/admin";
import { createDocument, listDocuments } from "@/admin";
import { cloudflareAccess } from "@/middlewares/auth/cloudflare.auth";

const admin = new Hono();

admin.use("*", cloudflareAccess);
admin.get("/documents", listDocuments);
admin.post("/documents", zValidator("json", documentSchema), createDocument);

export default admin;
