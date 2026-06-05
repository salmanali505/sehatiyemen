import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Stethoscope, Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import AdminShell, { EmptyState } from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/specialties")({
  head: () => ({ meta: [{ title: "التخصصات الطبية | الإدارة" }] }),
  component: SpecialtiesAdmin,
});

type Spec = { id: string; parent_id: string | null; name_ar: string; kind: string; active: boolean; sort_order: number };

function SpecialtiesAdmin() {
  const [items, setItems] = useState<Spec[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name_ar: "", parent_id: "", kind: "specialty" });

  useEffect(() => { load(); }, []);
  async function load() {
    setLoading(true);
    const { data } = await supabase.from("specialties").select("*").order("sort_order").order("name_ar");
    setItems((data ?? []) as Spec[]);
    setLoading(false);
  }

  async function add() {
    if (!form.name_ar.trim()) return toast.error("الاسم مطلوب");
    const { error } = await supabase.from("specialties").insert({
      name_ar: form.name_ar.trim(),
      parent_id: form.parent_id || null,
      kind: form.kind,
    });
    if (error) return toast.error(error.message);
    setForm({ name_ar: "", parent_id: "", kind: "specialty" });
    load();
  }
  async function del(id: string) {
    if (!confirm("حذف؟")) return;
    await supabase.from("specialties").delete().eq("id", id);
    load();
  }
  async function toggle(id: string, v: boolean) {
    await supabase.from("specialties").update({ active: v }).eq("id", id);
    load();
  }

  const parents = items.filter((x) => !x.parent_id && x.kind === "specialty");
  const children = (pid: string) => items.filter((x) => x.parent_id === pid);
  const services = items.filter((x) => x.kind === "service");
  const categories = items.filter((x) => x.kind === "category");

  return (
    <AdminShell title="مركز التخصصات الطبية" subtitle="رئيسية وفرعية وخدمات وتصنيفات" icon={Stethoscope}>
      <div className="rounded-3xl border bg-card p-4 space-y-3">
        <h3 className="font-bold flex items-center gap-2"><Plus size={16} /> إضافة جديد</h3>
        <div className="grid sm:grid-cols-4 gap-2">
          <input value={form.name_ar} onChange={(e) => setForm({ ...form, name_ar: e.target.value })} placeholder="الاسم"
            className="rounded-2xl border border-input bg-background px-3 py-2 text-sm" />
          <select value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value })}
            className="rounded-2xl border border-input bg-background px-3 py-2 text-sm">
            <option value="specialty">تخصص</option>
            <option value="service">خدمة</option>
            <option value="category">تصنيف</option>
          </select>
          <select value={form.parent_id} onChange={(e) => setForm({ ...form, parent_id: e.target.value })}
            className="rounded-2xl border border-input bg-background px-3 py-2 text-sm">
            <option value="">بدون أب (رئيسي)</option>
            {parents.map((p) => <option key={p.id} value={p.id}>{p.name_ar}</option>)}
          </select>
          <button onClick={add} className="rounded-2xl gradient-primary text-primary-foreground font-bold text-sm shadow-glow">إضافة</button>
        </div>
      </div>

      {loading ? <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>
        : items.length === 0 ? <EmptyState icon={Stethoscope} title="لا توجد تخصصات بعد" hint="ابدأ بإضافة التخصصات الرئيسية" />
        : <>
            <Section title="التخصصات الرئيسية والفرعية">
              {parents.map((p) => (
                <div key={p.id} className="rounded-2xl border bg-card overflow-hidden">
                  <Row item={p} onDel={del} onToggle={toggle} />
                  {children(p.id).map((c) => <div key={c.id} className="pr-8"><Row item={c} onDel={del} onToggle={toggle} /></div>)}
                </div>
              ))}
            </Section>
            {services.length > 0 && <Section title="الخدمات الطبية">
              {services.map((s) => <Row key={s.id} item={s} onDel={del} onToggle={toggle} />)}
            </Section>}
            {categories.length > 0 && <Section title="التصنيفات">
              {categories.map((c) => <Row key={c.id} item={c} onDel={del} onToggle={toggle} />)}
            </Section>}
          </>}
    </AdminShell>
  );
}

function Section({ title, children }: any) {
  return <div><h3 className="text-sm font-bold text-muted-foreground mb-2">{title}</h3><div className="space-y-2">{children}</div></div>;
}
function Row({ item, onDel, onToggle }: any) {
  return (
    <div className="p-3 flex items-center gap-2 border-b last:border-b-0">
      <span className="flex-1 text-sm font-bold">{item.name_ar}</span>
      <button onClick={() => onToggle(item.id, !item.active)}
        className={`text-[10px] font-bold rounded-full px-2 py-0.5 ${item.active ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
        {item.active ? "نشط" : "معطل"}
      </button>
      <button onClick={() => onDel(item.id)} className="p-1.5 rounded-lg bg-destructive/10 text-destructive"><Trash2 size={12} /></button>
    </div>
  );
}
