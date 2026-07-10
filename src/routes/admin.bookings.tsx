import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Calendar, Loader2, Search } from "lucide-react";
import AdminShell, { EmptyState } from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/bookings")({
  head: () => ({ meta: [{ title: "إدارة الحجوزات | الإدارة" }] }),
  component: BookingsAdmin,
});

type B = { id: string; booking_number: string; patient_name: string; provider_name: string; appointment_date: string; appointment_time: string; status: string; created_at: string; amount: number | null; currency: string | null; payment_method_code: string | null; payment_status: string | null; payment_reference: string | null; payment_proof_url: string | null };
const TABS = [
  { k: "all", t: "الكل" }, { k: "pending", t: "جديدة" }, { k: "confirmed", t: "مؤكدة" },
  { k: "completed", t: "مكتملة" }, { k: "cancelled", t: "ملغاة" }, { k: "no_show", t: "غير مكتملة" },
];
const PAY: Record<string, { l: string; c: string }> = {
  unpaid: { l: "غير مدفوع", c: "bg-muted text-muted-foreground" },
  on_arrival: { l: "عند الوصول", c: "bg-primary/10 text-primary" },
  pending_review: { l: "بانتظار التحقق", c: "bg-warning/15 text-warning" },
  paid: { l: "مدفوع", c: "bg-success/15 text-success" },
  refunded: { l: "مسترجع", c: "bg-destructive/10 text-destructive" },
};

function BookingsAdmin() {
  const [items, setItems] = useState<B[]>([]);
  const [tab, setTab] = useState("all");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, [tab]);
  async function load() {
    setLoading(true);
    let qb = supabase.from("bookings").select("*").order("created_at", { ascending: false }).limit(500);
    if (tab !== "all") qb = qb.eq("status", tab as any);
    const { data } = await qb;
    setItems((data ?? []) as B[]);
    setLoading(false);
  }
  async function setStatus(id: string, s: string) {
    const { error } = await supabase.from("bookings").update({ status: s as any }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("تم التحديث"); load();
  }

  async function setPay(id: string, payment_status: string) {
    const { error } = await supabase.from("bookings").update({ payment_status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("تم تحديث الدفع"); load();
  }

  const filtered = items.filter((b) => !q || b.booking_number?.includes(q) || b.patient_name?.includes(q) || b.provider_name?.includes(q));

  return (
    <AdminShell title="مركز إدارة الحجوزات" subtitle="جميع الحجوزات حسب الحالة" icon={Calendar}>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {TABS.map((t) => (
          <button key={t.k} onClick={() => setTab(t.k)}
            className={`shrink-0 rounded-2xl px-4 py-2 text-xs font-bold ${tab === t.k ? "gradient-primary text-primary-foreground shadow-glow" : "bg-muted text-muted-foreground"}`}>
            {t.t}
          </button>
        ))}
      </div>
      <div className="relative">
        <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث برقم الحجز، المريض، المنشأة..."
          className="w-full rounded-2xl border border-input bg-card pr-9 pl-3 py-2.5 text-sm" />
      </div>

      {loading ? <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>
        : filtered.length === 0 ? <EmptyState icon={Calendar} title="لا توجد حجوزات" />
        : <div className="rounded-3xl border bg-card overflow-hidden divide-y">
            {filtered.map((b) => (
              <div key={b.id} className="p-3 flex flex-wrap items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-extrabold text-xs">
                  {b.booking_number?.slice(-4) || "—"}
                </div>
                <div className="flex-1 min-w-[160px]">
                  <p className="font-bold text-sm">{b.patient_name} → {b.provider_name}</p>
                  <p className="text-[10px] text-muted-foreground">{b.appointment_date} • {b.appointment_time} • {b.booking_number}</p>
                </div>
                <select value={b.status} onChange={(e) => setStatus(b.id, e.target.value)}
                  className="rounded-xl border border-input bg-background px-2 py-1.5 text-xs">
                  <option value="pending">قيد المراجعة</option>
                  <option value="confirmed">مؤكدة</option>
                  <option value="completed">مكتملة</option>
                  <option value="cancelled">ملغاة</option>
                  <option value="no_show">غير مكتمل</option>
                </select>
              </div>
            ))}
          </div>}
    </AdminShell>
  );
}
