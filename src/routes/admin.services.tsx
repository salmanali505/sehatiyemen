import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Briefcase, Plus, Trash2, Loader2 } from "lucide-react";
import AdminShell, { EmptyState } from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/services")({
  head: () => ({ meta: [{ title: "الخدمات الطبية | الإدارة" }] }),
  component: ServicesAdmin,
});

type S = { id: string; name_ar: string; name_en: string | null; icon: string | null; active: boolean; sort_order: number; parent_id: string | null };

function ServicesAdmin() {
  const [items, setItems] = useState<S[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name_ar: "", name_en: "", icon: "" });

  useEffect(() => { load(); }, []);
  async function load() {
    setLoading(true);
    const { data } = await supabase.from("specialties").select("*").eq("kind", "service").order("sort_order", { ascending: true });
    setItems((data ?? []) as S[]);
    setLoading(false);
  }
  async function add() {
    if (!form.name_ar.trim()) return toast.error("الاسم العربي مطلوب");
    const { error } = await supabase.from("specialties").insert({ kind: "service", name_ar: form.name_ar, name_en: form.name_en || null, icon: form.icon || null, sort_order: items.length });
    if (error) return toast.error(error.message);
    setForm({ name_ar: "", name_en: "", icon: "" });
    toast.success("تمت الإضافة"); load();
  }
  async function toggle(s: S) { await supabase.from("specialties").update({ active: !s.active }).eq("id", s.id); load(); }
  async function del(s: S) { if (!confirm("حذف؟")) return; await supabase.from("specialties").delete().eq("id", s.id); toast.success("حُذف"); load(); }

  return (
    <AdminShell title="مركز الخدمات الطبية" subtitle="خدمات قابلة للتفعيل لكل منشأة" icon={Briefcase}>
      <div className="rounded-3xl border bg-card p-4 space-y-3">
        <h3 className="font-extrabold text-sm">إضافة خدمة جديدة</h3>
        <div className="grid sm:grid-cols-3 gap-2">
          <input value={form.name_ar} onChange={(e) => setForm({ ...form, name_ar: e.target.value })} placeholder="الاسم بالعربية" className="rounded-2xl border border-input bg-background px-3 py-2 text-sm" />
          <input value={form.name_en} onChange={(e) => setForm({ ...form, name_en: e.target.value })} placeholder="English name" dir="ltr" className="rounded-2xl border border-input bg-background px-3 py-2 text-sm" />
          <input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="أيقونة (emoji)" className="rounded-2xl border border-input bg-background px-3 py-2 text-sm" />
        </div>
        <button onClick={add} className="rounded-2xl gradient-primary text-primary-foreground px-4 py-2 text-sm font-bold shadow-glow inline-flex items-center gap-1"><Plus size={14} /> إضافة</button>
      </div>

      {loading ? <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>
        : items.length === 0 ? <EmptyState icon={Briefcase} title="لا توجد خدمات" />
        : <div className="rounded-3xl border bg-card overflow-hidden divide-y">
            {items.map((s) => (
              <div key={s.id} className="p-3 flex items-center gap-3">
                <span className="text-xl">{s.icon || "🩺"}</span>
                <div className="flex-1 min-w-0"><p className="font-bold text-sm">{s.name_ar}</p>{s.name_en && <p className="text-[10px] text-muted-foreground" dir="ltr">{s.name_en}</p>}</div>
                <button onClick={() => toggle(s)} className={`rounded-full text-[10px] font-bold px-2 py-1 ${s.active ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>{s.active ? "نشط" : "موقوف"}</button>
                <button onClick={() => del(s)} className="text-destructive p-1.5"><Trash2 size={14} /></button>
              </div>
            ))}
          </div>}
    </AdminShell>
  );
}
