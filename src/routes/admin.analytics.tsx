import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BarChart3, Loader2, TrendingUp } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/analytics")({
  head: () => ({ meta: [{ title: "التحليلات | الإدارة" }] }),
  component: Analytics,
});

function Analytics() {
  const [data, setData] = useState<any>(null);

  useEffect(() => { (async () => {
    const [{ data: byCity }, { data: byType }, { data: topProv }, { data: topSpec }] = await Promise.all([
      supabase.from("providers").select("city"),
      supabase.from("providers").select("type"),
      supabase.from("providers").select("name, reviews_count, rating").order("reviews_count", { ascending: false }).limit(10),
      supabase.from("bookings").select("service_name"),
    ]);
    const agg = (arr: any[], k: string) => arr.reduce((m: any, x: any) => { const v = x[k] || "—"; m[v] = (m[v] || 0) + 1; return m; }, {});
    setData({
      byCity: agg(byCity ?? [], "city"),
      byType: agg(byType ?? [], "type"),
      topProv: topProv ?? [],
      topSpec: agg(topSpec ?? [], "service_name"),
    });
  })(); }, []);

  if (!data) return <AdminShell title="التحليلات الذكية" icon={BarChart3}><div className="p-8 flex justify-center"><Loader2 className="animate-spin text-primary" /></div></AdminShell>;

  return (
    <AdminShell title="التحليلات الذكية" subtitle="أداء المنشآت والأطباء ومعدلات النمو" icon={BarChart3}>
      <div className="grid md:grid-cols-2 gap-4">
        <Card title="المدن الأكثر نشاطاً" data={data.byCity} />
        <Card title="توزيع المنشآت حسب النوع" data={data.byType} />
        <Card title="أكثر الخدمات طلباً" data={data.topSpec} />
        <div className="rounded-3xl border bg-card p-5">
          <h3 className="font-extrabold mb-3 flex items-center gap-2"><TrendingUp size={16} className="text-primary" /> الأعلى تقييماً وحجزاً</h3>
          <div className="space-y-2">
            {data.topProv.map((p: any, i: number) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="font-bold">{i + 1}. {p.name}</span>
                <span className="text-xs text-muted-foreground">⭐ {Number(p.rating || 0).toFixed(1)} • {p.reviews_count || 0} مراجعة</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}

function Card({ title, data }: { title: string; data: Record<string, number> }) {
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]).slice(0, 10);
  const max = Math.max(1, ...entries.map(([, v]) => v));
  return (
    <div className="rounded-3xl border bg-card p-5">
      <h3 className="font-extrabold mb-3">{title}</h3>
      {entries.length === 0 ? <p className="text-xs text-muted-foreground">لا توجد بيانات</p> : (
        <div className="space-y-2">
          {entries.map(([k, v]) => (
            <div key={k}>
              <div className="flex justify-between text-xs mb-1"><span className="font-bold">{k}</span><span className="text-muted-foreground">{v}</span></div>
              <div className="h-2 rounded-full bg-muted overflow-hidden"><div className="h-full gradient-primary rounded-full" style={{ width: `${(v / max) * 100}%` }} /></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
