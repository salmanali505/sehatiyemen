import { useEffect, useState } from "react";
import { UserCog, Plus, Trash2, Loader2, Save, X, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ImageUploader from "@/components/admin/ImageUploader";

type Doc = any;

export default function DoctorsManager({ providerIds }: { providerIds: string[] }) {
  const [items, setItems] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Doc | null>(null);

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [providerIds.join("|")]);

  async function load() {
    if (!providerIds.length) { setItems([]); setLoading(false); return; }
    setLoading(true);
    const { data } = await (supabase as any).from("provider_doctors").select("*")
      .in("provider_id", providerIds).order("sort_order").order("created_at");
    setItems(data ?? []);
    setLoading(false);
  }

  function newDraft() {
    setEditing({ provider_id: providerIds[0], name: "", specialty: "", bio: "", photo_url: null, years_experience: null, featured: false, active: true, sort_order: 0 });
  }

  async function save() {
    if (!editing?.name?.trim()) return toast.error("اسم الطبيب مطلوب");
    let res;
    if (editing.id) res = await (supabase as any).from("provider_doctors").update(editing).eq("id", editing.id);
    else res = await (supabase as any).from("provider_doctors").insert(editing);
    if (res.error) return toast.error(res.error.message);
    toast.success("تم الحفظ"); setEditing(null); load();
  }

  async function toggleFeatured(id: string, v: boolean) {
    await (supabase as any).from("provider_doctors").update({ featured: !v }).eq("id", id);
    load();
  }

  async function del(id: string) {
    if (!confirm("حذف الطبيب؟")) return;
    await (supabase as any).from("provider_doctors").delete().eq("id", id);
    load();
  }

  if (!providerIds.length) return null;

  return (
    <section className="rounded-3xl border bg-card overflow-hidden shadow-sm">
      <div className="p-4 border-b flex items-center gap-2">
        <UserCog size={18} className="text-primary" />
        <h2 className="font-extrabold">الأطباء والطاقم</h2>
        <span className="text-xs text-muted-foreground">({items.length})</span>
        <button onClick={newDraft} className="ms-auto rounded-2xl gradient-primary text-primary-foreground px-3 py-1.5 text-xs font-bold shadow-glow flex items-center gap-1">
          <Plus size={12} /> جديد
        </button>
      </div>

      {loading ? <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>
        : items.length === 0 ? <p className="p-8 text-center text-sm text-muted-foreground">لم يُضف أطباء بعد.</p>
        : <div className="p-3 grid sm:grid-cols-2 gap-3">
            {items.map((d) => (
              <div key={d.id} className="rounded-3xl border bg-background p-3 flex gap-3">
                {d.photo_url ? <img src={d.photo_url} className="w-16 h-16 rounded-2xl object-cover border" />
                  : <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center"><UserCog size={20} className="text-primary" /></div>}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <p className="font-bold text-sm truncate">{d.name}</p>
                    {d.featured && <Star size={12} className="text-warning fill-warning" />}
                  </div>
                  <p className="text-[11px] text-muted-foreground">{d.specialty}</p>
                  {d.years_experience && <p className="text-[10px] text-muted-foreground">{d.years_experience} سنة خبرة</p>}
                  <div className="mt-2 flex gap-1">
                    <button onClick={() => toggleFeatured(d.id, d.featured)} className={`text-[10px] font-bold rounded-xl px-2 py-1 ${d.featured ? "bg-warning/15 text-warning" : "bg-muted"}`}>{d.featured ? "بارز" : "بارز"}</button>
                    <button onClick={() => setEditing(d)} className="rounded-xl bg-muted px-2 py-1 text-[10px] font-bold">تعديل</button>
                    <button onClick={() => del(d.id)} className="rounded-xl bg-destructive/10 text-destructive p-1.5"><Trash2 size={11} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>}

      {editing && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur p-4 flex items-center justify-center" onClick={() => setEditing(null)}>
          <div className="bg-card rounded-3xl border max-w-lg w-full max-h-[90vh] overflow-auto p-5 space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-lg flex-1">{editing.id ? "تعديل الطبيب" : "طبيب جديد"}</h3>
              <button onClick={() => setEditing(null)} className="rounded-xl p-1.5 bg-muted"><X size={14} /></button>
            </div>
            <ImageUploader value={editing.photo_url} onChange={(u) => setEditing({ ...editing, photo_url: u })} folder={`doctors/${editing.provider_id}`} aspect="square" label="صورة الطبيب" />
            <input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} placeholder="الاسم"
              className="w-full rounded-2xl border border-input bg-background px-3 py-2 text-sm" />
            <input value={editing.specialty || ""} onChange={(e) => setEditing({ ...editing, specialty: e.target.value })} placeholder="التخصص"
              className="w-full rounded-2xl border border-input bg-background px-3 py-2 text-sm" />
            <input type="number" value={editing.years_experience ?? ""} onChange={(e) => setEditing({ ...editing, years_experience: e.target.value ? +e.target.value : null })} placeholder="سنوات الخبرة"
              className="w-full rounded-2xl border border-input bg-background px-3 py-2 text-sm" />
            <textarea rows={3} value={editing.bio || ""} onChange={(e) => setEditing({ ...editing, bio: e.target.value })} placeholder="نبذة تعريفية"
              className="w-full rounded-2xl border border-input bg-background px-3 py-2 text-sm" />
            <label className="flex items-center gap-2 text-xs">
              <input type="checkbox" checked={!!editing.featured} onChange={(e) => setEditing({ ...editing, featured: e.target.checked })} /> طبيب بارز
            </label>
            <label className="flex items-center gap-2 text-xs">
              <input type="checkbox" checked={!!editing.active} onChange={(e) => setEditing({ ...editing, active: e.target.checked })} /> نشط
            </label>
            <button onClick={save} className="w-full rounded-2xl gradient-primary text-primary-foreground py-2.5 font-bold shadow-glow flex items-center justify-center gap-1"><Save size={14} /> حفظ</button>
          </div>
        </div>
      )}
    </section>
  );
}
