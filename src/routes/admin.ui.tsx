import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Paintbrush, ArrowLeft, Save, Loader2 } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/ui")({
  head: () => ({ meta: [{ title: "واجهة التطبيق | الإدارة" }] }),
  component: UiAdmin,
});

function UiAdmin() {
  const [theme, setTheme] = useState({ primary: "#0ea5e9", accent: "#22c55e", radius: "1rem", font: "Cairo" });
  const [labels, setLabels] = useState({ home_title: "صحتي", search_hint: "ابحث عن طبيب، مستشفى، تخصص..." });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { (async () => {
    setLoading(true);
    const { data } = await supabase.from("system_settings").select("key, value").in("key", ["ui_theme", "ui_labels"]);
    for (const r of data ?? []) {
      if (r.key === "ui_theme") setTheme({ ...theme, ...(r.value as any) });
      if (r.key === "ui_labels") setLabels({ ...labels, ...(r.value as any) });
    }
    setLoading(false);
  })(); }, []);

  async function save() {
    setSaving(true);
    const { error } = await supabase.from("system_settings").upsert([
      { key: "ui_theme", value: theme as any },
      { key: "ui_labels", value: labels as any },
    ]);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("تم حفظ إعدادات الواجهة");
  }

  if (loading) return <AdminShell title="واجهة التطبيق" icon={Paintbrush}><div className="p-8 flex justify-center"><Loader2 className="animate-spin text-primary" /></div></AdminShell>;

  return (
    <AdminShell title="مركز إدارة واجهة التطبيق" subtitle="ألوان، خطوط، نصوص، ترتيب الأقسام" icon={Paintbrush}>
      <div className="grid sm:grid-cols-2 gap-3">
        <Link to="/admin/home" className="rounded-3xl border bg-card p-5 hover:border-primary/40 transition">
          <h3 className="font-extrabold">ترتيب الصفحة الرئيسية</h3>
          <p className="text-xs text-muted-foreground mt-1">إخفاء، إظهار، إعادة ترتيب وجدولة الأقسام</p>
          <span className="text-primary text-sm font-bold mt-2 inline-flex items-center gap-1">فتح <ArrowLeft size={14} /></span>
        </Link>
        <Link to="/admin/ads" className="rounded-3xl border bg-card p-5 hover:border-primary/40 transition">
          <h3 className="font-extrabold">البنرات والإعلانات</h3>
          <p className="text-xs text-muted-foreground mt-1">إدارة بنرات الصفحة الرئيسية</p>
          <span className="text-primary text-sm font-bold mt-2 inline-flex items-center gap-1">فتح <ArrowLeft size={14} /></span>
        </Link>
      </div>

      <div className="rounded-3xl border bg-card p-5 space-y-3">
        <h3 className="font-extrabold">الألوان والخطوط</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="اللون الأساسي" type="color" value={theme.primary} onChange={(v) => setTheme({ ...theme, primary: v })} />
          <Field label="اللون الثانوي" type="color" value={theme.accent} onChange={(v) => setTheme({ ...theme, accent: v })} />
          <Field label="استدارة الزوايا" value={theme.radius} onChange={(v) => setTheme({ ...theme, radius: v })} />
          <Field label="الخط الافتراضي" value={theme.font} onChange={(v) => setTheme({ ...theme, font: v })} />
        </div>
      </div>

      <div className="rounded-3xl border bg-card p-5 space-y-3">
        <h3 className="font-extrabold">النصوص الافتراضية</h3>
        <Field label="عنوان الرئيسية" value={labels.home_title} onChange={(v) => setLabels({ ...labels, home_title: v })} />
        <Field label="نص حقل البحث" value={labels.search_hint} onChange={(v) => setLabels({ ...labels, search_hint: v })} />
      </div>

      <button onClick={save} disabled={saving} className="w-full rounded-2xl gradient-primary text-primary-foreground py-3 font-bold shadow-glow inline-flex items-center justify-center gap-2 disabled:opacity-50">
        {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} حفظ التعديلات
      </button>
    </AdminShell>
  );
}
function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return <div><label className="text-xs text-muted-foreground">{label}</label>
    <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full mt-1 rounded-2xl border border-input bg-background px-3 py-2 text-sm" /></div>;
}
