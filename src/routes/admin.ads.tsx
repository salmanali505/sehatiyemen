import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Megaphone, Plus, Trash2, Loader2, Check, X, AlertTriangle } from "lucide-react";
import AdminShell, { EmptyState } from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import ImageUploader from "@/components/admin/ImageUploader";
import { toast } from "sonner";
import ModerationBadge from "@/components/dashboard/ModerationBadge";

export const Route = createFileRoute("/admin/ads")({
  head: () => ({ meta: [{ title: "الإعلانات | الإدارة" }] }),
  component: AdsAdmin,
});

const TABS = [
  { k: "pending_review", t: "قيد المراجعة" },
  { k: "approved", t: "معتمدة" },
  { k: "rejected", t: "مرفوضة" },
  { k: "needs_edit", t: "يحتاج تعديل" },
  { k: "draft", t: "مسودات" },
  { k: "all", t: "الكل" },
];

function AdsAdmin() {
  const [items, setItems] = useState<any[]>([]);
  const [tab, setTab] = useState("pending_review");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState<any | null>(null);

  useEffect(() => { load(); }, [tab]);
  async function load() {
    setLoading(true);
    let qb = (supabase as any).from("ads").select("*").order("priority", { ascending: false });
    if (tab !== "all") qb = qb.eq("moderation_status", tab);
    const { data } = await qb;
    setItems(data ?? []);
    setLoading(false);
  }
  async function save() {
    if (!creating?.title?.trim()) return toast.error("العنوان مطلوب");
    const { error } = await (supabase as any).from("ads").insert({ ...creating, moderation_status: "approved" });
    if (error) return toast.error(error.message);
    toast.success("تم"); setCreating(null); load();
  }
  async function del(id: string) {
    if (!confirm("حذف؟")) return;
    await (supabase as any).from("ads").delete().eq("id", id); load();
  }
  async function moderate(id: string, status: string, reason?: string | null) {
    const patch: any = { moderation_status: status, reviewed_at: new Date().toISOString(), rejection_reason: reason ?? null };
    if (status === "approved") patch.active = true;
    const { error } = await (supabase as any).from("ads").update(patch).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("تم"); load();
  }

  return (
    <AdminShell title="مركز إدارة الإعلانات" subtitle="مراجعة واعتماد الإعلانات المرسلة من المزودين" icon={Megaphone}
      actions={<button onClick={() => setCreating({ title: "", placement: "home_banner", active: true, priority: 0 })}
        className="rounded-2xl gradient-primary text-primary-foreground px-3 py-2 text-xs font-bold shadow-glow flex items-center gap-1"><Plus size={14} /> إعلان</button>}>
      <div className="flex gap-2 overflow-x-auto">
        {TABS.map((t) => (
          <button key={t.k} onClick={() => setTab(t.k)}
            className={`shrink-0 rounded-2xl px-3 py-1.5 text-[11px] font-bold ${tab === t.k ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
            {t.t}
          </button>
        ))}
      </div>

      {loading ? <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>
        : items.length === 0 ? <EmptyState icon={Megaphone} title="لا توجد إعلانات" />
        : <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {items.map((a) => (
              <div key={a.id} className="rounded-3xl border bg-card overflow-hidden">
                {a.image_url && <img src={a.image_url} className="w-full h-32 object-cover" />}
                <div className="p-3 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-bold text-sm flex-1">{a.title}</h4>
                    <ModerationBadge status={a.moderation_status} />
                  </div>
                  <p className="text-[10px] text-muted-foreground">{a.placement} • أولوية: {a.priority}</p>
                  {a.rejection_reason && <p className="text-[10px] bg-muted/60 rounded-xl p-1.5">💬 {a.rejection_reason}</p>}
                  <div className="flex gap-1 flex-wrap">
                    <button onClick={() => moderate(a.id, "approved")} className="flex-1 text-[10px] font-bold rounded-xl bg-success/15 text-success py-1.5 flex items-center justify-center gap-1"><Check size={10} /> اعتماد</button>
                    <button onClick={() => { const r = prompt("سبب الرفض:"); if (r) moderate(a.id, "rejected", r); }} className="flex-1 text-[10px] font-bold rounded-xl bg-destructive/15 text-destructive py-1.5 flex items-center justify-center gap-1"><X size={10} /> رفض</button>
                    <button onClick={() => { const r = prompt("التعديل المطلوب:"); if (r) moderate(a.id, "needs_edit", r); }} className="text-[10px] font-bold rounded-xl bg-primary/15 text-primary px-2 flex items-center gap-1"><AlertTriangle size={10} /></button>
                    <button onClick={() => del(a.id)} className="rounded-xl bg-destructive/10 text-destructive px-2"><Trash2 size={12} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>}

      {creating && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur p-4 flex items-center justify-center" onClick={() => setCreating(null)}>
          <div className="bg-card rounded-3xl border max-w-lg w-full max-h-[90vh] overflow-auto p-5 space-y-3" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-extrabold text-lg">إعلان جديد</h3>
            <input value={creating.title} onChange={(e) => setCreating({ ...creating, title: e.target.value })} placeholder="العنوان"
              className="w-full rounded-2xl border border-input bg-background px-3 py-2 text-sm" />
            <input value={creating.subtitle || ""} onChange={(e) => setCreating({ ...creating, subtitle: e.target.value })} placeholder="العنوان الفرعي"
              className="w-full rounded-2xl border border-input bg-background px-3 py-2 text-sm" />
            <ImageUploader value={creating.image_url} onChange={(u) => setCreating({ ...creating, image_url: u })} folder="ads" label="صورة الإعلان" />
            <select value={creating.placement} onChange={(e) => setCreating({ ...creating, placement: e.target.value })}
              className="w-full rounded-2xl border border-input bg-background px-3 py-2 text-sm">
              <option value="home_banner">بنر الرئيسية</option>
              <option value="home_video">فيديو الرئيسية</option>
              <option value="search">صفحة البحث</option>
              <option value="provider">صفحة المزود</option>
            </select>
            <input value={creating.link_url || ""} onChange={(e) => setCreating({ ...creating, link_url: e.target.value })} placeholder="رابط الإعلان (اختياري)" dir="ltr"
              className="w-full rounded-2xl border border-input bg-background px-3 py-2 text-sm" />
            <div className="grid grid-cols-2 gap-2">
              <label className="text-xs"><span className="font-bold">يبدأ</span>
                <input type="datetime-local" onChange={(e) => setCreating({ ...creating, starts_at: e.target.value ? new Date(e.target.value).toISOString() : null })}
                  className="w-full rounded-2xl border border-input bg-background px-3 py-2 text-sm mt-1" /></label>
              <label className="text-xs"><span className="font-bold">ينتهي</span>
                <input type="datetime-local" onChange={(e) => setCreating({ ...creating, ends_at: e.target.value ? new Date(e.target.value).toISOString() : null })}
                  className="w-full rounded-2xl border border-input bg-background px-3 py-2 text-sm mt-1" /></label>
            </div>
            <input type="number" value={creating.priority} onChange={(e) => setCreating({ ...creating, priority: +e.target.value })} placeholder="الأولوية"
              className="w-full rounded-2xl border border-input bg-background px-3 py-2 text-sm" />
            <div className="flex gap-2 pt-2">
              <button onClick={save} className="flex-1 rounded-2xl gradient-primary text-primary-foreground py-2.5 font-bold shadow-glow">حفظ</button>
              <button onClick={() => setCreating(null)} className="rounded-2xl bg-muted px-4">إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
