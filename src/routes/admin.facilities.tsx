import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Building2, Plus, Loader2, Search, CheckCircle2, Sparkles } from "lucide-react";
import AdminShell, { EmptyState } from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/facilities")({
  head: () => ({ meta: [{ title: "إدارة المنشآت | الإدارة" }] }),
  component: FacilitiesAdmin,
});

type P = { id: string; name: string; type: string; city: string | null; status: string; verified: boolean; featured: boolean; rating: number | null; reviews_count: number | null; logo_url: string | null };

const TYPES = [
  { k: "all", t: "الكل" },
  { k: "clinic", t: "عيادات" },
  { k: "hospital", t: "مستشفيات" },
  { k: "lab", t: "مختبرات" },
  { k: "radiology", t: "أشعة" },
  { k: "pharmacy", t: "صيدليات" },
];

function FacilitiesAdmin() {
  const [items, setItems] = useState<P[]>([]);
  const [tab, setTab] = useState("all");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, [tab]);
  async function load() {
    setLoading(true);
    let qb = supabase.from("providers").select("*").order("created_at", { ascending: false }).limit(500);
    if (tab !== "all") qb = qb.eq("type", tab as any);
    const { data } = await qb;
    setItems((data ?? []) as P[]);
    setLoading(false);
  }
  async function setStatus(id: string, s: string) {
    await supabase.from("providers").update({ status: s as any }).eq("id", id);
    toast.success("تم"); load();
  }

  const filtered = items.filter((p) => !q || p.name.includes(q) || (p.city || "").includes(q));

  return (
    <AdminShell title="مركز إدارة المنشآت" subtitle="عيادات، مستشفيات، مختبرات، أشعة، صيدليات" icon={Building2}
      actions={<Link to="/admin/providers/$id" params={{ id: "new" }} className="rounded-2xl gradient-primary text-primary-foreground px-3 py-2 text-xs font-bold shadow-glow flex items-center gap-1"><Plus size={14} /> إضافة</Link>}>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {TYPES.map((t) => (
          <button key={t.k} onClick={() => setTab(t.k)}
            className={`shrink-0 rounded-2xl px-4 py-2 text-xs font-bold ${tab === t.k ? "gradient-primary text-primary-foreground shadow-glow" : "bg-muted text-muted-foreground"}`}>
            {t.t}
          </button>
        ))}
      </div>
      <div className="relative">
        <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث بالاسم أو المدينة..."
          className="w-full rounded-2xl border border-input bg-card pr-9 pl-3 py-2.5 text-sm" />
      </div>

      {loading ? <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>
        : filtered.length === 0 ? <EmptyState icon={Building2} title="لا توجد منشآت" />
        : <div className="rounded-3xl border bg-card overflow-hidden divide-y">
            {filtered.map((p) => (
              <div key={p.id} className="p-3 flex flex-wrap items-center gap-3">
                <Link to="/admin/providers/$id" params={{ id: p.id }} className="w-12 h-12 rounded-2xl overflow-hidden bg-gradient-to-br from-primary/15 to-accent/15 flex items-center justify-center font-extrabold text-primary">
                  {p.logo_url ? <img src={p.logo_url} className="w-full h-full object-cover" /> : p.name.charAt(0)}
                </Link>
                <div className="flex-1 min-w-[160px]">
                  <div className="flex items-center gap-1.5">
                    <p className="font-bold text-sm">{p.name}</p>
                    {p.verified && <CheckCircle2 size={12} className="text-primary" />}
                    {p.featured && <Sparkles size={12} className="text-warning" />}
                  </div>
                  <p className="text-[10px] text-muted-foreground">{p.city || "—"} • ⭐ {Number(p.rating ?? 0).toFixed(1)} ({p.reviews_count ?? 0})</p>
                </div>
                <select value={p.status} onChange={(e) => setStatus(p.id, e.target.value)}
                  className="rounded-xl border border-input bg-background px-2 py-1.5 text-xs">
                  <option value="active">نشط</option>
                  <option value="pending">مراجعة</option>
                  <option value="suspended">موقوف</option>
                </select>
              </div>
            ))}
          </div>}
    </AdminShell>
  );
}
