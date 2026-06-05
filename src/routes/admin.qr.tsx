import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { QrCode, Loader2 } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/qr")({
  head: () => ({ meta: [{ title: "QR والمواعيد | الإدارة" }] }),
  component: Qr,
});

function Qr() {
  const [s, setS] = useState({ total: 0, checked: 0, noshow: 0, pending: 0 });
  const [recent, setRecent] = useState<any[]>([]);
  useEffect(() => { (async () => {
    const [t, c, n, p, r] = await Promise.all([
      supabase.from("bookings").select("*", { count: "exact", head: true }),
      supabase.from("bookings").select("*", { count: "exact", head: true }).eq("status", "completed" as any),
      supabase.from("bookings").select("*", { count: "exact", head: true }).eq("status", "no_show" as any),
      supabase.from("bookings").select("*", { count: "exact", head: true }).eq("status", "pending" as any),
      supabase.from("bookings").select("booking_number, patient_name, status, appointment_date").eq("status", "completed" as any).order("created_at", { ascending: false }).limit(20),
    ]);
    setS({ total: t.count ?? 0, checked: c.count ?? 0, noshow: n.count ?? 0, pending: p.count ?? 0 });
    setRecent(r.data ?? []);
  })(); }, []);

  return (
    <AdminShell title="إدارة QR والمواعيد" subtitle="سجلات المسح، الحضور، الغياب، الإعدادات" icon={QrCode}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Box label="إجمالي الحجوزات" v={s.total} />
        <Box label="حضور" v={s.checked} hue="success" />
        <Box label="غياب" v={s.noshow} hue="destructive" />
        <Box label="قيد المراجعة" v={s.pending} hue="warning" />
      </div>
      <div className="rounded-3xl border bg-card overflow-hidden">
        <div className="p-4 border-b font-extrabold">آخر سجلات الحضور</div>
        {recent.length === 0 ? <div className="p-8 text-center text-sm text-muted-foreground">لا توجد سجلات</div>
          : <div className="divide-y">
            {recent.map((r) => (
              <div key={r.booking_number} className="p-3 flex items-center gap-3 text-sm">
                <span className="flex-1">{r.patient_name}</span>
                <span className="text-[10px] text-muted-foreground">{r.booking_number}</span>
                <span className="text-[10px] text-muted-foreground">{r.appointment_date}</span>
              </div>
            ))}
          </div>}
      </div>
    </AdminShell>
  );
}
function Box({ label, v, hue = "primary" }: any) {
  return <div className="rounded-3xl border bg-card p-5"><p className={`text-3xl font-extrabold text-${hue}`}>{v.toLocaleString("ar")}</p><p className="text-xs text-muted-foreground mt-1">{label}</p></div>;
}
