import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Building2, Calendar, CheckCircle2, Clock, Loader2, Phone, Star, User } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useRoles } from "@/lib/useRoles";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard")({
  component: ProviderDashboard,
  head: () => ({ meta: [{ title: "لوحة مزوّد الخدمة | صحتي" }] }),
});

type Booking = {
  id: string;
  booking_number: string;
  patient_name: string;
  patient_phone: string;
  appointment_date: string;
  appointment_time: string;
  service_name: string | null;
  doctor_name: string | null;
  provider_name: string;
  provider_id: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  created_at: string;
};

const STATUSES: { value: Booking["status"]; label: string; color: string }[] = [
  { value: "pending", label: "قيد الانتظار", color: "bg-warning/10 text-warning" },
  { value: "confirmed", label: "مؤكد", color: "bg-primary/10 text-primary" },
  { value: "completed", label: "مكتمل", color: "bg-success/10 text-success" },
  { value: "cancelled", label: "ملغي", color: "bg-destructive/10 text-destructive" },
];

function ProviderDashboard() {
  const { user, loading: authLoading } = useAuth();
  const { isProvider, isAdmin, loading: rolesLoading } = useRoles();
  const nav = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [providerIds, setProviderIds] = useState<string[]>([]);
  const [providerNames, setProviderNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) nav({ to: "/auth" });
  }, [authLoading, user, nav]);

  useEffect(() => {
    if (!user || (!isProvider && !isAdmin)) return;
    void load();
  }, [user, isProvider, isAdmin]);

  async function load() {
    if (!user) return;
    setLoading(true);
    const { data: myProviders } = await supabase
      .from("providers")
      .select("id, name")
      .eq("owner_user_id", user.id);

    const ids = (myProviders ?? []).map((p) => p.id);
    const names = (myProviders ?? []).map((p) => p.name);
    setProviderIds(ids);
    setProviderNames(names);

    // Bookings target provider_id as text (mock IDs). Match by name as fallback.
    let q = supabase.from("bookings").select("*").order("appointment_date", { ascending: false }).limit(200);
    if (ids.length) q = q.or([
      `provider_id.in.(${ids.join(",")})`,
      `provider_name.in.(${names.map((n) => `"${n}"`).join(",")})`,
    ].join(","));
    const { data } = await q;
    setBookings((data ?? []) as Booking[]);
    setLoading(false);
  }

  async function changeStatus(id: string, status: Booking["status"]) {
    const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    setBookings((b) => b.map((x) => (x.id === id ? { ...x, status } : x)));
    toast.success("تم تحديث الحالة");
  }

  if (authLoading || rolesLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;
  }

  if (!isProvider && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 text-center" dir="rtl">
        <div>
          <Building2 className="mx-auto text-muted-foreground mb-3" size={40} />
          <h1 className="font-extrabold text-xl">حسابك غير مرتبط بمزوّد خدمة</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs">
            تواصل مع إدارة صحتي لتسجيل عيادتك / مستشفاك وتفعيل لوحة المزوّد.
          </p>
          <Link to="/" className="inline-block mt-4 rounded-2xl gradient-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-glow">
            العودة للرئيسية
          </Link>
        </div>
      </div>
    );
  }

  const today = new Date().toISOString().slice(0, 10);
  const todayCount = bookings.filter((b) => b.appointment_date === today).length;
  const pendingCount = bookings.filter((b) => b.status === "pending").length;
  const completedCount = bookings.filter((b) => b.status === "completed").length;

  return (
    <div className="min-h-screen bg-background pb-12" dir="rtl">
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-background/85 border-b">
        <div className="mx-auto max-w-4xl px-4 py-4 flex items-center gap-3">
          <Link to="/" className="rounded-xl p-2 hover:bg-muted"><ArrowRight size={20} /></Link>
          <div className="flex-1">
            <h1 className="font-extrabold text-lg">لوحة مزوّد الخدمة</h1>
            <p className="text-xs text-muted-foreground">
              {providerNames.length ? providerNames.join(" • ") : "لا توجد منشأة مرتبطة"}
            </p>
          </div>
          <div className="w-10 h-10 rounded-2xl gradient-primary flex items-center justify-center shadow-glow">
            <Building2 className="text-primary-foreground" size={18} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6 space-y-6">
        <section className="grid grid-cols-3 gap-3">
          <Mini icon={Calendar} value={todayCount} label="حجوزات اليوم" />
          <Mini icon={Clock} value={pendingCount} label="بانتظار التأكيد" />
          <Mini icon={CheckCircle2} value={completedCount} label="مكتملة" />
        </section>

        <section className="rounded-3xl border bg-card overflow-hidden shadow-sm">
          <div className="p-4 border-b flex items-center gap-2">
            <Star size={18} className="text-primary" />
            <h2 className="font-extrabold">الحجوزات الواردة</h2>
            <span className="text-xs text-muted-foreground">({bookings.length})</span>
          </div>
          {loading ? (
            <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>
          ) : bookings.length === 0 ? (
            <div className="p-12 text-center text-sm text-muted-foreground">
              لا توجد حجوزات بعد.
            </div>
          ) : (
            <div className="divide-y">
              {bookings.map((b) => {
                const status = STATUSES.find((s) => s.value === b.status)!;
                return (
                  <motion.div key={b.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4">
                    <div className="flex flex-wrap items-start gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary/15 to-accent/15 flex items-center justify-center">
                        <User size={18} className="text-primary" />
                      </div>
                      <div className="flex-1 min-w-[180px]">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold">{b.patient_name}</h3>
                          <span className="text-[10px] font-mono text-muted-foreground">#{b.booking_number}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1 flex-wrap">
                          <span className="flex items-center gap-1"><Calendar size={12} /> {b.appointment_date}</span>
                          <span className="flex items-center gap-1"><Clock size={12} /> {b.appointment_time}</span>
                          <a href={`tel:${b.patient_phone}`} className="flex items-center gap-1 text-primary">
                            <Phone size={12} /> {b.patient_phone}
                          </a>
                        </div>
                        {(b.doctor_name || b.service_name) && (
                          <p className="text-xs mt-1">
                            {b.doctor_name && <span className="font-semibold">{b.doctor_name}</span>}
                            {b.doctor_name && b.service_name && " • "}
                            {b.service_name}
                          </p>
                        )}
                      </div>
                      <span className={`text-[10px] font-bold rounded-full px-2.5 py-1 ${status.color}`}>{status.label}</span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {STATUSES.filter((s) => s.value !== b.status).map((s) => (
                        <button
                          key={s.value}
                          onClick={() => changeStatus(b.id, s.value)}
                          className="text-[11px] font-bold rounded-xl bg-muted hover:bg-muted/70 px-3 py-1.5"
                        >
                          → {s.label}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function Mini({ icon: Icon, value, label }: { icon: any; value: number; label: string }) {
  return (
    <div className="rounded-3xl border bg-card p-4 text-center">
      <div className="w-10 h-10 mx-auto rounded-2xl gradient-primary flex items-center justify-center mb-2 shadow-glow">
        <Icon size={18} className="text-primary-foreground" />
      </div>
      <p className="text-2xl font-extrabold">{value}</p>
      <p className="text-[11px] text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}
