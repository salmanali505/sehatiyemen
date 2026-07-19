import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Shield, ArrowRight, Loader2, Users, Building2, Calendar, TrendingUp, TrendingDown,
  ChevronLeft, Sparkles, Search, Stethoscope, DollarSign, CreditCard, Bell,
  Activity, UserPlus, ClipboardCheck, Wallet, Megaphone, Percent, Home as HomeIcon,
  Settings, BarChart3, MessageSquare,
} from "lucide-react";
import {
  AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, BarChart, Bar, Legend,
} from "recharts";
import { useAuth } from "@/lib/auth-context";
import { useRoles } from "@/lib/useRoles";
import { supabase } from "@/integrations/supabase/client";
import { CENTERS, GROUPS, type Center } from "@/lib/adminCenters";
import DashHero from "@/components/dashboard/DashHero";
import DashCard from "@/components/dashboard/DashCard";
import DashKpi from "@/components/dashboard/DashKpi";
import DashPeriodChips, { type Period } from "@/components/dashboard/DashPeriodChips";
import { DashQuickActions } from "@/components/dashboard/DashQuickAction";
import DashBottomNav from "@/components/dashboard/DashBottomNav";



export const Route = createFileRoute("/admin/")({
  component: AdminHub,
  head: () => ({ meta: [{ title: "لوحة التحكم العليا | صحتي" }] }),
});

type Stats = {
  users: number; providers: number; doctors: number; bookings: number;
  bookingsToday: number; bookingsMonth: number; bookingsYear: number;
  revenue: number; revenueMonth: number; subsActive: number; subsExpired: number;
  ads: number; adsActive: number; favorites: number; reviews: number;
  clinics: number; hospitals: number; labs: number; radiology: number; pharmacies: number;
  pendingProviders: number; pendingPayments: number; openTickets: number;
};

const EMPTY: Stats = {
  users: 0, providers: 0, doctors: 0, bookings: 0, bookingsToday: 0, bookingsMonth: 0, bookingsYear: 0,
  revenue: 0, revenueMonth: 0, subsActive: 0, subsExpired: 0, ads: 0, adsActive: 0,
  favorites: 0, reviews: 0, clinics: 0, hospitals: 0, labs: 0, radiology: 0, pharmacies: 0,
  pendingProviders: 0, pendingPayments: 0, openTickets: 0,
};

