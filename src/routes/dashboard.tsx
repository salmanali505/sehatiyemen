import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight, Building2, Calendar, CheckCircle2, Clock, Loader2, Phone, Star, User,
  Stethoscope, Briefcase, Megaphone, Percent, Image as ImageIcon,
  Settings, BarChart3, Users as UsersIcon, Plus, Wallet, Bell, Home,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useRoles } from "@/lib/useRoles";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ProviderProfileEditor from "@/components/dashboard/ProviderProfileEditor";
import OffersManager from "@/components/dashboard/OffersManager";
import AdsManager from "@/components/dashboard/AdsManager";
import ServicesManager from "@/components/dashboard/ServicesManager";
import DoctorsManager from "@/components/dashboard/DoctorsManager";
import ReviewsManager from "@/components/dashboard/ReviewsManager";
import DashHero from "@/components/dashboard/DashHero";
import DashCard from "@/components/dashboard/DashCard";
import DashKpi from "@/components/dashboard/DashKpi";
import DashPeriodChips, { type Period } from "@/components/dashboard/DashPeriodChips";
import { DashQuickActions } from "@/components/dashboard/DashQuickAction";
import DashBottomNav from "@/components/dashboard/DashBottomNav";

export const Route = createFileRoute("/dashboard")({
  component: ProviderDashboard,
  head: () => ({ meta: [{ title: "لوحة مزوّد الخدمة | صحتي" }] }),
});

type Booking = {
  id: string; booking_number: string; patient_name: string; patient_phone: string;
  appointment_date: string; appointment_time: string; service_name: string | null;
  doctor_name: string | null; provider_name: string; provider_id: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  created_at: string; amount: number | null; currency: string | null;
  payment_method_code: string | null; payment_status: string | null;
  payment_reference: string | null; payment_proof_url: string | null;
};

const PAY_LABEL: Record<string, { l: string; c: string }> = {
  unpaid: { l: "غير مدفوع", c: "bg-muted text-muted-foreground" },
  on_arrival: { l: "دفع عند الوصول", c: "bg-primary/10 text-primary" },
  pending_review: { l: "بانتظار التحقق", c: "bg-warning/15 text-warning" },
  paid: { l: "مدفوع", c: "bg-success/15 text-success" },
  refunded: { l: "مسترجع", c: "bg-destructive/10 text-destructive" },
};

const STATUSES: { value: Booking["status"]; label: string; color: string }[] = [
  { value: "pending", label: "قيد الانتظار", color: "bg-warning/10 text-warning" },
  { value: "confirmed", label: "مؤكد", color: "bg-primary/10 text-primary" },
  { value: "completed", label: "مكتمل", color: "bg-success/10 text-success" },
  { value: "cancelled", label: "ملغي", color: "bg-destructive/10 text-destructive" },
];

type Tab = "home" | "profile" | "services" | "doctors" | "offers" | "ads" | "reviews" | "bookings";

