import { useEffect, useState } from "react";
import { Stethoscope, Plus, Trash2, Loader2, Save, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ImageUploader from "@/components/admin/ImageUploader";

type Service = any;

export default function ServicesManager({ providerIds }: { providerIds: string[] }) {
  const [items, setItems] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Service | null>(null);

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [providerIds.join("|")]);

  async function load() {
    if (!providerIds.length) { setItems([]); setLoading(false); return; }
    setLoading(true);
    const { data } = await (supabase as any).from("provider_services").select("*")
      .in("provider_id", providerIds).order("sort_order").order("created_at");
    setItems(data ?? []);
    setLoading(false);
  }

  function newDraft() {
    setEditing({ provider_id: providerIds[0], name: "", description: "", price: null, currency: "YER", duration_minutes: null, image_url: null, active: true, sort_order: 0 });
  }

  async function save() {
    if (!editing?.name?.trim()) return toast.error("اسم الخدمة مطلوب");
    let res;
    if (editing.id) res = await (supabase as any).from("provider_services").update(editing).eq("id", editing.id);
    else res = await (supabase as any).from("provider_services").insert(editing);
    if (res.error) return toast.error(res.error.message);
    toast.success("تم الحفظ"); setEditing(null); load();
  }

  async function toggle(id: string, active: boolean) {
    await (supabase as any).from("provider_services").update({ active: !active }).eq("id", id);
    load();
  }

  async function del(id: string) {
    if (!confirm("حذف الخدمة؟")) return;
    await (supabase as any).from("provider_services").delete().eq("id", id);
    load();
  }

  if (!providerIds.length) return null;

  return (
    <section className="rounded-3xl border bg-card overflow-hidden shadow-sm">
      <div className="p-4 border-b flex items-center gap-2">
        <Stethoscope size={18} className="text-primary" />
        <h2 className="font-extrabold">الخدمات المقدمة</h2>
        <span className="text-xs text-muted-foreground">({items.length})</span>
        <button onClick={newDraft} className="ms-auto rounded-2xl gradient-primary text-primary-foreground px-3 py-1.5 text-xs font-bold shadow-glow flex items-center gap-1">
          <Plus size={12} /> جديد
        </button>
      </div>

      {loading ? <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>
        : items.length === 0 ? <p className="p-8 text-center text-sm text-muted-foreground">لم تُضف خدمات بعد.</p>
        : <div className="divide-y">
            {items.map((s) => (
              <div key={s.id} className="p-3 flex items-center gap-3">
                {s.image_url ? <img src={s.image_url} className="w-12 h-12 rounded-2xl object-cover border" />
                  : <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center"><Stethoscope size={16} className="text-primary" /></div>}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-sm truncate">{s.name}</p>
                    {!s.active && <span className="text-[10px] bg-muted text-muted-foreground rounded-full px-2 py-0.5">متوقفة</span>}
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {s.price ? `${Number(s.price).toLocaleString("ar-EG")} ${s.currency || "ر.ي"}` : ""}
                    {s.duration_minutes ? ` • ${s.duration_minutes} د` : ""}
                  </p>
                </div>
                <button onClick={() => toggle(s.id, s.active)} className={`text-[10px] font-bold rounded-xl px-2 py-1 ${s.active ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}`}>
                  {s.active ? "ظاهرة" : "مخفية"}
                </button>
                <button onClick={() => setEditing(s)} className="rounded-xl bg-muted px-2 py-1 text-[11px] font-bold">تعديل</button>
                <button onClick={() => del(s.id)} className="rounded-xl bg-destructive/10 text-destructive p-1.5"><Trash2 size={12} /></button>
              </div>
            ))}
          </div>}

      {editing && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur p-4 flex items-center justify-center" onClick={() => setEditing(null)}>
          <div className="bg-card rounded-3xl border max-w-lg w-full max-h-[90vh] overflow-auto p-5 space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-lg flex-1">{editing.id ? "تعديل الخدمة" : "خدمة جديدة"}</h3>
              <button onClick={() => setEditing(null)} className="rounded-xl p-1.5 bg-muted"><X size={14} /></button>
            </div>
            {providerIds.length > 1 && (
              <select value={editing.provider_id} onChange={(e) => setEditing({ ...editing, provider_id: e.target.value })}
                className="w-full rounded-2xl border border-input bg-background px-3 py-2 text-sm">
                {providerIds.map((id) => <option key={id} value={id}>{id.slice(0, 8)}…</option>)}
              </select>
            )}
            <input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} placeholder="اسم الخدمة"
              className="w-full rounded-2xl border border-input bg-background px-3 py-2 text-sm" />
            <textarea value={editing.description || ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} placeholder="الوصف" rows={2}
              className="w-full rounded-2xl border border-input bg-background px-3 py-2 text-sm" />
            <ImageUploader value={editing.image_url} onChange={(u) => setEditing({ ...editing, image_url: u })} folder={`services/${editing.provider_id}`} aspect="square" label="صورة الخدمة" />
            <div className="grid grid-cols-3 gap-2">
              <input type="number" value={editing.price ?? ""} onChange={(e) => setEditing({ ...editing, price: e.target.value ? +e.target.value : null })} placeholder="السعر"
                className="rounded-2xl border border-input bg-background px-3 py-2 text-sm" />
              <input value={editing.currency || "YER"} onChange={(e) => setEditing({ ...editing, currency: e.target.value })} placeholder="العملة"
                className="rounded-2xl border border-input bg-background px-3 py-2 text-sm" />
              <input type="number" value={editing.duration_minutes ?? ""} onChange={(e) => setEditing({ ...editing, duration_minutes: e.target.value ? +e.target.value : null })} placeholder="المدة (د)"
                className="rounded-2xl border border-input bg-background px-3 py-2 text-sm" />
            </div>
            <label className="flex items-center gap-2 text-xs">
              <input type="checkbox" checked={!!editing.active} onChange={(e) => setEditing({ ...editing, active: e.target.checked })} /> ظاهرة للمستخدمين
            </label>
            <button onClick={save} className="w-full rounded-2xl gradient-primary text-primary-foreground py-2.5 font-bold shadow-glow flex items-center justify-center gap-1"><Save size={14} /> حفظ</button>
          </div>
        </div>
      )}
    </section>
  );
}
