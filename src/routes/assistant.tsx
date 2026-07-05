import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Send, Sparkles, Loader2, Stethoscope } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { chatWithAssistant } from "@/lib/ai.functions";
import { BottomNav } from "@/components/BottomNav";
import { toast } from "sonner";

export const Route = createFileRoute("/assistant")({
  component: AssistantPage,
  head: () => ({
    meta: [
      { title: "المساعد الصحي الذكي | صحتي" },
      { name: "description", content: "استشر مساعد صحتي الذكي للحصول على إرشادات صحية وتوجيه للطبيب المناسب." },
    ],
  }),
});

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "أعاني من صداع متكرر منذ يومين، ما السبب؟",
  "ابني عمره 4 سنوات وعنده حرارة، ماذا أفعل؟",
  "كيف أعرف ضغط دمي مرتفع؟",
  "ما الفرق بين الإنفلونزا ونزلة البرد؟",
];

function AssistantPage() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const ask = useServerFn(chatWithAssistant);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !user) nav({ to: "/auth" });
  }, [loading, user, nav]);

  useEffect(() => {
    scrollerRef.current?.scrollTo({ top: scrollerRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, pending]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || pending) return;
    const next: Msg[] = [...messages, { role: "user", content: trimmed }];
    setMessages(next);
    setInput("");
    setPending(true);
    try {
      const { content } = await ask({ data: { messages: next } });
      setMessages([...next, { role: "assistant", content: content || "..." }]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "حدث خطأ";
      toast.error(msg);
      setMessages(next);
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-32 flex flex-col" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-background/80 border-b border-border/40">
        <div className="mx-auto max-w-md px-4 py-3 flex items-center gap-3">
          <Link to="/" className="rounded-xl p-2 hover:bg-muted">
            <ArrowRight size={20} />
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="absolute inset-0 gradient-primary rounded-full blur-md opacity-60 animate-pulse" />
                <div className="relative w-9 h-9 rounded-full gradient-primary flex items-center justify-center shadow-glow">
                  <Sparkles size={18} className="text-primary-foreground" />
                </div>
              </div>
              <div>
                <h1 className="font-extrabold text-base leading-tight">المساعد الصحي الذكي</h1>
                <p className="text-[11px] text-muted-foreground">مدعوم بالذكاء الاصطناعي</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div ref={scrollerRef} className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-md px-4 py-4 pb-48 space-y-4">
          {messages.length === 0 && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <div className="rounded-3xl gradient-primary p-6 text-primary-foreground shadow-glow">
                <Stethoscope className="mb-3" size={28} />
                <h2 className="font-extrabold text-lg">مرحباً 👋</h2>
                <p className="text-sm opacity-95 mt-1">
                  أنا مساعدك الصحي. صف لي ما تشعر به وسأرشدك للتخصص المناسب.
                </p>
              </div>
              <div className="mt-5">
                <p className="text-xs font-bold text-muted-foreground mb-2">أمثلة لتبدأ:</p>
                <div className="grid gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="text-right rounded-2xl border border-border bg-card px-4 py-3 text-sm hover:border-primary hover:shadow-md transition"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <p className="mt-4 text-[11px] text-muted-foreground text-center px-4">
                ⚠️ المعلومات إرشادية فقط ولا تغني عن استشارة الطبيب.
              </p>
            </motion.div>
          )}

          <AnimatePresence initial={false}>
            {messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${m.role === "user" ? "justify-start" : "justify-end"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap shadow-sm ${
                    m.role === "user"
                      ? "gradient-primary text-primary-foreground rounded-tr-sm"
                      : "bg-card border border-border rounded-tl-sm"
                  }`}
                >
                  {m.content}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {pending && (
            <div className="flex justify-end">
              <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="animate-spin" size={16} />
                يفكّر المساعد...
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Composer */}
      <div className="fixed bottom-24 left-0 right-0 z-40 px-4">
        <form
          onSubmit={(e) => { e.preventDefault(); send(input); }}
          className="mx-auto max-w-md glass rounded-3xl shadow-float p-2 flex items-center gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="اكتب سؤالك الصحي..."
            className="flex-1 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
            disabled={pending}
          />
          <button
            type="submit"
            disabled={pending || !input.trim()}
            className="w-10 h-10 rounded-2xl gradient-primary flex items-center justify-center text-primary-foreground shadow-glow disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {pending ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
          </button>
        </form>
      </div>

      <BottomNav />
    </div>
  );
}
