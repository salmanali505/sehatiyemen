import { useEffect, useState } from "react";
import { Percent, Plus, Trash2, Loader2, Send, Save, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ImageUploader from "@/components/admin/ImageUploader";
import ModerationBadge from "./ModerationBadge";

type Offer = any;

export default function OffersManager({ providerIds }: { providerIds: string[] }) {
  const [items, setItems] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Offer | null>(null);

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [providerIds.join("|")]);

  async function load() {
    if (!providerIds.length) { setItems([]); setLoading(false); return; }
    setLoading(true);
    const { data } = await (supabase as any).from("offers").select("*")
      .in("provider_id", providerIds).order("created_at", { ascending: false });
    setItems(data ?? []);
    setLoading(false);
  }

  function newDraft() {
    setEditing({
      title: "", description: "", kind: "offer",
      provider_id: providerIds[0], active: true, moderation_status: "draft",
      discount_percent: null, image_url: null, code: "", starts_at: null, ends_at: null,
    });
  }

  async function persist(submit: boolean) {
    if (!editing?.title?.trim()) return toast.error("العنوان مطلوب");
    const payload: any = { ...editing };
    if (submit) { payload.moderation_status = "pending_review"; payload.submitted_at = new Date().toISOString(); payload.rejection_reason = null; }
    let res;
    if (editing.id) res = await (supabase as any).from("offers").update(payload).eq("id", editing.id);
    else res = await (supabase as any).from("offers").insert(payload);
    if (res.error) return toast.error(res.error.message);
    toast.success(submit ? "تم الإرسال للمراجعة" : "تم الحفظ");
    setEditing(null); load();
  }

  async function del(id: string) {
    if (!confirm("حذف العرض؟")) return;
    const { error } = await (supabase as any).from("offers").delete().eq("id", id);
    if (error) return toast.error(error.message);
    load();
  }

  if (!providerIds.length) return null;

  return (
    <section className="rounded-3xl border bg-card overflow-hidden shadow-sm">
      <div className="p-4 border-b flex items-center gap-2">
        <Percent size={18} className="text-primary" />
        <h2 className="font-extrabold">العروض والخصومات</h2>
        <span className="text-xs text-muted-foreground">({items.length})</span>
        <button onClick={newDraft} className="ms-auto rounded-2xl gradient-primary text-primary-foreground px-3 py-1.5 text-xs font-bold shadow-glow flex items-center gap-1">
          <Plus size={12} /> جديد
        </button>
      </div>

      {loading ? <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>
        : items.length === 0 ? <p className="p-8 text-center text-sm text-muted-foreground">لا توجد عروض بعد. أضف عرضاً وأرسله للمراجعة.</p>
        : <div className="divide-y">
            {items.map((o) => (
              <div key={o.id} className="p-4 space-y-2">
                <div className="flex flex-wrap items-start gap-2">
                  {o.image_url && <img src={o.image_url} className="w-14 h-14 rounded-2xl object-cover border" />}
                  <div className="flex-1 min-w-[140px]">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-sm">{o.title}</p>
                      <ModerationBadge status={o.moderation_status} />
                      {!o.active && <span className="text-[10px] font-bold rounded-full px-2 py-0.5 bg-muted text-muted-foreground">متوقف</span>}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{o.description}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {o.discount_percent ? `${o.discount_percent}% • ` : ""}
                      {o.code ? `كود: ${o.code}` : ""}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => setEditing(o)} className="rounded-xl bg-muted px-2.5 py-1.5 text-[11px] font-bold">تعديل</button>
                    <button onClick={() => del(o.id)} className="rounded-xl bg-destructive/10 text-destructive p-1.5"><Trash2 size={12} /></button>
                  </div>
                </div>
                {o.moderation_status === "rejected" && o.rejection_reason && (
                  <p className="text-[11px] bg-destructive/10 text-destructive rounded-xl p-2">سبب الرفض: {o.rejection_reason}</p>
                )}
                {o.moderation_status === "needs_edit" && o.rejection_reason && (
                  <p className="text-[11px] bg-primary/10 text-primary rounded-xl p-2">مطلوب التعديل: {o.rejection_reason}</p>
                )}
              </div>
            ))}
          </div>}

      {editing && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur p-4 flex items-center justify-center" onClick={() => setEditing(null)}>
          <div className="bg-card rounded-3xl border max-w-lg w-full max-h-[90vh] overflow-auto p-5 space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-lg flex-1">{editing.id ? "تعديل العرض" : "عرض جديد"}</h3>
              <button onClick={() => setEditing(null)} className="rounded-xl p-1.5 bg-muted"><X size={14} /></button>
            </div>
            {providerIds.length > 1 && (
              <select value={editing.provider_id} onChange={(e) => setEditing({ ...editing, provider_id: e.target.value })}
                className="w-full rounded-2xl border border-input bg-background px-3 py-2 text-sm">
                {providerIds.map((id) => <option key={id} value={id}>{id.slice(0, 8)}…</option>)}
              </select>
            )}
            <select value={editing.kind} onChange={(e) => setEditing({ ...editing, kind: e.target.value })}
              className="w-full rounded-2xl border border-input bg-background px-3 py-2 text-sm">
              <option value="offer">عرض</option>
              <option value="discount">خصم</option>
              <option value="coupon">كوبون</option>
              <option value="campaign">حملة</option>
            </select>
            <input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} placeholder="العنوان"
              className="w-full rounded-2xl border border-input bg-background px-3 py-2 text-sm" />
            <textarea value={editing.description || ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} placeholder="الوصف" rows={2}
              className="w-full rounded-2xl border border-input bg-background px-3 py-2 text-sm" />
            <ImageUploader value={editing.image_url} onChange={(u) => setEditing({ ...editing, image_url: u })} folder={`offers/${editing.provider_id}`} label="صورة العرض" aspect="cover" />
            <div className="grid grid-cols-2 gap-2">
              <input value={editing.code || ""} onChange={(e) => setEditing({ ...editing, code: e.target.value })} placeholder="كود (اختياري)" dir="ltr"
                className="rounded-2xl border border-input bg-background px-3 py-2 text-sm" />
              <input type="number" value={editing.discount_percent ?? ""} onChange={(e) => setEditing({ ...editing, discount_percent: e.target.value ? +e.target.value : null })} placeholder="% الخصم"
                className="rounded-2xl border border-input bg-background px-3 py-2 text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <label className="text-[11px] font-bold">يبدأ
                <input type="datetime-local" defaultValue={editing.starts_at ? editing.starts_at.slice(0, 16) : ""} onChange={(e) => setEditing({ ...editing, starts_at: e.target.value ? new Date(e.target.value).toISOString() : null })}
                  className="mt-1 w-full rounded-2xl border border-input bg-background px-3 py-2 text-sm" />
              </label>
              <label className="text-[11px] font-bold">ينتهي
                <input type="datetime-local" defaultValue={editing.ends_at ? editing.ends_at.slice(0, 16) : ""} onChange={(e) => setEditing({ ...editing, ends_at: e.target.value ? new Date(e.target.value).toISOString() : null })}
                  className="mt-1 w-full rounded-2xl border border-input bg-background px-3 py-2 text-sm" />
              </label>
            </div>
            <label className="flex items-center gap-2 text-xs">
              <input type="checkbox" checked={!!editing.active} onChange={(e) => setEditing({ ...editing, active: e.target.checked })} /> نشط
            </label>
            <div className="flex gap-2 pt-2">
              <button onClick={() => persist(false)} className="flex-1 rounded-2xl bg-muted py-2.5 font-bold flex items-center justify-center gap-1"><Save size={14} /> حفظ مسودة</button>
              <button onClick={() => persist(true)} className="flex-1 rounded-2xl gradient-primary text-primary-foreground py-2.5 font-bold shadow-glow flex items-center justify-center gap-1"><Send size={14} /> إرسال للمراجعة</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
