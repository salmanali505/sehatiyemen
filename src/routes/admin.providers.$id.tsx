import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight, Building2, Loader2, Save, Trash2, MapPin, Phone, ImageIcon, FileText,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { useRoles } from "@/lib/useRoles";
import { supabase } from "@/integrations/supabase/client";
import { useCities } from "@/lib/useCities";

export const Route = createFileRoute("/admin/providers/$id")({
  head: () => ({ meta: [{ title: "مزوّد خدمة | الإدارة" }] }),
  component: ProviderForm,
});

type FormState = {
  name: string;
  type: "hospital" | "clinic" | "lab" | "radiology" | "pharmacy";
  city: string;
  address: string;
  phone: string;
  description: string;
  image_url: string;
  verified: boolean;
  featured: boolean;
  status: "active" | "pending" | "suspended";
};

const EMPTY: FormState = {
  name: "", type: "clinic", city: "", address: "", phone: "",
  description: "", image_url: "", verified: false, featured: false, status: "pending",
};

const TYPES: { value: FormState["type"]; label: string }[] = [
  { value: "hospital", label: "مستشفى" },
  { value: "clinic", label: "عيادة" },
  { value: "lab", label: "مختبر" },
  { value: "radiology", label: "أشعة" },
  { value: "pharmacy", label: "صيدلية" },
];

