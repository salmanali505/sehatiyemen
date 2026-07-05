import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { getSupabase } from "../supabase";

export default defineTool({
  name: "list_cities",
  title: "List cities",
  description: "List cities served by Sehati.",
  inputSchema: { limit: z.number().int().min(1).max(500).default(200) },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit }) => {
    const { data, error } = await getSupabase().from("cities").select("*").limit(limit);
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: { cities: data ?? [] },
    };
  },
});
