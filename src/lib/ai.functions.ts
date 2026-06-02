import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const MessageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string().min(1).max(8000),
});

const SYSTEM_PROMPT = `أنت "مساعد صحتي"، مساعد طبي ذكي يتحدث العربية الفصحى بأسلوب ودود ومهني.
دورك:
- تقديم معلومات صحية عامة، توعية، وإرشادات أولية.
- اقتراح التخصص الطبي المناسب للأعراض المذكورة (طب عام، باطنة، أطفال، نسائية، جلدية، أسنان، عظام...الخ).
- نصائح وقائية ونمط حياة صحي.
- لا تقدم تشخيصاً قاطعاً ولا وصفة دوائية.
- في الحالات الطارئة (ألم صدر شديد، صعوبة تنفس، نزيف، فقدان وعي) انصح بالتوجه فوراً للطوارئ.
- شجّع المستخدم على حجز موعد عبر تطبيق صحتي مع التخصص المناسب.
- ردودك مختصرة، واضحة، مرتبة بنقاط عند الحاجة.`;

export const chatWithAssistant = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ messages: z.array(MessageSchema).min(1).max(40) }).parse(input),
  )
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY is not configured");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...data.messages],
      }),
    });

    if (res.status === 429) throw new Error("تم تجاوز الحد المسموح. حاول لاحقاً.");
    if (res.status === 402) throw new Error("يلزم شحن رصيد Lovable AI.");
    if (!res.ok) {
      const t = await res.text();
      console.error("AI gateway error:", res.status, t);
      throw new Error("تعذر الاتصال بالمساعد الذكي.");
    }

    const json = await res.json();
    const content: string = json?.choices?.[0]?.message?.content ?? "";
    return { content };
  });
