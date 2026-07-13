import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Percent, Plus, Trash2, Loader2, Check, X, AlertTriangle } from "lucide-react";
import AdminShell, { EmptyState } from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ModerationBadge from "@/components/dashboard/ModerationBadge";

export const Route = createFileRoute("/admin/offers")({
  head: () => ({ meta: [{ title: "العروض والخصومات | الإدارة" }] }),
  component: OffersAdmin,
});

const KINDS = [{ k: "offer", t: "عروض" }, { k: "discount", t: "خصومات" }, { k: "coupon", t: "كوبونات" }, { k: "campaign", t: "حملات" }];
const TABS = [
  { k: "pending_review", t: "قيد المراجعة" },
  { k: "approved", t: "معتمدة" },
  { k: "rejected", t: "مرفوضة" },
  { k: "needs_edit", t: "يحتاج تعديل" },
  { k: "draft", t: "مسودات" },
  { k: "all", t: "الكل" },
];

function OffersAdmin() {
  const [items, setItems] = useState<any[]>([]);
  const [kind, setKind] = useState("offer");
  const [tab, setTab] = useState("pending_review");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState<any | null>(null);

  useEffect(() => { load(); }, [kind, tab]);
  async function load() {
    setLoading(true);
    let q = (supabase as any).from("offers").select("*").eq("kind", kind).order("created_at", { ascending: false });
    if (tab !== "all") q = q.eq("moderation_status", tab);
    const { data } = await q;
    setItems(data ?? []);
    setLoading(false);
  }
  async function save() {
    if (!creating?.title?.trim()) return toast.error("العنوان مطلوب");
    const { error } = await (supabase as any).from("offers").insert({ ...creating, kind, moderation_status: "approved", approved: true });
    if (error) return toast.error(error.message);
    setCreating(null); load();
  }
  async function moderate(id: string, status: string, reason?: string | null) {
    const patch: any = { moderation_status: status, reviewed_at: new Date().toISOString(), rejection_reason: reason ?? null };
    if (status === "approved") patch.approved = true;
    if (status === "rejected") patch.approved = false;
    const { error } = await (supabase as any).from("offers").update(patch).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("تم"); load();
  }
  async function del(id: string) {
    if (!confirm("حذف؟")) return;
    await (supabase as any).from("offers").delete().eq("id", id); load();
  }

  return (
    <AdminShell title="العروض والخصومات" subtitle="مراجعة واعتماد العروض المرسلة من المزودين" icon={Percent}
      actions={<button onClick={() => setCreating({ title: "", active: true })}
        className="rounded-2xl gradient-primary text-primary-foreground px-3 py-2 text-xs font-bold shadow-glow flex items-center gap-1"><Plus size={14} /></button>}>
      <div className="flex gap-2 overflow-x-auto">
        {KINDS.map((t) => (
          <button key={t.k} onClick={() => setKind(t.k)}
            className={`shrink-0 rounded-2xl px-4 py-2 text-xs font-bold ${kind === t.k ? "gradient-primary text-primary-foreground shadow-glow" : "bg-muted text-muted-foreground"}`}>
            {t.t}
          </button>
        ))}
      </div>
      <div className="flex gap-2 overflow-x-auto">
        {TABS.map((t) => (
          <button key={t.k} onClick={() => setTab(t.k)}
            className={`shrink-0 rounded-2xl px-3 py-1.5 text-[11px] font-bold ${tab === t.k ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
            {t.t}
          </button>
        ))}
      </div>

      {loading ? <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>
        : items.length === 0 ? <EmptyState icon={Percent} title="لا توجد عناصر" />
        : <div className="rounded-3xl border bg-card overflow-hidden divide-y">
            {items.map((o) => (
              <div key={o.id} className="p-3 space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  {o.image_url && <img src={o.image_url} className="w-12 h-12 rounded-xl object-cover border" />}
                  <div className="flex-1 min-w-[180px]">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-sm">{o.title}</p>
                      <ModerationBadge status={o.moderation_status} />
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      {o.code && <>كود: {o.code} • </>}
                      {o.discount_percent && <>{o.discount_percent}% • </>}
                      {o.starts_at && <>من {new Date(o.starts_at).toLocaleDateString("ar")} </>}
                      {o.ends_at && <>إلى {new Date(o.ends_at).toLocaleDateString("ar")}</>}
                    </p>
                  </div>
                  <button onClick={() => moderate(o.id, "approved")} className="text-[10px] font-bold rounded-xl bg-success/15 text-success px-2 py-1 flex items-center gap-1"><Check size={10} /> اعتماد</button>
                  <button onClick={() => { const r = prompt("سبب الرفض:"); if (r) moderate(o.id, "rejected", r); }} className="text-[10px] font-bold rounded-xl bg-destructive/15 text-destructive px-2 py-1 flex items-center gap-1"><X size={10} /> رفض</button>
                  <button onClick={() => { const r = prompt("التعديل المطلوب:"); if (r) moderate(o.id, "needs_edit", r); }} className="text-[10px] font-bold rounded-xl bg-primary/15 text-primary px-2 py-1 flex items-center gap-1"><AlertTriangle size={10} /> تعديل</button>
                  <button onClick={() => del(o.id)} className="rounded-xl bg-destructive/10 text-destructive p-1.5"><Trash2 size={12} /></button>
                </div>
                {o.rejection_reason && <p className="text-[11px] bg-muted/60 rounded-xl p-2">💬 {o.rejection_reason}</p>}
              </div>
            ))}
          </div>}

      {creating && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur p-4 flex items-center justify-center" onClick={() => setCreating(null)}>
          <div className="bg-card rounded-3xl border max-w-lg w-full p-5 space-y-3" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-extrabold text-lg">جديد</h3>
            <input value={creating.title} onChange={(e) => setCreating({ ...creating, title: e.target.value })} placeholder="العنوان"
              className="w-full rounded-2xl border border-input bg-background px-3 py-2 text-sm" />
            <textarea value={creating.description || ""} onChange={(e) => setCreating({ ...creating, description: e.target.value })} placeholder="الوصف" rows={2}
              className="w-full rounded-2xl border border-input bg-background px-3 py-2 text-sm" />
            <div className="grid grid-cols-2 gap-2">
              <input value={creating.code || ""} onChange={(e) => setCreating({ ...creating, code: e.target.value })} placeholder="كود (اختياري)" dir="ltr"
                className="rounded-2xl border border-input bg-background px-3 py-2 text-sm" />
              <input type="number" value={creating.discount_percent || ""} onChange={(e) => setCreating({ ...creating, discount_percent: +e.target.value })} placeholder="% الخصم"
                className="rounded-2xl border border-input bg-background px-3 py-2 text-sm" />
            </div>
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
