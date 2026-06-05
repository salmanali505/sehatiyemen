import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Wallet, ArrowLeft } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/finance")({
  head: () => ({ meta: [{ title: "المركز المالي | الإدارة" }] }),
  component: Finance,
});

function Finance() {
  const [s, setS] = useState({ subs: 0, ads: 0, verify: 0, paid: 0, refund: 0 });
  useEffect(() => { (async () => {
    const [subs, ads, ver, paid, ref] = await Promise.all([
      supabase.from("subscriptions").select("amount").eq("status", "active"),
      supabase.from("payments").select("amount").eq("kind", "ad").eq("status", "paid"),
      supabase.from("payments").select("amount").eq("kind", "verification").eq("status", "paid"),
      supabase.from("payments").select("amount").eq("status", "paid"),
      supabase.from("payments").select("amount").eq("status", "refunded"),
    ]);
    const sum = (r: any) => (r.data ?? []).reduce((a: number, x: any) => a + Number(x.amount || 0), 0);
    setS({ subs: sum(subs), ads: sum(ads), verify: sum(ver), paid: sum(paid), refund: sum(ref) });
  })(); }, []);

  return (
    <AdminShell title="المركز المالي" subtitle="إيرادات، اشتراكات، إعلانات، توثيق، أرباح ومصروفات" icon={Wallet}>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Box label="اشتراكات نشطة" v={s.subs} />
        <Box label="إعلانات مدفوعة" v={s.ads} />
        <Box label="رسوم توثيق" v={s.verify} />
        <Box label="إجمالي مدفوع" v={s.paid} />
        <Box label="إجمالي مسترجع" v={s.refund} />
        <Box label="صافي" v={s.paid - s.refund} />
      </div>
      <Link to="/admin/payments" className="inline-flex items-center gap-1 rounded-2xl gradient-primary text-primary-foreground px-4 py-2 text-sm font-bold shadow-glow"><ArrowLeft size={14} /> فتح إدارة المدفوعات</Link>
    </AdminShell>
  );
}
function Box({ label, v }: { label: string; v: number }) {
  return <div className="rounded-3xl border bg-card p-5"><p className="text-2xl font-extrabold">${v.toLocaleString()}</p><p className="text-xs text-muted-foreground mt-1">{label}</p></div>;
}