function ProviderForm() {
  const { id } = Route.useParams();
  const isNew = id === "new";
  const nav = useNavigate();
  const { user, loading: aL } = useAuth();
  const { isAdmin, loading: rL } = useRoles();
  const { cities } = useCities();

  const [form, setForm] = useState<FormState>(EMPTY);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (!aL && !user) nav({ to: "/auth" }); }, [aL, user, nav]);

  useEffect(() => {
    if (!isAdmin || isNew) return;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase.from("providers").select("*").eq("id", id).maybeSingle();
      if (error || !data) { toast.error("تعذّر تحميل المزوّد"); nav({ to: "/admin" }); return; }
      setForm({
        name: data.name, type: data.type, city: data.city ?? "", address: data.address ?? "",
        phone: data.phone ?? "", description: data.description ?? "", image_url: data.image_url ?? "",
        verified: data.verified, featured: data.featured, status: data.status,
      });
      setLoading(false);
    })();
  }, [id, isNew, isAdmin, nav]);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) { setForm((f) => ({ ...f, [k]: v })); }

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("الاسم مطلوب");
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      type: form.type,
      city: form.city.trim() || null,
      address: form.address.trim() || null,
      phone: form.phone.trim() || null,
      description: form.description.trim() || null,
      image_url: form.image_url.trim() || null,
      verified: form.verified,
      featured: form.featured,
      status: form.status,
    };
    if (isNew) {
      const { data, error } = await supabase.from("providers").insert(payload).select("id").single();
      setSaving(false);
      if (error) return toast.error(error.message);
      toast.success("تم إنشاء المزوّد");
      nav({ to: "/admin/providers/$id", params: { id: data.id } });
    } else {
      const { error } = await supabase.from("providers").update(payload).eq("id", id);
      setSaving(false);
      if (error) return toast.error(error.message);
      toast.success("تم الحفظ");
    }
  }

  async function onDelete() {
    if (isNew) return;
    if (!confirm("حذف المزوّد نهائياً؟")) return;
    const { error } = await supabase.from("providers").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("تم الحذف");
    nav({ to: "/admin" });
  }

  if (aL || rL || loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;
  if (!isAdmin) return <div className="min-h-screen flex items-center justify-center text-sm" dir="rtl">صلاحية غير متوفرة</div>;

  return (
    <div className="min-h-screen bg-background pb-16" dir="rtl">
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-background/85 border-b">
        <div className="mx-auto max-w-3xl px-4 py-4 flex items-center gap-3">
          <Link to="/admin" className="rounded-xl p-2 hover:bg-muted"><ArrowRight size={20} /></Link>
          <div className="flex-1">
            <h1 className="font-extrabold text-lg">{isNew ? "إضافة مزوّد جديد" : "تعديل بيانات المزوّد"}</h1>
            <p className="text-xs text-muted-foreground">إدارة المعلومات الأساسية، الحالة، والتوثيق.</p>
          </div>
          <div className="w-10 h-10 rounded-2xl gradient-primary flex items-center justify-center shadow-glow">
            <Building2 className="text-primary-foreground" size={18} />
          </div>
        </div>
      </header>

      <motion.form
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        onSubmit={onSave}
        className="mx-auto max-w-3xl px-4 py-6 space-y-5"
      >
        <section className="rounded-3xl border bg-card p-5 space-y-4 shadow-sm">
          <h2 className="font-extrabold text-sm text-muted-foreground">المعلومات الأساسية</h2>
          <Field label="الاسم *">
            <input value={form.name} onChange={(e) => set("name", e.target.value)} maxLength={120}
              className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary" required />
          </Field>
          <Field label="النوع *">
            <div className="grid grid-cols-5 gap-2">
              {TYPES.map((t) => (
                <button type="button" key={t.value} onClick={() => set("type", t.value)}
                  className={`rounded-2xl py-2 text-xs font-bold transition ${form.type === t.value ? "gradient-primary text-primary-foreground shadow-glow" : "bg-muted text-muted-foreground"}`}>
                  {t.label}
                </button>
              ))}
            </div>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="المدينة">
              <select value={form.city} onChange={(e) => set("city", e.target.value)}
                className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary">
                <option value="">— اختر —</option>
                {cities.map((c) => <option key={c.id} value={c.name_ar}>{c.name_ar}</option>)}
              </select>
            </Field>
            <Field label="الهاتف" icon={Phone}>
              <input value={form.phone} onChange={(e) => set("phone", e.target.value)} dir="ltr" maxLength={20}
                className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary" />
            </Field>
          </div>
          <Field label="العنوان" icon={MapPin}>
            <input value={form.address} onChange={(e) => set("address", e.target.value)} maxLength={250}
              className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary" />
          </Field>
          <Field label="رابط الصورة" icon={ImageIcon}>
            <input value={form.image_url} onChange={(e) => set("image_url", e.target.value)} dir="ltr" maxLength={500}
              placeholder="https://..."
              className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary" />
          </Field>
          <Field label="الوصف" icon={FileText}>
            <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} maxLength={1000}
              className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary resize-none" />
          </Field>
        </section>

        <section className="rounded-3xl border bg-card p-5 space-y-4 shadow-sm">
          <h2 className="font-extrabold text-sm text-muted-foreground">الحالة والتمييز</h2>
          <Field label="الحالة">
            <div className="grid grid-cols-3 gap-2">
              {(["active", "pending", "suspended"] as const).map((s) => (
                <button type="button" key={s} onClick={() => set("status", s)}
                  className={`rounded-2xl py-2 text-xs font-bold transition ${form.status === s ? "gradient-primary text-primary-foreground shadow-glow" : "bg-muted text-muted-foreground"}`}>
                  {s === "active" ? "نشط" : s === "pending" ? "قيد المراجعة" : "موقوف"}
                </button>
              ))}
            </div>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <ToggleRow label="موثّق" value={form.verified} onChange={(v) => set("verified", v)} />
            <ToggleRow label="مميّز" value={form.featured} onChange={(v) => set("featured", v)} />
          </div>
        </section>

        <div className="flex gap-3 sticky bottom-4">
          <button type="submit" disabled={saving}
            className="flex-1 rounded-2xl gradient-primary text-primary-foreground font-extrabold py-3.5 shadow-glow flex items-center justify-center gap-2 disabled:opacity-60">
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {isNew ? "إنشاء" : "حفظ التغييرات"}
          </button>
          {!isNew && (
            <button type="button" onClick={onDelete}
              className="rounded-2xl bg-destructive/10 text-destructive font-bold px-5 flex items-center gap-2">
              <Trash2 size={16} /> حذف
            </button>
          )}
        </div>
      </motion.form>
    </div>
  );
}

function Field({ label, icon: Icon, children }: { label: string; icon?: any; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground mb-1.5">
        {Icon && <Icon size={12} />} {label}
      </span>
      {children}
    </label>
  );
}

function ToggleRow({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!value)}
      className={`rounded-2xl px-4 py-3 text-sm font-bold flex items-center justify-between transition ${value ? "gradient-primary text-primary-foreground shadow-glow" : "bg-muted text-muted-foreground"}`}>
      <span>{label}</span>
      <span className={`w-10 h-6 rounded-full p-0.5 ${value ? "bg-white/30" : "bg-foreground/20"}`}>
        <span className={`block w-5 h-5 rounded-full bg-white transition ${value ? "translate-x-0" : "translate-x-4"}`} />
      </span>
    </button>
  );
}
