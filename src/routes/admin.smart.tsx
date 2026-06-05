import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/smart")({
  head: () => ({ meta: [{ title: "الظهور الذكي | الإدارة" }] }),
  component: SmartAdmin,
});

function SmartAdmin() {
  const [data, setData] = useState<any>(null);
  useEffect(() => { (async () => {
    const [topRated, topReviewed, newest, featured] = await Promise.all([
      supabase.from("providers").select("id,name,rating,city").order("rating", { ascending: false }).limit(10),
      supabase.from("providers").select("id,name,reviews_count,city").order("reviews_count", { ascending: false }).limit(10),
      supabase.from("providers").select("id,name,created_at,city").order("created_at", { ascending: false }).limit(10),
      supabase.from("providers").select("id,name,city").eq("featured", true).limit(10),
    ]);
    setData({ topRated: topRated.data ?? [], topReviewed: topReviewed.data ?? [], newest: newest.data ?? [], featured: featured.data ?? [] });
  })(); }, []);
  if (!data) return <AdminShell title="الظهور الذكي" icon={Sparkles}><div className="p-8 flex justify-center"><Loader2 className="animate-spin text-primary" /></div></AdminShell>;
  return (
    <AdminShell title="مركز الظهور الذكي" subtitle="الأعلى تقييماً، الأكثر حجزاً، الأكثر متابعة، الرائج، المضاف حديثاً" icon={Sparkles}>
      <div className="grid md:grid-cols-2 gap-4">
        <List title="الأعلى تقييماً" items={data.topRated} sub={(x: any) => `⭐ ${Number(x.rating || 0).toFixed(1)} • ${x.city || "—"}`} />
        <List title="الأكثر مراجعة" items={data.topReviewed} sub={(x: any) => `${x.reviews_count || 0} مراجعة • ${x.city || "—"}`} />
        <List title="مضاف حديثاً" items={data.newest} sub={(x: any) => new Date(x.created_at).toLocaleDateString("ar")} />
        <List title="المنشآت المميزة" items={data.featured} sub={(x: any) => x.city || "—"} />
      </div>
    </AdminShell>
  );
}
function List({ title, items, sub }: any) {
  return (
    <div className="rounded-3xl border bg-card p-5">
      <h3 className="font-extrabold mb-3">{title}</h3>
      {items.length === 0 ? <p className="text-xs text-muted-foreground">لا توجد بيانات</p>
        : <div className="space-y-2">
          {items.map((p: any, i: number) => (
            <div key={p.id} className="flex items-center justify-between text-sm">
              <span className="font-bold">{i + 1}. {p.name}</span>
              <span className="text-[10px] text-muted-foreground">{sub(p)}</span>
            </div>
          ))}
        </div>}
    </div>
  );
}
