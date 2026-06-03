import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, Layout, Plus, Save, Trash2, Loader2, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useRoles } from "@/lib/useRoles";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/home")({
  head: () => ({ meta: [{ title: "إدارة الشاشة الرئيسية | صحتي" }] }),
  component: AdminHome,
});

type Sec = {
  id: string; key: string; title_ar: string; title_en: string | null;
  section_type: string; sort_order: number; visible: boolean;
  starts_at: string | null; ends_at: string | null;
};

function AdminHome() {
  const { user, loading: aL } = useAuth();
  const { isAdmin, loading: rL } = useRoles();
  const nav = useNavigate();
  const [items, setItems] = useState<Sec[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (!aL && !user) nav({ to: "/auth" }); }, [aL, user, nav]);
  useEffect(() => { if (isAdmin) load(); }, [isAdmin]);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("home_sections").select("*").order("sort_order");
    setItems((data ?? []) as Sec[]); setLoading(false);
  }

  async function add() {
    const key = `section_${Date.now()}`;
    const sort = (items[items.length - 1]?.sort_order ?? 0) + 1;
    await supabase.from("home_sections").insert({ key, title_ar: "قسم جديد", section_type: "providers", sort_order: sort });
    load();
  }
  async function save(s: Sec) {
    const { error } = await supabase.from("home_sections").update({
      title_ar: s.title_ar, title_en: s.title_en, section_type: s.section_type,
      sort_order: s.sort_order, visible: s.visible, starts_at: s.starts_at, ends_at: s.ends_at,
    }).eq("id", s.id);
    if (error) return toast.error(error.message);
    toast.success("تم الحفظ");
  }
  async function del(id: string) {
    if (!confirm("حذف القسم؟")) return;
    await supabase.from("home_sections").delete().eq("id", id); load();
  }

  if (aL || rL) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;
  if (!isAdmin) { nav({ to: "/" }); return null; }

  return (
    <div className="min-h-screen bg-background pb-12" dir="rtl">
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-background/85 border-b">
        <div className="mx-auto max-w-4xl px-4 py-4 flex items-center gap-3">
          <Link to="/admin" className="rounded-xl p-2 hover:bg-muted"><ArrowRight size={20} /></Link>
          <div className="flex-1"><h1 className="font-extrabold text-lg">إدارة الشاشة الرئيسية</h1><p className="text-xs text-muted-foreground">أقسام تظهر فوراً في التطبيق</p></div>
          <button onClick={add} className="rounded-2xl gradient-primary text-primary-foreground px-4 py-2 text-xs font-bold flex items-center gap-1 shadow-glow"><Plus size={14} /> قسم</button>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-6">
        <div className="rounded-3xl border bg-card overflow-hidden">
          <div className="p-4 border-b flex items-center gap-2"><Layout size={16} className="text-primary" /><span className="font-bold">الأقسام ({items.length})</span></div>
          {loading ? <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-primary" /></div> : (
            <div className="divide-y">
              {items.map((s, i) => (
                <div key={s.id} className="p-4 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <input type="number" value={s.sort_order} onChange={(e) => setItems((x) => x.map((y, j) => j === i ? { ...y, sort_order: Number(e.target.value) } : y))} className="w-16 rounded-xl border border-input bg-background px-2 py-1.5 text-xs" />
                    <input value={s.title_ar} onChange={(e) => setItems((x) => x.map((y, j) => j === i ? { ...y, title_ar: e.target.value } : y))} className="flex-1 min-w-[150px] rounded-xl border border-input bg-background px-2 py-1.5 text-sm" />
                    <select value={s.section_type} onChange={(e) => setItems((x) => x.map((y, j) => j === i ? { ...y, section_type: e.target.value } : y))} className="rounded-xl border border-input bg-background px-2 py-1.5 text-xs">
                      <option value="banner">بانر</option>
                      <option value="categories">تخصصات</option>
                      <option value="providers">مزوّدون</option>
                      <option value="doctors">أطباء</option>
                      <option value="offers">عروض</option>
                    </select>
                    <button onClick={() => setItems((x) => x.map((y, j) => j === i ? { ...y, visible: !y.visible } : y))} className={`p-2 rounded-xl ${s.visible ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
                      {s.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                    </button>
                    <button onClick={() => save(s)} className="p-2 rounded-xl bg-primary/10 text-primary"><Save size={14} /></button>
                    <button onClick={() => del(s.id)} className="p-2 rounded-xl bg-destructive/10 text-destructive"><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
