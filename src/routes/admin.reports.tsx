import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FileBarChart, Download } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/reports")({
  head: () => ({ meta: [{ title: "التقارير | الإدارة" }] }),
  component: Reports,
});

function Reports() {
  const [range, setRange] = useState<"day" | "week" | "month" | "year">("month");
  const [stats, setStats] = useState({ bookings: 0, providers: 0, users: 0, revenue: 0 });

  useEffect(() => { load(); }, [range]);
  async function load() {
    const d = new Date();
    if (range === "day") d.setDate(d.getDate() - 1);
    else if (range === "week") d.setDate(d.getDate() - 7);
    else if (range === "month") d.setMonth(d.getMonth() - 1);
    else d.setFullYear(d.getFullYear() - 1);
    const since = d.toISOString();
    const [b, p, u, s] = await Promise.all([
      supabase.from("bookings").select("*", { count: "exact", head: true }).gte("created_at", since),
      supabase.from("providers").select("*", { count: "exact", head: true }).gte("created_at", since),
      supabase.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", since),
      supabase.from("subscriptions").select("amount").eq("status", "active").gte("created_at", since),
    ]);
    setStats({
      bookings: b.count ?? 0, providers: p.count ?? 0, users: u.count ?? 0,
      revenue: (s.data ?? []).reduce((a, x: any) => a + Number(x.amount || 0), 0),
    });
  }

  async function exportCsv() {
    const { data } = await supabase.from("bookings").select("*").order("created_at", { ascending: false }).limit(1000);
    const rows = data ?? [];
    if (!rows.length) return toast.error("لا توجد بيانات");
    const cols = Object.keys(rows[0]);
    const csv = [cols.join(","), ...rows.map((r: any) => cols.map((c) => JSON.stringify(r[c] ?? "")).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `bookings_${Date.now()}.csv`; a.click();
  }

  const RANGES = [["day", "يومي"], ["week", "أسبوعي"], ["month", "شهري"], ["year", "سنوي"]] as const;

  return (
    <AdminShell title="مركز التقارير" subtitle="يومية، أسبوعية، شهرية، سنوية، مخصصة" icon={FileBarChart}
      actions={<button onClick={exportCsv} className="rounded-2xl gradient-primary text-primary-foreground px-3 py-2 text-xs font-bold shadow-glow flex items-center gap-1"><Download size={14} /> CSV</button>}>
      <div className="flex gap-2">
        {RANGES.map(([k, t]) => (
          <button key={k} onClick={() => setRange(k)}
            className={`rounded-2xl px-4 py-2 text-xs font-bold ${range === k ? "gradient-primary text-primary-foreground shadow-glow" : "bg-muted text-muted-foreground"}`}>
            {t}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Box label="حجوزات" v={stats.bookings} />
        <Box label="منشآت جديدة" v={stats.providers} />
        <Box label="مستخدمون جدد" v={stats.users} />
        <Box label="إيرادات ($)" v={stats.revenue} />
      </div>
    </AdminShell>
  );
}
function Box({ label, v }: { label: string; v: number }) {
  return <div className="rounded-3xl border bg-card p-5"><p className="text-3xl font-extrabold">{v.toLocaleString("ar")}</p><p className="text-xs text-muted-foreground mt-1">{label}</p></div>;
}
