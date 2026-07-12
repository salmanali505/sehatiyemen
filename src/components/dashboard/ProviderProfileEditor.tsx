import { useEffect, useState } from "react";
import { Building2, Loader2, Save, Image as ImageIcon, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ImageUploader from "@/components/admin/ImageUploader";

type Provider = {
  id: string;
  name: string;
  type: string;
  city: string | null;
  address: string | null;
  phone: string | null;
  description: string | null;
  image_url: string | null;
  logo_url: string | null;
  cover_url: string | null;
  gallery_urls: string[] | null;
  status: string;
  verified: boolean;
  featured: boolean;
  rating: number | null;
};

export default function ProviderProfileEditor({ userId }: { userId: string }) {
  const [items, setItems] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Provider | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [userId]);
  async function load() {
    setLoading(true);
    const { data } = await supabase.from("providers").select("*").eq("owner_user_id", userId).order("created_at");
    const list = (data ?? []) as Provider[];
    setItems(list);
    if (list.length && !selectedId) { setSelectedId(list[0].id); setDraft(list[0]); }
    setLoading(false);
  }

  function pick(id: string) {
    const p = items.find((x) => x.id === id);
    if (p) { setSelectedId(id); setDraft(p); }
  }

  async function save() {
    if (!draft) return;
    setSaving(true);
    const { error } = await supabase.from("providers").update({
      name: draft.name, city: draft.city, address: draft.address, phone: draft.phone,
      description: draft.description, image_url: draft.image_url, logo_url: draft.logo_url,
      cover_url: draft.cover_url, gallery_urls: draft.gallery_urls,
    }).eq("id", draft.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("تم حفظ ملف المنشأة");
    load();
  }

  async function toggleVisibility() {
    if (!draft) return;
    const next = draft.status === "active" ? "inactive" : "active";
    const { error } = await supabase.from("providers").update({ status: next as any }).eq("id", draft.id);
    if (error) return toast.error(error.message);
    setDraft({ ...draft, status: next });
    toast.success(next === "active" ? "أصبح النشاط ظاهراً" : "تم إخفاء النشاط");
  }

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>;
  if (!items.length) return null;

  const p = draft!;
  const gallery = p.gallery_urls ?? [];

  return (
    <section className="rounded-3xl border bg-card overflow-hidden shadow-sm">
      <div className="p-4 border-b flex items-center gap-2">
        <Building2 size={18} className="text-primary" />
        <h2 className="font-extrabold">إدارة ملف النشاط</h2>
      </div>

      {items.length > 1 && (
        <div className="p-3 flex gap-2 overflow-x-auto border-b">
          {items.map((x) => (
            <button key={x.id} onClick={() => pick(x.id)}
              className={`shrink-0 rounded-xl px-3 py-1.5 text-xs font-bold ${selectedId === x.id ? "gradient-primary text-primary-foreground shadow-glow" : "bg-muted text-muted-foreground"}`}>
              {x.name}
            </button>
          ))}
        </div>
      )}

      <div className="p-4 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`text-[10px] font-bold rounded-full px-2 py-0.5 ${p.status === "active" ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}`}>
            {p.status === "active" ? "ظاهر للعامة" : "مخفي"}
          </span>
          {p.verified && <span className="text-[10px] font-bold rounded-full px-2 py-0.5 bg-primary/10 text-primary">موثّق</span>}
          {p.featured && <span className="text-[10px] font-bold rounded-full px-2 py-0.5 bg-warning/15 text-warning">مميز</span>}
          <button onClick={toggleVisibility}
            className="ms-auto text-xs font-bold rounded-xl bg-muted hover:bg-muted/70 px-3 py-1.5">
            {p.status === "active" ? "إخفاء النشاط" : "إظهار النشاط"}
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          <label className="text-xs font-bold">اسم النشاط
            <input value={p.name} onChange={(e) => setDraft({ ...p, name: e.target.value })}
              className="mt-1 w-full rounded-2xl border border-input bg-background px-3 py-2 text-sm" />
          </label>
          <label className="text-xs font-bold">المدينة
            <input value={p.city ?? ""} onChange={(e) => setDraft({ ...p, city: e.target.value })}
              className="mt-1 w-full rounded-2xl border border-input bg-background px-3 py-2 text-sm" />
          </label>
          <label className="text-xs font-bold">الهاتف
            <input value={p.phone ?? ""} onChange={(e) => setDraft({ ...p, phone: e.target.value })} dir="ltr"
              className="mt-1 w-full rounded-2xl border border-input bg-background px-3 py-2 text-sm" />
          </label>
          <label className="text-xs font-bold">العنوان
            <input value={p.address ?? ""} onChange={(e) => setDraft({ ...p, address: e.target.value })}
              className="mt-1 w-full rounded-2xl border border-input bg-background px-3 py-2 text-sm" />
          </label>
        </div>

        <label className="text-xs font-bold block">وصف النشاط
          <textarea rows={3} value={p.description ?? ""} onChange={(e) => setDraft({ ...p, description: e.target.value })}
            className="mt-1 w-full rounded-2xl border border-input bg-background px-3 py-2 text-sm" />
        </label>

        <div className="grid md:grid-cols-3 gap-3">
          <div>
            <p className="text-xs font-bold mb-1">الشعار</p>
            <ImageUploader value={p.logo_url} onChange={(u) => setDraft({ ...p, logo_url: u })} folder={`providers/${p.id}/logo`} aspect="square" label="ارفع الشعار" />
          </div>
          <div>
            <p className="text-xs font-bold mb-1">الصورة الرئيسية</p>
            <ImageUploader value={p.image_url} onChange={(u) => setDraft({ ...p, image_url: u })} folder={`providers/${p.id}/main`} aspect="cover" label="ارفع الصورة" />
          </div>
          <div>
            <p className="text-xs font-bold mb-1">صورة الغلاف</p>
            <ImageUploader value={p.cover_url} onChange={(u) => setDraft({ ...p, cover_url: u })} folder={`providers/${p.id}/cover`} aspect="cover" label="ارفع الغلاف" />
          </div>
        </div>

        <div>
          <p className="text-xs font-bold mb-2 flex items-center gap-1"><ImageIcon size={12} /> معرض الصور ({gallery.length})</p>
          <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
            {gallery.map((url, idx) => (
              <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border">
                <img src={url} className="w-full h-full object-cover" />
                <button onClick={() => setDraft({ ...p, gallery_urls: gallery.filter((_, i) => i !== idx) })}
                  className="absolute top-1 left-1 w-7 h-7 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow"><X size={12} /></button>
              </div>
            ))}
            <div className="aspect-square">
              <ImageUploader value={null} onChange={(u) => u && setDraft({ ...p, gallery_urls: [...gallery, u] })}
                folder={`providers/${p.id}/gallery`} aspect="square" label="+ صورة" />
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <button onClick={save} disabled={saving}
            className="flex-1 rounded-2xl gradient-primary text-primary-foreground py-2.5 font-bold shadow-glow flex items-center justify-center gap-2 disabled:opacity-60">
            {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} حفظ التغييرات
          </button>
        </div>
      </div>
    </section>
  );
}
