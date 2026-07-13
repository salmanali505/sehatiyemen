import { useEffect, useState } from "react";
import { Star, Loader2, MessageSquare, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Review = any;

export default function ReviewsManager({ providerIds }: { providerIds: string[] }) {
  const [items, setItems] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyDraft, setReplyDraft] = useState<Record<string, string>>({});

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [providerIds.join("|")]);

  async function load() {
    if (!providerIds.length) { setItems([]); setLoading(false); return; }
    setLoading(true);
    const { data } = await (supabase as any).from("reviews").select("*")
      .in("provider_id", providerIds).order("created_at", { ascending: false }).limit(100);
    setItems(data ?? []);
    setLoading(false);
  }

  async function submitReply(id: string) {
    const text = (replyDraft[id] || "").trim();
    if (!text) return;
    const { error } = await (supabase as any).from("reviews").update({ reply: text, reply_at: new Date().toISOString() }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("تم إرسال الرد"); setReplyDraft((x) => ({ ...x, [id]: "" })); load();
  }

  if (!providerIds.length) return null;

  const avg = items.length ? items.reduce((s, r) => s + Number(r.rating || 0), 0) / items.length : 0;

  return (
    <section className="rounded-3xl border bg-card overflow-hidden shadow-sm">
      <div className="p-4 border-b flex items-center gap-2">
        <MessageSquare size={18} className="text-primary" />
        <h2 className="font-extrabold">التقييمات والردود</h2>
        {items.length > 0 && (
          <span className="ms-auto flex items-center gap-1 text-xs font-bold">
            <Star size={14} className="text-warning fill-warning" /> {avg.toFixed(1)} • {items.length}
          </span>
        )}
      </div>

      {loading ? <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>
        : items.length === 0 ? <p className="p-8 text-center text-sm text-muted-foreground">لا توجد تقييمات بعد.</p>
        : <div className="divide-y">
            {items.map((r) => (
              <div key={r.id} className="p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={12} className={i < Number(r.rating) ? "text-warning fill-warning" : "text-muted"} />
                    ))}
                  </div>
                  <span className="text-[11px] text-muted-foreground ms-auto">{new Date(r.created_at).toLocaleDateString("ar")}</span>
                </div>
                {r.comment && <p className="text-sm">{r.comment}</p>}
                {r.reply ? (
                  <div className="rounded-2xl bg-primary/5 border border-primary/20 p-3">
                    <p className="text-[10px] font-bold text-primary mb-1">ردّك • {r.reply_at && new Date(r.reply_at).toLocaleDateString("ar")}</p>
                    <p className="text-xs">{r.reply}</p>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input value={replyDraft[r.id] || ""} onChange={(e) => setReplyDraft((x) => ({ ...x, [r.id]: e.target.value }))}
                      placeholder="اكتب ردّاً…"
                      className="flex-1 rounded-2xl border border-input bg-background px-3 py-2 text-sm" />
                    <button onClick={() => submitReply(r.id)} className="rounded-2xl gradient-primary text-primary-foreground px-3 flex items-center gap-1 text-xs font-bold shadow-glow">
                      <Send size={12} /> رد
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>}
    </section>
  );
}
