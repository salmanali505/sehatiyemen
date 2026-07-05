import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { getSupabase } from "../supabase";

export default defineTool({
  name: "search_providers",
  title: "Search healthcare providers",
  description:
    "Search Sehati healthcare providers (clinics, hospitals, doctors) by keyword, specialty, or city.",
  inputSchema: {
    query: z.string().optional().describe("Free-text search on provider name."),
    specialty: z.string().optional().describe("Specialty slug or name filter."),
    city: z.string().optional().describe("City slug or name filter."),
    limit: z.number().int().min(1).max(50).default(20),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ query, specialty, city, limit }) => {
    const supabase = getSupabase();
    let q = supabase.from("providers").select("*").limit(limit);
    if (query) q = q.ilike("name", `%${query}%`);
    if (specialty) q = q.or(`specialty.ilike.%${specialty}%,specialty_id.eq.${specialty}`);
    if (city) q = q.or(`city.ilike.%${city}%,city_id.eq.${city}`);
    const { data, error } = await q;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: { providers: data ?? [] },
    };
  },
});
