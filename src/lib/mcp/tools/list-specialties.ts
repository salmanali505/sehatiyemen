import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { getSupabase } from "../supabase";

export default defineTool({
  name: "list_specialties",
  title: "List medical specialties",
  description: "List all medical specialties available on Sehati.",
  inputSchema: { limit: z.number().int().min(1).max(200).default(100) },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit }) => {
    const { data, error } = await getSupabase().from("specialties").select("*").limit(limit);
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: { specialties: data ?? [] },
    };
  },
});