function AdminHub() {
  const { user, loading: aL } = useAuth();
  const { isAdmin, loading: rL } = useRoles();
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const [stats, setStats] = useState<Stats>(EMPTY);
  const [trend, setTrend] = useState<{ day: string; bookings: number; revenue: number }[]>([]);
  const [byType, setByType] = useState<{ name: string; value: number; color: string }[]>([]);
  const [statusMix, setStatusMix] = useState<{ status: string; count: number }[]>([]);
  const [recent, setRecent] = useState<{ name: string; when: string; kind: string }[]>([]);
  const [newUsers, setNewUsers] = useState<any[]>([]);
  const [recentPayments, setRecentPayments] = useState<any[]>([]);
  const [busy, setBusy] = useState(true);
  const [period, setPeriod] = useState<Period>("month");

  const periodDays = period === "day" ? 1 : period === "week" ? 7 : period === "month" ? 30 : 90;
  const trendView = useMemo(() => trend.slice(trend.length - periodDays), [trend, periodDays]);
  const prevView = useMemo(() => trend.slice(Math.max(0, trend.length - periodDays * 2), trend.length - periodDays), [trend, periodDays]);
  const totalB = trendView.reduce((s, x) => s + x.bookings, 0);
  const totalR = trendView.reduce((s, x) => s + x.revenue, 0);
  const prevB = prevView.reduce((s, x) => s + x.bookings, 0);
  const prevR = prevView.reduce((s, x) => s + x.revenue, 0);
  const dB = prevB ? Math.round(((totalB - prevB) / prevB) * 100) : (totalB ? 100 : 0);
  const dR = prevR ? Math.round(((totalR - prevR) / prevR) * 100) : (totalR ? 100 : 0);

  useEffect(() => { if (!aL && !user) nav({ to: "/auth" }); }, [aL, user, nav]);
  useEffect(() => { if (isAdmin) void load(); }, [isAdmin]);

  async function load() {
    setBusy(true);
    const now = new Date();
    const today = new Date(now); today.setHours(0, 0, 0, 0);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const yearStart = new Date(now.getFullYear(), 0, 1);
    const thirtyAgo = new Date(now); thirtyAgo.setDate(now.getDate() - 89); thirtyAgo.setHours(0, 0, 0, 0);

    const [u, p, b, r, bt, bm, by, subsA, subsE, ads, adsA, fav, byT, pend, pendPay, tix,
      bk30, pay30, recB, recP, regs, doctorsB, payRecent, statusB] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("providers").select("*", { count: "exact", head: true }),
      supabase.from("bookings").select("*", { count: "exact", head: true }),
      supabase.from("reviews").select("*", { count: "exact", head: true }),
      supabase.from("bookings").select("*", { count: "exact", head: true }).gte("created_at", today.toISOString()),
      supabase.from("bookings").select("*", { count: "exact", head: true }).gte("created_at", monthStart.toISOString()),
      supabase.from("bookings").select("*", { count: "exact", head: true }).gte("created_at", yearStart.toISOString()),
      supabase.from("subscriptions").select("amount", { count: "exact" }).eq("status", "active"),
      supabase.from("subscriptions").select("*", { count: "exact", head: true }).eq("status", "expired"),
      supabase.from("ads").select("*", { count: "exact", head: true }),
      supabase.from("ads").select("*", { count: "exact", head: true }).eq("active", true),
      supabase.from("favorites").select("*", { count: "exact", head: true }),
      supabase.from("providers").select("type"),
      supabase.from("providers").select("*", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("payments").select("*", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("support_tickets").select("*", { count: "exact", head: true }).eq("status", "open"),
      supabase.from("bookings").select("created_at").gte("created_at", thirtyAgo.toISOString()),
      supabase.from("payments").select("amount, created_at, status").gte("created_at", thirtyAgo.toISOString()),
      supabase.from("bookings").select("patient_name, provider_name, created_at").order("created_at", { ascending: false }).limit(6),
      supabase.from("providers").select("name, type, created_at").order("created_at", { ascending: false }).limit(6),
      supabase.from("profiles").select("full_name, phone, created_at").order("created_at", { ascending: false }).limit(6),
      supabase.from("bookings").select("doctor_name").not("doctor_name", "is", null).limit(5000),
      supabase.from("payments").select("amount, kind, status, method, created_at, provider_id").order("created_at", { ascending: false }).limit(6),
      supabase.from("bookings").select("status"),
    ]);

    const revenue = (subsA.data ?? []).reduce((s, x: any) => s + Number(x.amount || 0), 0);
    const revenueMonth = (pay30.data ?? []).filter((x: any) => x.status === "paid" && new Date(x.created_at) >= monthStart)
      .reduce((s: number, x: any) => s + Number(x.amount || 0), 0);
    const types = (byT.data ?? []).reduce((m: any, x: any) => { m[x.type] = (m[x.type] || 0) + 1; return m; }, {});
    const docSet = new Set((doctorsB.data ?? []).map((x: any) => x.doctor_name));

    setStats({
      users: u.count ?? 0, providers: p.count ?? 0, doctors: docSet.size,
      bookings: b.count ?? 0, bookingsToday: bt.count ?? 0, bookingsMonth: bm.count ?? 0, bookingsYear: by.count ?? 0,
      revenue, revenueMonth, subsActive: subsA.count ?? 0, subsExpired: subsE.count ?? 0,
      ads: ads.count ?? 0, adsActive: adsA.count ?? 0, favorites: fav.count ?? 0, reviews: r.count ?? 0,
      clinics: types.clinic || 0, hospitals: types.hospital || 0, labs: types.lab || 0,
      radiology: types.radiology || 0, pharmacies: types.pharmacy || 0,
      pendingProviders: pend.count ?? 0, pendingPayments: pendPay.count ?? 0, openTickets: tix.count ?? 0,
    });

    // 90-day trend
    const days: { day: string; bookings: number; revenue: number }[] = [];
    for (let i = 0; i < 90; i++) {
      const d = new Date(thirtyAgo); d.setDate(thirtyAgo.getDate() + i);
      days.push({ day: `${d.getDate()}/${d.getMonth() + 1}`, bookings: 0, revenue: 0 });
    }
    for (const x of bk30.data ?? []) {
      const idx = Math.floor((+new Date(x.created_at) - +thirtyAgo) / 86400000);
      if (idx >= 0 && idx < 90) days[idx].bookings++;
    }
    for (const x of pay30.data ?? []) {
      if (x.status !== "paid") continue;
      const idx = Math.floor((+new Date(x.created_at) - +thirtyAgo) / 86400000);
      if (idx >= 0 && idx < 90) days[idx].revenue += Number(x.amount || 0);
    }
    setTrend(days);

    setByType([
      { name: "عيادات", value: types.clinic || 0, color: "hsl(var(--primary))" },
      { name: "مستشفيات", value: types.hospital || 0, color: "hsl(var(--accent))" },
      { name: "مختبرات", value: types.lab || 0, color: "hsl(var(--warning))" },
      { name: "أشعة", value: types.radiology || 0, color: "hsl(var(--success))" },
      { name: "صيدليات", value: types.pharmacy || 0, color: "hsl(var(--destructive))" },
    ].filter((x) => x.value > 0));

    const statusMap: Record<string, number> = {};
    for (const r of statusB.data ?? []) statusMap[r.status] = (statusMap[r.status] || 0) + 1;
    setStatusMix(Object.entries(statusMap).map(([s, c]) => ({ status: arStatus(s), count: c })));

    const ra = [
      ...(recB.data ?? []).map((x: any) => ({ name: `حجز جديد: ${x.patient_name} → ${x.provider_name}`, when: x.created_at, kind: "booking" })),
      ...(recP.data ?? []).map((x: any) => ({ name: `منشأة جديدة: ${x.name}`, when: x.created_at, kind: "provider" })),
    ].sort((a, b) => +new Date(b.when) - +new Date(a.when)).slice(0, 8);
    setRecent(ra);
    setNewUsers(regs.data ?? []);
    setRecentPayments(payRecent.data ?? []);
    setBusy(false);
  }

  if (aL || rL) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;
  if (!isAdmin) return (
    <div className="min-h-screen flex items-center justify-center px-6 text-center" dir="rtl">
      <div>
        <Shield className="mx-auto text-muted-foreground mb-3" size={40} />
        <h1 className="font-extrabold text-xl">صلاحية غير متوفرة</h1>
        <Link to="/" className="inline-block mt-4 rounded-2xl gradient-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-glow">العودة للرئيسية</Link>
      </div>
    </div>
  );

  const filtered = CENTERS.filter((c) => !q || c.title.includes(q) || c.desc.includes(q));
  const grouped: Record<string, Center[]> = {};
  filtered.forEach((c) => { (grouped[c.group] ??= []).push(c); });

  const displayName = (user?.user_metadata as any)?.full_name || user?.email?.split("@")[0] || "المشرف";
  const topCenters = CENTERS.slice(0, 12);

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/40 to-background pb-32 md:pb-16" dir="rtl">
      <DashHero
        title={`مرحباً، ${displayName}`}
        subtitle="مركز التحكم الكامل لمنصة صحتي"
        greeting="لوحة التحكم العليا"
        avatarFallback={displayName.charAt(0).toUpperCase()}
        back="/"
        notifCount={stats.pendingProviders + stats.pendingPayments + stats.openTickets}
      />

      <main className="mx-auto max-w-7xl px-4 py-6 -mt-12 relative z-10 space-y-6">
        {/* Quick actions */}
        <DashQuickActions items={[
          { to: "/admin/facilities", icon: Building2, label: "المنشآت", hue: "primary" },
          { to: "/admin/verification", icon: Shield, label: "التوثيق", hue: "warning" },
          { to: "/admin/ads", icon: Megaphone, label: "الإعلانات", hue: "warning" },
          { to: "/admin/offers", icon: Percent, label: "العروض", hue: "accent" },
          { to: "/admin/notifications", icon: Bell, label: "بث إشعار", hue: "primary" },
          { to: "/admin/home", icon: HomeIcon, label: "الرئيسية", hue: "success" },
          { to: "/admin/settings", icon: Settings, label: "الإعدادات", hue: "primary" },
        ]} />

        {/* Big card grid — control centers */}
        <section>
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-sm font-black">مراكز التحكم</h2>
            <Link to="/admin" className="text-[11px] font-bold text-primary">الكل ({CENTERS.length})</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {topCenters.map((c) => (
              <DashCard key={c.id} to={c.to} icon={c.icon} title={c.title} desc={c.desc} hue={c.hue as any} />
            ))}
          </div>
        </section>

        {/* Alerts */}
        {(stats.pendingProviders + stats.pendingPayments + stats.openTickets) > 0 && (
          <section className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <AlertCard count={stats.pendingProviders} label="منشآت بانتظار المراجعة" to="/admin/facilities" tone="warning" />
            <AlertCard count={stats.pendingPayments} label="مدفوعات معلّقة" to="/admin/payments" tone="destructive" />

            <AlertCard count={stats.openTickets} label="تذاكر دعم مفتوحة" to="/admin/support" tone="primary" />
          </section>
        )}

        {/* KPI Hero */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KPI label="المستخدمون" value={stats.users} icon={Users} hue="primary" sub={`+${newUsers.length} حديثاً`} />
          <KPI label="المنشآت" value={stats.providers} icon={Building2} hue="accent" sub={`${stats.doctors} طبيب`} />
          <KPI label="الحجوزات" value={stats.bookings} icon={Calendar} hue="success" sub={`اليوم: ${stats.bookingsToday}`} />
          <KPI label="إيراد الاشتراكات" value={`$${stats.revenue.toLocaleString()}`} icon={DollarSign} hue="warning" sub={`الشهر: $${stats.revenueMonth.toLocaleString()}`} />
        </section>

        <section className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
          <Mini label="حجوزات السنة" value={stats.bookingsYear} />
          <Mini label="حجوزات الشهر" value={stats.bookingsMonth} />
          <Mini label="اشتراكات نشطة" value={stats.subsActive} />
          <Mini label="اشتراكات منتهية" value={stats.subsExpired} />
          <Mini label="إعلانات نشطة" value={stats.adsActive} />
          <Mini label="تقييمات" value={stats.reviews} />
          <Mini label="مفضلات" value={stats.favorites} />
          <Mini label="إعلانات الكل" value={stats.ads} />
        </section>

        {/* Charts */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <div className="lg:col-span-2 rounded-3xl border bg-card p-4">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <Activity size={16} className="text-primary" />
              <h3 className="font-extrabold flex-1">تطور الحجوزات والإيرادات</h3>
              <div className="w-full md:w-auto">
                <DashPeriodChips value={period} onChange={setPeriod} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-3">
              <SummaryPill label="حجوزات الفترة" value={totalB.toLocaleString("ar")} delta={dB} hue="primary" icon={Calendar} />
              <SummaryPill label="إيرادات الفترة" value={`$${totalR.toLocaleString()}`} delta={dR} hue="warning" icon={DollarSign} />
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendView}>
                  <defs>
                    <linearGradient id="gb" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.6} />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gr" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--warning))" stopOpacity={0.6} />
                      <stop offset="100%" stopColor="hsl(var(--warning))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Area type="monotone" dataKey="bookings" name="حجوزات" stroke="hsl(var(--primary))" fill="url(#gb)" strokeWidth={2} />
                  <Area type="monotone" dataKey="revenue" name="إيرادات" stroke="hsl(var(--warning))" fill="url(#gr)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-3xl border bg-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Building2 size={16} className="text-accent" />
              <h3 className="font-extrabold">توزيع المنشآت</h3>
            </div>
            <div className="h-64">
              {byType.length === 0 ? <Empty /> : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={byType} dataKey="value" nameKey="name" innerRadius={45} outerRadius={80} paddingAngle={3}>
                      {byType.map((d, i) => <Cell key={i} fill={d.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <div className="rounded-3xl border bg-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <ClipboardCheck size={16} className="text-success" />
              <h3 className="font-extrabold">حالات الحجوزات</h3>
            </div>
            <div className="h-48">
              {statusMix.length === 0 ? <Empty /> : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statusMix}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="status" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="rounded-3xl border bg-card p-4 grid grid-cols-5 gap-2">
            <TypeBox label="عيادات" v={stats.clinics} />
            <TypeBox label="مستشفيات" v={stats.hospitals} />
            <TypeBox label="مختبرات" v={stats.labs} />
            <TypeBox label="أشعة" v={stats.radiology} />
            <TypeBox label="صيدليات" v={stats.pharmacies} />
            <div className="col-span-5 mt-2 text-[10px] text-muted-foreground text-center">إجمالي المنشآت المسجلة على المنصة بحسب النوع</div>
          </div>
        </section>

        {/* Activity feeds */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <FeedCard title="أحدث الأنشطة" icon={Sparkles} hue="warning" empty={recent.length === 0} to="/admin/audit">
            {recent.map((r, i) => (
              <li key={i} className="p-3 flex items-center gap-2 text-sm">
                <span className={`w-2 h-2 rounded-full ${r.kind === "booking" ? "bg-success" : "bg-primary"}`} />
                <span className="flex-1 truncate">{r.name}</span>
                <span className="text-[10px] text-muted-foreground shrink-0">{rel(r.when)}</span>
              </li>
            ))}
          </FeedCard>

          <FeedCard title="أحدث التسجيلات" icon={UserPlus} hue="primary" empty={newUsers.length === 0} to="/admin/users">
            {newUsers.map((u, i) => (
              <li key={i} className="p-3 flex items-center gap-2 text-sm">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">{(u.full_name || "؟").charAt(0)}</div>
                <div className="flex-1 min-w-0"><p className="font-bold truncate">{u.full_name || "بدون اسم"}</p><p className="text-[10px] text-muted-foreground">{u.phone || "—"}</p></div>
                <span className="text-[10px] text-muted-foreground shrink-0">{rel(u.created_at)}</span>
              </li>
            ))}
          </FeedCard>

          <FeedCard title="أحدث المدفوعات" icon={Wallet} hue="success" empty={recentPayments.length === 0} to="/admin/payments">
            {recentPayments.map((p, i) => (
              <li key={i} className="p-3 flex items-center gap-2 text-sm">
                <CreditCard size={14} className="text-success shrink-0" />
                <div className="flex-1 min-w-0"><p className="font-bold">${Number(p.amount).toLocaleString()} <span className="text-[10px] text-muted-foreground">{p.kind}</span></p><p className="text-[10px] text-muted-foreground">{p.method || "—"} • {arPayStatus(p.status)}</p></div>
                <span className="text-[10px] text-muted-foreground shrink-0">{rel(p.created_at)}</span>
              </li>
            ))}
          </FeedCard>
        </section>

        {/* Search centers */}
        <div className="relative">
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`ابحث في مراكز الإدارة (${CENTERS.length} مركز)...`}
            className="w-full rounded-2xl border border-input bg-card pr-9 pl-3 py-3 text-sm outline-none focus:border-primary" />
        </div>

        {/* Centers grid by group */}
        {Object.entries(grouped).map(([g, items]) => (
          <section key={g}>
            <h3 className="text-xs font-bold text-muted-foreground mb-2 px-1">{GROUPS[g as keyof typeof GROUPS]}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {items.map((c) => <CenterCard key={c.id} c={c} />)}
            </div>
          </section>
        ))}

        {busy && <div className="fixed bottom-24 md:bottom-4 left-4 rounded-full bg-card border shadow-md px-3 py-1.5 text-xs flex items-center gap-2 z-30"><Loader2 size={12} className="animate-spin text-primary" /> تحديث البيانات...</div>}
      </main>

      <div className="md:hidden">
        <DashBottomNav
          items={[
            { to: "/admin", icon: HomeIcon, label: "الرئيسية", active: true },
            { to: "/admin/facilities", icon: Building2, label: "المنشآت" },
            { to: "/admin/bookings", icon: Calendar, label: "الحجوزات" },
            { to: "/admin/settings", icon: Settings, label: "الإعدادات" },
          ]}
          center={{ icon: Sparkles, label: "مساعد ذكي", to: "/admin/smart" }}
        />
      </div>
    </div>
  );
}

function arStatus(s: string) {
  return ({ pending: "قيد المراجعة", confirmed: "مؤكد", completed: "مكتمل", cancelled: "ملغى", no_show: "لم يحضر" } as any)[s] || s;
}
function arPayStatus(s: string) {
  return ({ paid: "مدفوع", pending: "معلّق", refunded: "مسترد", failed: "فاشل" } as any)[s] || s;
}
function rel(d: string) {
  const diff = Date.now() - +new Date(d);
  const m = Math.floor(diff / 60000); if (m < 60) return `${m}د`;
  const h = Math.floor(m / 60); if (h < 24) return `${h}س`;
  return `${Math.floor(h / 24)}ي`;
}

function KPI({ label, value, icon: Icon, hue, sub }: { label: string; value: number | string; icon: any; hue: string; sub?: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border bg-card p-4 shadow-sm hover:shadow-glow transition">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center bg-${hue}/10 text-${hue}`}><Icon size={20} /></div>
        <TrendingUp size={14} className="text-success" />
      </div>
      <p className="text-2xl font-extrabold">{typeof value === "number" ? value.toLocaleString("ar") : value}</p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
      {sub && <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>}
    </motion.div>
  );
}

function Mini({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border bg-card p-3 text-center">
      <p className="text-lg font-extrabold">{value.toLocaleString("ar")}</p>
      <p className="text-[10px] text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}

function TypeBox({ label, v }: { label: string; v: number }) {
  return (
    <div className="rounded-2xl bg-muted/50 p-3 text-center">
      <p className="text-xl font-extrabold">{v}</p>
      <p className="text-[10px] text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}

function AlertCard({ count, label, to, tone }: { count: number; label: string; to: string; tone: string }) {
  return (
    <Link to={to} className={`rounded-2xl border bg-${tone}/5 border-${tone}/30 p-3 flex items-center gap-3 hover:bg-${tone}/10 transition`}>
      <div className={`w-10 h-10 rounded-xl bg-${tone}/15 text-${tone} flex items-center justify-center font-extrabold`}>{count}</div>
      <div className="flex-1 min-w-0 text-sm font-bold">{label}</div>
      <ChevronLeft size={16} className={`text-${tone}`} />
    </Link>
  );
}

function FeedCard({ title, icon: Icon, hue, children, empty, to }: any) {
  return (
    <div className="rounded-3xl border bg-card overflow-hidden">
      <div className="p-4 border-b flex items-center gap-2">
        <Icon size={16} className={`text-${hue}`} />
        <h3 className="font-extrabold flex-1">{title}</h3>
        <Link to={to} className="text-[10px] text-primary font-bold">عرض الكل</Link>
      </div>
      {empty ? <div className="p-6 text-center text-xs text-muted-foreground">لا توجد بيانات بعد</div> : <ul className="divide-y">{children}</ul>}
    </div>
  );
}

function Empty() { return <div className="h-full flex items-center justify-center text-xs text-muted-foreground">لا توجد بيانات</div>; }

function CenterCard({ c }: { c: Center }) {
  return (
    <Link to={c.to} className="group rounded-3xl border bg-card p-4 shadow-sm hover:shadow-glow hover:border-primary/40 transition flex items-start gap-3">
      <div className={`w-12 h-12 rounded-2xl bg-${c.hue}/10 text-${c.hue} flex items-center justify-center shrink-0`}>
        <c.icon size={22} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold rounded-full bg-muted text-muted-foreground px-2 py-0.5">#{c.num}</span>
          <h4 className="font-extrabold truncate">{c.title}</h4>
        </div>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{c.desc}</p>
      </div>
      <ChevronLeft size={16} className="text-muted-foreground group-hover:text-primary mt-2" />
    </Link>
  );
}
