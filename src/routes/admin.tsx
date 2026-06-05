import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Shield, ArrowRight, Loader2, Users, Building2, Calendar, Star, TrendingUp,
  ChevronLeft, Sparkles, Search,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useRoles } from "@/lib/useRoles";
import { supabase } from "@/integrations/supabase/client";
import { CENTERS, GROUPS, type Center } from "@/lib/adminCenters";

export const Route = createFileRoute("/admin")({
  component: AdminHub,
  head: () => ({ meta: [{ title: "لوحة التحكم العليا | صحتي" }] }),
});

function AdminHub() {
  const { user, loading: aL } = useAuth();
  const { isAdmin, loading: rL } = useRoles();
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const [stats, setStats] = useState({
    users: 0, providers: 0, doctors: 0, bookings: 0, bookingsToday: 0,
    bookingsMonth: 0, revenue: 0, subscriptions: 0, reviews: 0,
    clinics: 0, hospitals: 0, labs: 0, radiology: 0, pharmacies: 0,
  });
  const [recent, setRecent] = useState<{ name: string; when: string; kind: string }[]>([]);

  useEffect(() => { if (!aL && !user) nav({ to: "/auth" }); }, [aL, user, nav]);
  useEffect(() => { if (isAdmin) void load(); }, [isAdmin]);

  async function load() {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
    const [u, p, b, r, bt, bm, subs, recB, recP, byType] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("providers").select("*", { count: "exact", head: true }),
      supabase.from("bookings").select("*", { count: "exact", head: true }),
      supabase.from("reviews").select("*", { count: "exact", head: true }),
      supabase.from("bookings").select("*", { count: "exact", head: true }).gte("created_at", today.toISOString()),
      supabase.from("bookings").select("*", { count: "exact", head: true }).gte("created_at", monthStart.toISOString()),
      supabase.from("subscriptions").select("amount", { count: "exact" }).eq("status", "active"),
      supabase.from("bookings").select("patient_name, provider_name, created_at").order("created_at", { ascending: false }).limit(5),
      supabase.from("providers").select("name, created_at").order("created_at", { ascending: false }).limit(5),
      supabase.from("providers").select("type"),
    ]);
    const revenue = (subs.data ?? []).reduce((s, x: any) => s + Number(x.amount || 0), 0);
    const types = (byType.data ?? []).reduce((m: any, x: any) => { m[x.type] = (m[x.type] || 0) + 1; return m; }, {});
    setStats({
      users: u.count ?? 0, providers: p.count ?? 0, doctors: 0, bookings: b.count ?? 0,
      bookingsToday: bt.count ?? 0, bookingsMonth: bm.count ?? 0,
      revenue, subscriptions: subs.count ?? 0, reviews: r.count ?? 0,
      clinics: types.clinic || 0, hospitals: types.hospital || 0, labs: types.lab || 0,
      radiology: types.radiology || 0, pharmacies: types.pharmacy || 0,
    });
    const ra = [
      ...(recB.data ?? []).map((x: any) => ({ name: `حجز جديد: ${x.patient_name} → ${x.provider_name}`, when: x.created_at, kind: "booking" })),
      ...(recP.data ?? []).map((x: any) => ({ name: `منشأة جديدة: ${x.name}`, when: x.created_at, kind: "provider" })),
    ].sort((a, b) => +new Date(b.when) - +new Date(a.when)).slice(0, 8);
    setRecent(ra);
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

  return (
    <div className="min-h-screen bg-background pb-16" dir="rtl">
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-background/85 border-b">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center gap-3">
          <Link to="/" className="rounded-xl p-2 hover:bg-muted"><ArrowRight size={20} /></Link>
          <div className="flex-1 min-w-0">
            <h1 className="font-extrabold text-lg">لوحة التحكم العليا</h1>
            <p className="text-xs text-muted-foreground">مركز إدارة وتشغيل منظومة صحتي بالكامل</p>
          </div>
          <div className="w-10 h-10 rounded-2xl gradient-primary flex items-center justify-center shadow-glow">
            <Shield className="text-primary-foreground" size={18} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 space-y-6">
        {/* Top metrics */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Stat label="المستخدمون" value={stats.users} icon={Users} hue="primary" />
          <Stat label="المنشآت" value={stats.providers} icon={Building2} hue="accent" />
          <Stat label="الحجوزات" value={stats.bookings} icon={Calendar} hue="success" />
          <Stat label="إيراد الاشتراكات" value={`$${stats.revenue}`} icon={TrendingUp} hue="warning" />
        </section>

        <section className="grid grid-cols-2 md:grid-cols-5 gap-2">
          <Mini label="عيادات" value={stats.clinics} />
          <Mini label="مستشفيات" value={stats.hospitals} />
          <Mini label="مختبرات" value={stats.labs} />
          <Mini label="أشعة" value={stats.radiology} />
          <Mini label="صيدليات" value={stats.pharmacies} />
        </section>

        <section className="grid grid-cols-3 gap-2">
          <Mini label="حجوزات اليوم" value={stats.bookingsToday} />
          <Mini label="حجوزات الشهر" value={stats.bookingsMonth} />
          <Mini label="اشتراكات نشطة" value={stats.subscriptions} />
        </section>

        {/* Recent activity */}
        <section className="rounded-3xl border bg-card overflow-hidden">
          <div className="p-4 border-b flex items-center gap-2">
            <Sparkles size={16} className="text-warning" />
            <h2 className="font-extrabold">أحدث الأنشطة</h2>
          </div>
          {recent.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">لا توجد أنشطة بعد</div>
          ) : (
            <ul className="divide-y">
              {recent.map((r, i) => (
                <li key={i} className="p-3 flex items-center gap-3 text-sm">
                  <span className={`w-2 h-2 rounded-full ${r.kind === "booking" ? "bg-success" : "bg-primary"}`} />
                  <span className="flex-1">{r.name}</span>
                  <span className="text-[10px] text-muted-foreground">{new Date(r.when).toLocaleString("ar")}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Search centers */}
        <div className="relative">
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث في مراكز الإدارة (32 مركز)..."
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
      </main>
    </div>
  );
}

function Stat({ label, value, icon: Icon, hue }: { label: string; value: number | string; icon: any; hue: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border bg-card p-4 shadow-sm">
      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-3 bg-${hue}/10 text-${hue}`}>
        <Icon size={20} />
      </div>
      <p className="text-2xl font-extrabold">{typeof value === "number" ? value.toLocaleString("ar") : value}</p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </motion.div>
  );
}

function Mini({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border bg-card p-3 text-center">
      <p className="text-lg font-extrabold">{value.toLocaleString("ar")}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}

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
