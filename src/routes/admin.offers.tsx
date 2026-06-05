import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Percent, Plus, Trash2, Loader2, Check } from "lucide-react";
import AdminShell, { EmptyState } from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/offers")({
  head: () => ({ meta: [{ title: "العروض والخصومات | الإدارة" }] }),
  component: OffersAdmin,
});

function OffersAdmin() {
  const [items, setItems] = useState<any[]>([]);
  const [kind, setKind] = useState("offer");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState<any | null>(null);

  useEffect(() => { load(); }, [kind]);
  async function load() {
    setLoading(true);
    const { data } = await supabase.from("offers").select("*").eq("kind", kind).order("created_at", { ascending: false });
    setItems(data ?? []);
    setLoading(false);
  }
  async function save() {
    if (!creating?.title?.trim()) return toast.error("العنوان مطلوب");
    const { error } = await supabase.from("offers").insert({ ...creating, kind });
    if (error) return toast.error(error.message);
    setCreating(null); load();
  }
  async function approve(id: string, v: boolean) {
    await supabase.from("offers").update({ approved: v }).eq("id", id);
    load();
  }
  async function del(id: string) {
    if (!confirm("حذف؟")) return;
    await supabase.from("offers").delete().eq("id", id); load();
  }

  const KINDS = [{ k: "offer", t: "عروض" }, { k: "discount", t: "خصومات" }, { k: "coupon", t: "كوبونات" }, { k: "campaign", t: "حملات" }];

  return (
    <AdminShell title="العروض والخصومات" subtitle="عروض، كوبونات، حملات، جدولة، موافقات" icon={Percent}
      actions={<button onClick={() => setCreating({ title: "", active: true, approved: true })}
        className="rounded-2xl gradient-primary text-primary-foreground px-3 py-2 text-xs font-bold shadow-glow flex items-center gap-1"><Plus size={14} /></button>}>
      <div className="flex gap-2 overflow-x-auto">
        {KINDS.map((t) => (
          <button key={t.k} onClick={() => setKind(t.k)}
            className={`shrink-0 rounded-2xl px-4 py-2 text-xs font-bold ${kind === t.k ? "gradient-primary text-primary-foreground shadow-glow" : "bg-muted text-muted-foreground"}`}>
            {t.t}
          </button>
        ))}
      </div>

      {loading ? <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>
        : items.length === 0 ? <EmptyState icon={Percent} title="لا توجد عناصر" />
        : <div className="rounded-3xl border bg-card overflow-hidden divide-y">
            {items.map((o) => (
              <div key={o.id} className="p-3 flex flex-wrap items-center gap-3">
                <div className="flex-1 min-w-[180px]">
                  <p className="font-bold text-sm">{o.title}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {o.code && <>كود: {o.code} • </>}
                    {o.discount_percent && <>{o.discount_percent}% • </>}
                    {o.starts_at && <>من {new Date(o.starts_at).toLocaleDateString("ar")} </>}
                    {o.ends_at && <>إلى {new Date(o.ends_at).toLocaleDateString("ar")}</>}
                  </p>
                </div>
                <button onClick={() => approve(o.id, !o.approved)}
                  className={`text-[10px] font-bold rounded-xl px-2 py-1 flex items-center gap-1 ${o.approved ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>
                  <Check size={10} /> {o.approved ? "معتمد" : "قيد الموافقة"}
                </button>
                <button onClick={() => del(o.id)} className="rounded-xl bg-destructive/10 text-destructive p-1.5"><Trash2 size={12} /></button>
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
