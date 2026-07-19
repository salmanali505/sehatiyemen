import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Building2, Plus, Loader2, Search, CheckCircle2, Sparkles, Filter, Download, ShieldCheck, Star, Users } from "lucide-react";
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

const STATUS_TABS = [
  { k: "all", t: "الكل", tone: "bg-muted text-muted-foreground" },
  { k: "active", t: "نشط", tone: "bg-emerald-500/15 text-emerald-600" },
  { k: "pending", t: "مراجعة", tone: "bg-amber-500/15 text-amber-600" },
  { k: "suspended", t: "موقوف", tone: "bg-rose-500/15 text-rose-600" },
];

function KpiTile({ icon: Icon, label, value, tint }: { icon: any; label: string; value: number | string; tint: string }) {
  return (
    <div className="rounded-2xl border bg-card p-3 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl grid place-items-center ${tint}`}><Icon size={18} /></div>
      <div className="min-w-0">
        <p className="text-[10px] text-muted-foreground font-semibold">{label}</p>
        <p className="text-lg font-extrabold leading-tight">{value}</p>
      </div>
    </div>
  );
}

function FacilitiesAdmin() {
  const [items, setItems] = useState<P[]>([]);
  const [tab, setTab] = useState("all");
  const [status, setStatus] = useState("all");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => { load(); }, [tab]);
  async function load() {
    setLoading(true);
    let qb = supabase.from("providers").select("*").order("created_at", { ascending: false }).limit(500);
    if (tab !== "all") qb = qb.eq("type", tab as any);
    const { data } = await qb;
    setItems((data ?? []) as P[]);
    setSelected(new Set());
    setLoading(false);
  }
  async function updateStatus(id: string, s: string) {
    await supabase.from("providers").update({ status: s as any }).eq("id", id);
    toast.success("تم تحديث الحالة"); load();
  }
  async function toggleFlag(id: string, field: "verified" | "featured", value: boolean) {
    await supabase.from("providers").update({ [field]: value } as any).eq("id", id);
    toast.success(value ? "تم التفعيل" : "تم الإلغاء"); load();
  }
  async function bulkStatus(s: string) {
    if (selected.size === 0) return toast.error("اختر عناصر أولاً");
    await supabase.from("providers").update({ status: s as any }).in("id", Array.from(selected));
    toast.success(`تم تحديث ${selected.size} منشأة`); load();
  }
  function exportCSV() {
    const rows = [["الاسم", "النوع", "المدينة", "الحالة", "التقييم", "المراجعات"], ...filtered.map((p) => [p.name, p.type, p.city ?? "", p.status, String(p.rating ?? 0), String(p.reviews_count ?? 0)])];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `facilities-${Date.now()}.csv`; a.click();
  }

  const filtered = useMemo(() => items.filter((p) => {
    if (status !== "all" && p.status !== status) return false;
    if (q && !p.name.includes(q) && !(p.city || "").includes(q)) return false;
    return true;
  }), [items, status, q]);

  const kpis = useMemo(() => ({
    total: items.length,
    active: items.filter((i) => i.status === "active").length,
    verified: items.filter((i) => i.verified).length,
    featured: items.filter((i) => i.featured).length,
  }), [items]);

  const allSelected = filtered.length > 0 && filtered.every((f) => selected.has(f.id));
  function toggleAll() {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(filtered.map((f) => f.id)));
  }
  function toggleOne(id: string) {
    const n = new Set(selected);
    n.has(id) ? n.delete(id) : n.add(id);
    setSelected(n);
  }

  return (
    <AdminShell title="مركز إدارة المنشآت" subtitle="عيادات، مستشفيات، مختبرات، أشعة، صيدليات" icon={Building2}
      actions={
        <div className="flex gap-2">
          <button onClick={exportCSV} className="rounded-2xl border bg-card px-3 py-2 text-xs font-bold flex items-center gap-1"><Download size={14} /> CSV</button>
          <Link to="/admin/providers/$id" params={{ id: "new" }} className="rounded-2xl gradient-primary text-primary-foreground px-3 py-2 text-xs font-bold shadow-glow flex items-center gap-1"><Plus size={14} /> إضافة</Link>
        </div>
      }>
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <KpiTile icon={Building2} label="إجمالي المنشآت" value={kpis.total} tint="bg-primary/15 text-primary" />
        <KpiTile icon={Users} label="نشطة" value={kpis.active} tint="bg-emerald-500/15 text-emerald-600" />
        <KpiTile icon={ShieldCheck} label="موثّقة" value={kpis.verified} tint="bg-sky-500/15 text-sky-600" />
        <KpiTile icon={Star} label="مميّزة" value={kpis.featured} tint="bg-amber-500/15 text-amber-600" />
      </div>

      {/* Type filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {TYPES.map((t) => (
          <button key={t.k} onClick={() => setTab(t.k)}
            className={`shrink-0 rounded-2xl px-4 py-2 text-xs font-bold transition ${tab === t.k ? "gradient-primary text-primary-foreground shadow-glow" : "bg-muted text-muted-foreground hover:bg-muted/70"}`}>
            {t.t}
          </button>
        ))}
      </div>

      {/* Status chips + search */}
      <div className="flex flex-wrap items-center gap-2">
        <Filter size={14} className="text-muted-foreground" />
        {STATUS_TABS.map((s) => (
          <button key={s.k} onClick={() => setStatus(s.k)}
            className={`rounded-full px-3 py-1 text-[11px] font-bold ${status === s.k ? "gradient-primary text-primary-foreground" : s.tone}`}>{s.t}</button>
        ))}
        <div className="relative flex-1 min-w-[180px]">
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث بالاسم أو المدينة..."
            className="w-full rounded-2xl border border-input bg-card pr-9 pl-3 py-2.5 text-sm" />
        </div>
      </div>

      {/* Bulk actions bar */}
      {selected.size > 0 && (
        <div className="rounded-2xl border bg-primary/5 p-3 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-primary">{selected.size} مختارة</span>
          <div className="flex-1" />
          <button onClick={() => bulkStatus("active")} className="rounded-xl bg-emerald-500/15 text-emerald-600 px-3 py-1.5 text-xs font-bold">تفعيل</button>
          <button onClick={() => bulkStatus("pending")} className="rounded-xl bg-amber-500/15 text-amber-600 px-3 py-1.5 text-xs font-bold">مراجعة</button>
          <button onClick={() => bulkStatus("suspended")} className="rounded-xl bg-rose-500/15 text-rose-600 px-3 py-1.5 text-xs font-bold">إيقاف</button>
        </div>
      )}

      {loading ? <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>
        : filtered.length === 0 ? <EmptyState icon={Building2} title="لا توجد منشآت مطابقة" />
        : <div className="rounded-3xl border bg-card overflow-hidden">
            <div className="flex items-center gap-3 p-3 border-b bg-muted/30">
              <input type="checkbox" checked={allSelected} onChange={toggleAll} className="w-4 h-4 accent-primary" />
              <span className="text-[11px] font-bold text-muted-foreground">تحديد الكل ({filtered.length})</span>
            </div>
            <div className="divide-y">
              {filtered.map((p) => (
                <div key={p.id} className="p-3 flex flex-wrap items-center gap-3 hover:bg-muted/20 transition">
                  <input type="checkbox" checked={selected.has(p.id)} onChange={() => toggleOne(p.id)} className="w-4 h-4 accent-primary" />
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
                  <div className="flex items-center gap-1">
                    <button onClick={() => toggleFlag(p.id, "verified", !p.verified)} title="توثيق"
                      className={`w-8 h-8 rounded-xl grid place-items-center ${p.verified ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>
                      <ShieldCheck size={14} />
                    </button>
                    <button onClick={() => toggleFlag(p.id, "featured", !p.featured)} title="تمييز"
                      className={`w-8 h-8 rounded-xl grid place-items-center ${p.featured ? "bg-amber-500/15 text-amber-600" : "bg-muted text-muted-foreground"}`}>
                      <Star size={14} />
                    </button>
                  </div>
                  <select value={p.status} onChange={(e) => updateStatus(p.id, e.target.value)}
                    className="rounded-xl border border-input bg-background px-2 py-1.5 text-xs">
                    <option value="active">نشط</option>
                    <option value="pending">مراجعة</option>
                    <option value="suspended">موقوف</option>
                  </select>
                </div>
              ))}
            </div>
          </div>}
    </AdminShell>
  );
}
