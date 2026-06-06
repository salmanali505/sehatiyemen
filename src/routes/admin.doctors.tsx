import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { UserCog, Loader2, Search, Star, Calendar } from "lucide-react";
import AdminShell, { EmptyState } from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/doctors")({
  head: () => ({ meta: [{ title: "الأطباء | الإدارة" }] }),
  component: DoctorsAdmin,
});

type Row = { doctor_name: string; provider_id: string; provider_name: string; bookings: number; last_at: string };

function DoctorsAdmin() {
  const [rows, setRows] = useState<Row[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, providers: 0, completed: 0 });

  useEffect(() => { (async () => {
    setLoading(true);
    const { data } = await supabase
      .from("bookings")
      .select("doctor_name, provider_id, provider_name, status, created_at")
      .not("doctor_name", "is", null)
      .order("created_at", { ascending: false })
      .limit(2000);
    const map = new Map<string, Row>();
    let completed = 0;
    const provSet = new Set<string>();
    for (const b of data ?? []) {
      if (!b.doctor_name) continue;
      const k = `${b.provider_id}::${b.doctor_name}`;
      const prev = map.get(k);
      if (!prev) map.set(k, { doctor_name: b.doctor_name, provider_id: b.provider_id, provider_name: b.provider_name, bookings: 1, last_at: b.created_at });
      else { prev.bookings++; if (b.created_at > prev.last_at) prev.last_at = b.created_at; }
      if (b.status === "completed") completed++;
      provSet.add(b.provider_id);
    }
    const arr = Array.from(map.values()).sort((a, b) => b.bookings - a.bookings);
    setRows(arr);
    setStats({ total: arr.length, providers: provSet.size, completed });
    setLoading(false);
  })(); }, []);

  const filtered = rows.filter((r) => !q || r.doctor_name.includes(q) || r.provider_name.includes(q));

  return (
    <AdminShell title="مركز إدارة الأطباء" subtitle="مستخرج من سجل الحجوزات لكل منشأة" icon={UserCog}>
      <div className="grid grid-cols-3 gap-3">
        <Box label="عدد الأطباء" v={stats.total} />
        <Box label="منشآت لها أطباء" v={stats.providers} />
        <Box label="حجوزات مكتملة" v={stats.completed} />
      </div>
      <div className="relative">
        <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث باسم الطبيب أو المنشأة..."
          className="w-full rounded-2xl border border-input bg-card pr-9 pl-3 py-2.5 text-sm" />
      </div>

      {loading ? <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>
        : filtered.length === 0 ? <EmptyState icon={UserCog} title="لا يوجد أطباء بعد" hint="سيتم إنشاء قائمة الأطباء تلقائياً من الحجوزات." />
        : <div className="rounded-3xl border bg-card overflow-hidden divide-y">
            {filtered.map((r, i) => (
              <div key={i} className="p-3 flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary/15 to-accent/15 flex items-center justify-center font-extrabold text-primary">{r.doctor_name.charAt(0)}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate">د. {r.doctor_name}</p>
                  <Link to="/admin/providers/$id" params={{ id: r.provider_id }} className="text-[11px] text-muted-foreground hover:text-primary">{r.provider_name}</Link>
                </div>
                <span className="rounded-full bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 flex items-center gap-1"><Calendar size={10} /> {r.bookings}</span>
                <span className="text-[10px] text-muted-foreground hidden sm:flex items-center gap-1"><Star size={10} /> آخر: {new Date(r.last_at).toLocaleDateString("ar")}</span>
              </div>
            ))}
          </div>}
    </AdminShell>
  );
}
function Box({ label, v }: { label: string; v: number }) {
  return <div className="rounded-3xl border bg-card p-4 text-center"><p className="text-2xl font-extrabold">{v.toLocaleString()}</p><p className="text-[10px] text-muted-foreground mt-1">{label}</p></div>;
}
