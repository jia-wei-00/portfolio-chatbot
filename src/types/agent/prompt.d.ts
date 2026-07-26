import { z } from "zod";
import { promptSchema } from "@/schemas/agent";

export type TAgentPrompt = z.infer<typeof promptSchema>;