function ProviderDashboard() {
  const { user, loading: authLoading } = useAuth();
  const { isProvider, isAdmin, loading: rolesLoading } = useRoles();
  const nav = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [providerIds, setProviderIds] = useState<string[]>([]);
  const [providerNames, setProviderNames] = useState<string[]>([]);
  const [logo, setLogo] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("home");
  const [period, setPeriod] = useState<Period>("day");

  useEffect(() => { if (!authLoading && !user) nav({ to: "/auth" }); }, [authLoading, user, nav]);

  useEffect(() => {
    if (!user || (!isProvider && !isAdmin)) return;
    void load();
  }, [user, isProvider, isAdmin]);

  useEffect(() => {
    if (!providerNames.length) return;
    const channel = supabase.channel("dashboard-bookings")
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, (payload) => {
        const row: any = payload.new ?? payload.old;
        if (row && providerNames.includes(row.provider_name)) void load();
      }).subscribe();
    return () => { supabase.removeChannel(channel); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [providerNames.join("|")]);

  async function load() {
    if (!user) return;
    setLoading(true);
    const { data: myProviders } = await supabase
      .from("providers").select("id, name, logo_url").eq("owner_user_id", user.id);
    const ids = (myProviders ?? []).map((p) => p.id);
    const names = (myProviders ?? []).map((p) => p.name);
    setProviderIds(ids); setProviderNames(names);
    setLogo((myProviders?.[0] as any)?.logo_url ?? null);
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
  async function setPayment(id: string, payment_status: string) {
    const { error } = await supabase.from("bookings").update({ payment_status }).eq("id", id);
    if (error) return toast.error(error.message);
    setBookings((b) => b.map((x) => (x.id === id ? { ...x, payment_status } : x)));
    toast.success("تم تحديث حالة الدفع");
  }

  const kpis = useMemo(() => {
    const now = new Date();
    const start = new Date(now);
    if (period === "day") start.setHours(0, 0, 0, 0);
    else if (period === "week") start.setDate(now.getDate() - 7);
    else if (period === "month") start.setMonth(now.getMonth() - 1);
    else start.setFullYear(now.getFullYear() - 1);
    const filtered = bookings.filter((b) => new Date(b.created_at) >= start);
    const revenue = filtered.filter((b) => b.payment_status === "paid").reduce((s, b) => s + Number(b.amount || 0), 0);
    return {
      total: filtered.length,
      pending: filtered.filter((b) => b.status === "pending").length,
      completed: filtered.filter((b) => b.status === "completed").length,
      revenue,
    };
  }, [bookings, period]);

  if (authLoading || rolesLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;
  }
  if (!isProvider && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 text-center" dir="rtl">
        <div>
          <Building2 className="mx-auto text-muted-foreground mb-3" size={40} />
          <h1 className="font-extrabold text-xl">حسابك غير مرتبط بمزوّد خدمة</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs">تواصل مع إدارة صحتي لتفعيل لوحة المزوّد.</p>
          <Link to="/" className="inline-block mt-4 rounded-2xl gradient-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-glow">العودة للرئيسية</Link>
        </div>
      </div>
    );
  }

  const providerName = providerNames[0] || "منشأتك";
  const providerCount = providerNames.length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/40 to-background pb-16" dir="rtl">
      <DashHero
        title={providerName}
        subtitle={providerCount > 1 ? `${providerCount} منشآت مرتبطة بحسابك` : "إليك ما حدث مع منشأتك اليوم"}
        avatarSrc={logo}
        avatarFallback={providerName.charAt(0)}
        back="/"
      />

      <main className="mx-auto max-w-6xl px-4 -mt-12 relative z-10 space-y-5">
        {tab === "home" ? (
          <>
            {/* Quick actions */}
            <DashQuickActions items={[
              { to: "/dashboard/reception", icon: UsersIcon, label: "الاستقبال", hue: "primary" },
              { onClick: () => setTab("services"), icon: Briefcase, label: "خدمة جديدة", hue: "accent" },
              { onClick: () => setTab("doctors"), icon: Stethoscope, label: "طبيب جديد", hue: "success" },
              { onClick: () => setTab("offers"), icon: Percent, label: "عرض جديد", hue: "warning" },
              { onClick: () => setTab("ads"), icon: Megaphone, label: "إعلان جديد", hue: "warning" },
              { onClick: () => setTab("profile"), icon: Settings, label: "بيانات المنشأة", hue: "primary" },
            ]} />

            {/* Period + KPIs */}
            <DashPeriodChips value={period} onChange={setPeriod} />
            <section className="grid grid-cols-2 gap-3">
              <DashKpi icon={Calendar} label="الحجوزات" value={kpis.total} hue="primary" />
              <DashKpi icon={Wallet} label="الإيرادات (ر.ي)" value={kpis.revenue.toLocaleString("ar-EG")} hue="success" />
              <DashKpi icon={Clock} label="بانتظار التأكيد" value={kpis.pending} hue="warning" />
              <DashKpi icon={CheckCircle2} label="مكتملة" value={kpis.completed} hue="accent" />
            </section>

            {/* Big card grid — sections */}
            <section>
              <h2 className="text-sm font-black mb-3 px-1">أقسام المنشأة</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                <DashCard onClick={() => setTab("bookings")} icon={Calendar} title="الحجوزات" desc="إدارة كل الحجوزات القادمة" count={bookings.length} hue="primary" />
                <DashCard onClick={() => setTab("services")} icon={Briefcase} title="الخدمات" desc="أسعار وخدمات المنشأة" hue="accent" />
                <DashCard onClick={() => setTab("doctors")} icon={Stethoscope} title="الأطباء" desc="جدول الأطباء والتخصصات" hue="success" />
                <DashCard onClick={() => setTab("offers")} icon={Percent} title="العروض" desc="عروض وخصومات مؤقتة" hue="warning" />
                <DashCard onClick={() => setTab("ads")} icon={Megaphone} title="الإعلانات" desc="بنرات وحملات المنشأة" hue="warning" />
                <DashCard onClick={() => setTab("reviews")} icon={Star} title="التقييمات" desc="تقييمات العملاء والردود" hue="accent" />
                <DashCard onClick={() => setTab("profile")} icon={ImageIcon} title="المعرض والصور" desc="صور المنشأة والفيديوهات" hue="primary" />
                <DashCard to="/dashboard/reception" icon={UsersIcon} title="الاستقبال" desc="حسابات موظفي الاستقبال" hue="primary" />
                <DashCard onClick={() => setTab("profile")} icon={Building2} title="بيانات المنشأة" desc="الاسم، النوع، الموقع، الوصف" hue="accent" />
                <DashCard onClick={() => setTab("home")} icon={BarChart3} title="الإحصائيات" desc="تفاصيل الأداء والزيارات" count={kpis.total} hue="success" />
                <DashCard to="/notifications" icon={Bell} title="الإشعارات" desc="آخر تنبيهات النظام" hue="primary" />
                <DashCard to="/profile" icon={Settings} title="الإعدادات" desc="حسابك وتفضيلاتك" hue="accent" />
              </div>
            </section>
          </>
        ) : (
          <button onClick={() => setTab("home")} className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:gap-3 transition-all">
            <ArrowRight size={14} className="rotate-180" /> العودة إلى الرئيسية
          </button>
        )}

        {tab === "profile" && user && <ProviderProfileEditor userId={user.id} />}
        {tab === "services" && <ServicesManager providerIds={providerIds} />}
        {tab === "doctors" && <DoctorsManager providerIds={providerIds} />}
        {tab === "offers" && <OffersManager providerIds={providerIds} />}
        {tab === "ads" && <AdsManager providerIds={providerIds} />}
        {tab === "reviews" && <ReviewsManager providerIds={providerIds} />}

        {tab === "bookings" && (
          <section className="rounded-3xl border bg-card overflow-hidden shadow-sm">
            <div className="p-4 border-b flex items-center gap-2">
              <Star size={18} className="text-primary" />
              <h2 className="font-extrabold">الحجوزات الواردة</h2>
              <span className="text-xs text-muted-foreground">({bookings.length})</span>
            </div>
            {loading ? (
              <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>
            ) : bookings.length === 0 ? (
              <div className="p-12 text-center text-sm text-muted-foreground">لا توجد حجوزات بعد.</div>
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
                            <a href={`tel:${b.patient_phone}`} className="flex items-center gap-1 text-primary"><Phone size={12} /> {b.patient_phone}</a>
                          </div>
                          {(b.doctor_name || b.service_name) && (
                            <p className="text-xs mt-1">
                              {b.doctor_name && <span className="font-semibold">{b.doctor_name}</span>}
                              {b.doctor_name && b.service_name && " • "}
                              {b.service_name}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className={`text-[10px] font-bold rounded-full px-2.5 py-1 ${status.color}`}>{status.label}</span>
                          {b.payment_status && (
                            <span className={`text-[10px] font-bold rounded-full px-2 py-0.5 ${(PAY_LABEL[b.payment_status] ?? PAY_LABEL.unpaid).c}`}>
                              {(PAY_LABEL[b.payment_status] ?? PAY_LABEL.unpaid).l}
                            </span>
                          )}
                        </div>
                      </div>
                      {(b.amount || b.payment_method_code || b.payment_reference || b.payment_proof_url) && (
                        <div className="mt-3 rounded-2xl border border-border/60 bg-muted/40 p-3 space-y-2">
                          <div className="flex flex-wrap items-center gap-3 text-[11px]">
                            {b.amount ? <span className="font-bold">المبلغ: {Number(b.amount).toLocaleString("ar-EG")} {b.currency || "ر.ي"}</span> : null}
                            {b.payment_method_code && <span className="rounded-full bg-primary/10 text-primary px-2 py-0.5 font-bold font-mono" dir="ltr">{b.payment_method_code}</span>}
                            {b.payment_reference && <span className="text-muted-foreground">مرجع: <span className="font-mono">{b.payment_reference}</span></span>}
                          </div>
                          {b.payment_proof_url && (
                            <a href={b.payment_proof_url} target="_blank" rel="noreferrer" className="block">
                              <img src={b.payment_proof_url} alt="إثبات الدفع" className="max-h-40 rounded-xl border" />
                            </a>
                          )}
                          {b.payment_status === "pending_review" && (
                            <div className="flex gap-2 pt-1">
                              <button onClick={() => setPayment(b.id, "paid")} className="flex-1 rounded-xl bg-success/15 text-success text-[11px] font-bold py-1.5">✓ تأكيد الدفع</button>
                              <button onClick={() => setPayment(b.id, "unpaid")} className="flex-1 rounded-xl bg-destructive/15 text-destructive text-[11px] font-bold py-1.5">✕ رفض</button>
                            </div>
                          )}
                        </div>
                      )}
                      <div className="mt-3 flex flex-wrap gap-2">
                        {STATUSES.filter((s) => s.value !== b.status).map((s) => (
                          <button key={s.value} onClick={() => changeStatus(b.id, s.value)} className="text-[11px] font-bold rounded-xl bg-muted hover:bg-muted/70 px-3 py-1.5">→ {s.label}</button>
                        ))}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
