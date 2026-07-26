import { ValidContext, AuthContext } from "@/types/common";
import { TAdminDocument } from "@/types/admin/document";
import { OpenAI } from "openai";
import { getEmbeddingConfig } from "@/constant/agent";
import { PORTFOLIO_DOCUMENTS_TABLE } from "@/constant/supabase";

const DOCUMENT_COLUMNS = "id, title, category, content, created_at";

export const createDocument = async (c: ValidContext<TAdminDocument>) => {
  try {
    const { title, category, content } = c.req.valid("json");

    // 1. Generate the embedding for the content.
    const { model, ...rest } = getEmbeddingConfig(c.env);
    const client = new OpenAI(rest);
    const response = await client.embeddings.create({ model, input: content });
    const embedding = response.data[0]?.embedding;
    if (!embedding) {
      return c.json({ error: "Failed to generate embedding" }, 500);
    }

    // 2. Persist the document + embedding to Supabase (user-scoped client).
    const { supabase } = c.var.supabaseContext;
    const { data, error } = await supabase
      .from(PORTFOLIO_DOCUMENTS_TABLE)
      .insert({
        id: `${category}-${crypto.randomUUID()}`,
        title,
        category,
        content,
        embedding,
        created_at: new Date().toISOString(),
      })
      .select(DOCUMENT_COLUMNS)
      .single();

    if (error) {
      console.error("Supabase insert failed:", error);
      return c.json({ error: "Failed to save document" }, 500);
    }

    return c.json({ document: data }, 201);
  } catch (error) {
    console.error("Create document failed:", error);
    return c.json({ error: "Failed to create document" }, 500);
  }
};

export const listDocuments = async (c: AuthContext) => {
  const { email, sub } = c.var.accessUSer;

  try {
    return c.json({ email, sub });
  } catch (error) {
    console.error("List documents failed:", error);
    return c.json({ error: "Failed to load documents" }, 500);
  }
};
