import z from "zod";

const creationKey = z.uuidv4();
const status = z.enum(["processing", "completed", "failed"]);

export const documentSchema = z.object({
  title: z.string().min(1).max(200),
  category: z.string().min(1).max(50),
  content: z.string().min(1).max(5000),
});

export const consumeDocumentSchema = documentSchema.extend({
  creationKey,
});

export const deleteDocumentSchema = z.object({
  id: z.array(z.string()),
});

export const creationKeySchema = z.object({
  creationKey: z
    .union([creationKey, z.array(creationKey)]) // Accept string OR array of strings
    .transform((val) => (Array.isArray(val) ? val : [val])), // Always outputs string[]
});

export const documentStatusRow = z.object({
  id: z.string(),
  creationKey: z.string(),
  status,
});
