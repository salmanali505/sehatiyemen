import { useEffect, useState } from "react";
import { Star, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

type Review = { id: string; user_id: string; rating: number; comment: string | null; created_at: string };

export function ReviewsSection({ providerId }: { providerId: string }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { load(); }, [providerId]);

  async function load() {
    const { data } = await supabase.from("reviews").select("*").eq("provider_id", providerId).order("created_at", { ascending: false });
    setReviews((data ?? []) as Review[]);
  }

  async function submit() {
    if (!user) return toast.error("يجب تسجيل الدخول أولاً");
    if (!comment.trim()) return toast.error("اكتب تقييمك");
    setSubmitting(true);
    const { error } = await supabase.from("reviews").insert({
      user_id: user.id, provider_id: providerId, rating, comment,
    });
    setSubmitting(false);
    if (error) return toast.error(error.message);
    toast.success("شكراً على تقييمك");
    setComment(""); setRating(5); load();
  }

  const avg = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : "0.0";

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-3xl p-5 text-center">
        <div className="text-4xl font-black text-primary">{avg}</div>
        <div className="flex justify-center gap-1 mt-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star key={i} size={18} className={i <= Math.round(Number(avg)) ? "text-warning fill-warning" : "text-muted"} />
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-1">{reviews.length} تقييم</p>
      </div>

      {user && (
        <div className="bg-card rounded-3xl p-4 shadow-card border border-border/40 space-y-3">
          <p className="text-sm font-bold">شاركنا رأيك</p>
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <button key={i} onClick={() => setRating(i)}>
                <Star size={28} className={i <= rating ? "text-warning fill-warning" : "text-muted"} />
              </button>
            ))}
          </div>
          <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={2}
            placeholder="اكتب تجربتك..." className="w-full bg-muted rounded-2xl px-4 py-3 text-sm outline-none resize-none" />
          <button onClick={submit} disabled={submitting}
            className="w-full gradient-primary text-primary-foreground py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50">
            <Send size={14} /> إرسال التقييم
          </button>
        </div>
      )}

      <div className="space-y-2">
        {reviews.map((r) => (
          <div key={r.id} className="bg-card rounded-2xl p-4 shadow-card border border-border/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} size={12} className={i <= r.rating ? "text-warning fill-warning" : "text-muted"} />
                ))}
              </div>
              <span className="text-[10px] text-muted-foreground">{new Date(r.created_at).toLocaleDateString("ar")}</span>
            </div>
            {r.comment && <p className="text-sm mt-2 text-foreground/90">{r.comment}</p>}
          </div>
        ))}
        {reviews.length === 0 && (
          <p className="text-center text-xs text-muted-foreground py-6">لا توجد تقييمات بعد، كن أول من يقيّم</p>
        )}
      </div>
    </div>
  );
}
