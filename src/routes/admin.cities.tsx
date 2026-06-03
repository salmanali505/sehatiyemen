import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, MapPin, Plus, Trash2, Loader2, Save } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useRoles } from "@/lib/useRoles";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/cities")({
  head: () => ({ meta: [{ title: "إدارة المدن | صحتي" }] }),
  component: AdminCities,
});

type City = { id: string; name_ar: string; name_en: string; sort_order: number; active: boolean };

function AdminCities() {
  const { user, loading: aL } = useAuth();
  const { isAdmin, loading: rL } = useRoles();
  const nav = useNavigate();
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAr, setNewAr] = useState(""); const [newEn, setNewEn] = useState("");

  useEffect(() => { if (!aL && !user) nav({ to: "/auth" }); }, [aL, user, nav]);
  useEffect(() => { if (isAdmin) load(); }, [isAdmin]);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("cities").select("*").order("sort_order", { ascending: true });
    setCities((data ?? []) as City[]); setLoading(false);
  }

  async function add() {
    if (!newAr.trim() || !newEn.trim()) return toast.error("الاسم بالعربي والإنجليزي مطلوب");
    const sort = (cities[cities.length - 1]?.sort_order ?? 0) + 1;
    const { error } = await supabase.from("cities").insert({ name_ar: newAr.trim(), name_en: newEn.trim(), sort_order: sort });
    if (error) return toast.error(error.message);
    setNewAr(""); setNewEn(""); toast.success("تمت إضافة المدينة"); load();
  }
  async function save(c: City) {
    const { error } = await supabase.from("cities").update({ name_ar: c.name_ar, name_en: c.name_en, sort_order: c.sort_order, active: c.active }).eq("id", c.id);
    if (error) return toast.error(error.message);
    toast.success("تم الحفظ");
  }
  async function del(id: string) {
    if (!confirm("حذف المدينة؟")) return;
    await supabase.from("cities").delete().eq("id", id);
    load();
  }

  if (aL || rL) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;
  if (!isAdmin) { nav({ to: "/" }); return null; }

  return (
    <div className="min-h-screen bg-background pb-12" dir="rtl">
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-background/85 border-b">
        <div className="mx-auto max-w-3xl px-4 py-4 flex items-center gap-3">
          <Link to="/admin" className="rounded-xl p-2 hover:bg-muted"><ArrowRight size={20} /></Link>
          <div className="flex-1"><h1 className="font-extrabold text-lg">إدارة المدن</h1></div>
          <div className="w-10 h-10 rounded-2xl gradient-primary flex items-center justify-center shadow-glow"><MapPin className="text-primary-foreground" size={18} /></div>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-6 space-y-4">
        <div className="rounded-3xl border bg-card p-4">
          <h2 className="font-bold mb-3 flex items-center gap-2"><Plus size={16} /> مدينة جديدة</h2>
          <div className="grid grid-cols-2 gap-2">
            <input value={newAr} onChange={(e) => setNewAr(e.target.value)} placeholder="الاسم بالعربي" className="rounded-2xl border border-input bg-background px-3 py-2.5 text-sm" />
            <input value={newEn} onChange={(e) => setNewEn(e.target.value)} placeholder="Name in English" dir="ltr" className="rounded-2xl border border-input bg-background px-3 py-2.5 text-sm" />
          </div>
          <button onClick={add} className="mt-3 w-full gradient-primary text-primary-foreground rounded-2xl px-4 py-2.5 text-sm font-bold shadow-glow">إضافة</button>
        </div>

        <div className="rounded-3xl border bg-card overflow-hidden">
          <div className="p-4 border-b font-bold">المدن ({cities.length})</div>
          {loading ? <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-primary" /></div> : (
            <div className="divide-y">
              {cities.map((c, i) => (
                <div key={c.id} className="p-3 flex flex-wrap items-center gap-2">
                  <input type="number" value={c.sort_order} onChange={(e) => setCities((x) => x.map((y, j) => j === i ? { ...y, sort_order: Number(e.target.value) } : y))} className="w-16 rounded-xl border border-input bg-background px-2 py-1.5 text-xs" />
                  <input value={c.name_ar} onChange={(e) => setCities((x) => x.map((y, j) => j === i ? { ...y, name_ar: e.target.value } : y))} className="flex-1 min-w-[120px] rounded-xl border border-input bg-background px-2 py-1.5 text-sm" />
                  <input value={c.name_en} onChange={(e) => setCities((x) => x.map((y, j) => j === i ? { ...y, name_en: e.target.value } : y))} dir="ltr" className="flex-1 min-w-[120px] rounded-xl border border-input bg-background px-2 py-1.5 text-sm" />
                  <label className="flex items-center gap-1 text-xs font-bold cursor-pointer">
                    <input type="checkbox" checked={c.active} onChange={(e) => setCities((x) => x.map((y, j) => j === i ? { ...y, active: e.target.checked } : y))} />
                    نشط
                  </label>
                  <button onClick={() => save(c)} className="p-2 rounded-xl bg-primary/10 text-primary"><Save size={14} /></button>
                  <button onClick={() => del(c.id)} className="p-2 rounded-xl bg-destructive/10 text-destructive"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
