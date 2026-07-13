import { useEffect, useState } from "react";
import { Megaphone, Plus, Trash2, Loader2, Send, Save, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ImageUploader from "@/components/admin/ImageUploader";
import ModerationBadge from "./ModerationBadge";

type Ad = any;

export default function AdsManager({ providerIds }: { providerIds: string[] }) {
  const [items, setItems] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Ad | null>(null);

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [providerIds.join("|")]);

  async function load() {
    if (!providerIds.length) { setItems([]); setLoading(false); return; }
    setLoading(true);
    const { data } = await (supabase as any).from("ads").select("*")
      .in("provider_id", providerIds).order("created_at", { ascending: false });
    setItems(data ?? []);
    setLoading(false);
  }

  function newDraft() {
    setEditing({
      title: "", subtitle: "", placement: "home_banner",
      provider_id: providerIds[0], active: true, priority: 0,
      moderation_status: "draft", image_url: null, link_url: "", starts_at: null, ends_at: null,
    });
  }

  async function persist(submit: boolean) {
    if (!editing?.title?.trim()) return toast.error("العنوان مطلوب");
    const payload: any = { ...editing };
    if (submit) { payload.moderation_status = "pending_review"; payload.submitted_at = new Date().toISOString(); payload.rejection_reason = null; }
    let res;
    if (editing.id) res = await (supabase as any).from("ads").update(payload).eq("id", editing.id);
    else res = await (supabase as any).from("ads").insert(payload);
    if (res.error) return toast.error(res.error.message);
    toast.success(submit ? "تم الإرسال للمراجعة" : "تم الحفظ");
    setEditing(null); load();
  }

  async function del(id: string) {
    if (!confirm("حذف الإعلان؟")) return;
    const { error } = await (supabase as any).from("ads").delete().eq("id", id);
    if (error) return toast.error(error.message);
    load();
  }

  if (!providerIds.length) return null;

  return (
    <section className="rounded-3xl border bg-card overflow-hidden shadow-sm">
      <div className="p-4 border-b flex items-center gap-2">
        <Megaphone size={18} className="text-primary" />
        <h2 className="font-extrabold">الإعلانات والبنرات</h2>
        <span className="text-xs text-muted-foreground">({items.length})</span>
        <button onClick={newDraft} className="ms-auto rounded-2xl gradient-primary text-primary-foreground px-3 py-1.5 text-xs font-bold shadow-glow flex items-center gap-1">
          <Plus size={12} /> جديد
        </button>
      </div>

      {loading ? <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>
        : items.length === 0 ? <p className="p-8 text-center text-sm text-muted-foreground">لا توجد إعلانات بعد.</p>
        : <div className="p-3 grid sm:grid-cols-2 gap-3">
            {items.map((a) => (
              <div key={a.id} className="rounded-3xl border bg-background overflow-hidden">
                {a.image_url && <img src={a.image_url} className="w-full h-28 object-cover" />}
                <div className="p-3 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-sm flex-1">{a.title}</p>
                    <ModerationBadge status={a.moderation_status} />
                  </div>
                  <p className="text-[10px] text-muted-foreground">{a.placement} • أولوية: {a.priority}</p>
                  {a.moderation_status === "rejected" && a.rejection_reason && (
                    <p className="text-[10px] bg-destructive/10 text-destructive rounded-xl p-1.5">{a.rejection_reason}</p>
                  )}
                  {a.moderation_status === "needs_edit" && a.rejection_reason && (
                    <p className="text-[10px] bg-primary/10 text-primary rounded-xl p-1.5">{a.rejection_reason}</p>
                  )}
                  <div className="flex gap-2">
                    <button onClick={() => setEditing(a)} className="flex-1 rounded-xl bg-muted text-[11px] font-bold py-1.5">تعديل</button>
                    <button onClick={() => del(a.id)} className="rounded-xl bg-destructive/10 text-destructive px-2"><Trash2 size={12} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>}

      {editing && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur p-4 flex items-center justify-center" onClick={() => setEditing(null)}>
          <div className="bg-card rounded-3xl border max-w-lg w-full max-h-[90vh] overflow-auto p-5 space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-lg flex-1">{editing.id ? "تعديل الإعلان" : "إعلان جديد"}</h3>
              <button onClick={() => setEditing(null)} className="rounded-xl p-1.5 bg-muted"><X size={14} /></button>
            </div>
            <input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} placeholder="العنوان"
              className="w-full rounded-2xl border border-input bg-background px-3 py-2 text-sm" />
            <input value={editing.subtitle || ""} onChange={(e) => setEditing({ ...editing, subtitle: e.target.value })} placeholder="العنوان الفرعي"
              className="w-full rounded-2xl border border-input bg-background px-3 py-2 text-sm" />
            <ImageUploader value={editing.image_url} onChange={(u) => setEditing({ ...editing, image_url: u })} folder={`ads/${editing.provider_id}`} aspect="cover" label="صورة الإعلان" />
            <select value={editing.placement} onChange={(e) => setEditing({ ...editing, placement: e.target.value })}
              className="w-full rounded-2xl border border-input bg-background px-3 py-2 text-sm">
              <option value="home_banner">بنر الرئيسية</option>
              <option value="search">صفحة البحث</option>
              <option value="provider">صفحة المزود</option>
            </select>
            <input value={editing.link_url || ""} onChange={(e) => setEditing({ ...editing, link_url: e.target.value })} placeholder="رابط (اختياري)" dir="ltr"
              className="w-full rounded-2xl border border-input bg-background px-3 py-2 text-sm" />
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
