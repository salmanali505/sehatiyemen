import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight, Users, Building2, Calendar, Star, Shield, Sparkles, TrendingUp,
  CheckCircle2, XCircle, Plus, Search, Loader2,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useRoles } from "@/lib/useRoles";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  component: AdminDashboard,
  head: () => ({ meta: [{ title: "لوحة المشرف العام | صحتي" }] }),
});

type Provider = {
  id: string;
  name: string;
  type: "hospital" | "clinic" | "lab" | "radiology" | "pharmacy";
  city: string | null;
  status: "active" | "pending" | "suspended";
  verified: boolean;
  featured: boolean;
  rating: number | null;
  reviews_count: number | null;
  created_at: string;
};

const TYPE_LABEL: Record<Provider["type"], string> = {
  hospital: "مستشفى",
  clinic: "عيادة",
  lab: "مختبر",
  radiology: "أشعة",
  pharmacy: "صيدلية",
};

function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: rolesLoading } = useRoles();
  const nav = useNavigate();

  const [stats, setStats] = useState({ users: 0, providers: 0, bookings: 0, reviews: 0 });
  const [providers, setProviders] = useState<Provider[]>([]);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) nav({ to: "/auth" });
  }, [authLoading, user, nav]);

  useEffect(() => {
    if (!isAdmin) return;
    void loadAll();
  }, [isAdmin]);

  async function loadAll() {
    setBusy(true);
    const [profilesQ, providersQ, bookingsQ, reviewsQ, listQ] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("providers").select("*", { count: "exact", head: true }),
      supabase.from("bookings").select("*", { count: "exact", head: true }),
      supabase.from("reviews").select("*", { count: "exact", head: true }),
      supabase.from("providers").select("*").order("created_at", { ascending: false }).limit(100),
    ]);
    setStats({
      users: profilesQ.count ?? 0,
      providers: providersQ.count ?? 0,
      bookings: bookingsQ.count ?? 0,
      reviews: reviewsQ.count ?? 0,
    });
    setProviders((listQ.data ?? []) as Provider[]);
    setBusy(false);
  }

  async function toggleField(id: string, field: "verified" | "featured", value: boolean) {
    const patch = field === "verified" ? { verified: value } : { featured: value };
    const { error } = await supabase.from("providers").update(patch).eq("id", id);
    if (error) return toast.error(error.message);
    setProviders((p) => p.map((x) => (x.id === id ? { ...x, [field]: value } : x)));
    toast.success("تم التحديث");
  }

  async function setStatus(id: string, status: Provider["status"]) {
    const { error } = await supabase.from("providers").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    setProviders((p) => p.map((x) => (x.id === id ? { ...x, status } : x)));
    toast.success("تم تحديث الحالة");
  }

  if (authLoading || rolesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 text-center" dir="rtl">
        <div>
          <Shield className="mx-auto text-muted-foreground mb-3" size={40} />
          <h1 className="font-extrabold text-xl">صلاحية غير متوفرة</h1>
          <p className="text-sm text-muted-foreground mt-1">هذه اللوحة مخصصة للمشرف العام فقط.</p>
          <Link to="/" className="inline-block mt-4 rounded-2xl gradient-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-glow">
            العودة للرئيسية
          </Link>
        </div>
      </div>
    );
  }

  const filtered = providers.filter(
    (p) => !query || p.name.includes(query) || (p.city ?? "").includes(query),
  );

  return (
    <div className="min-h-screen bg-background pb-12" dir="rtl">
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-background/85 border-b">
        <div className="mx-auto max-w-5xl px-4 py-4 flex items-center gap-3">
          <Link to="/" className="rounded-xl p-2 hover:bg-muted"><ArrowRight size={20} /></Link>
          <div className="flex-1">
            <h1 className="font-extrabold text-lg">لوحة المشرف العام</h1>
            <p className="text-xs text-muted-foreground">إدارة المنصة بأكملها</p>
          </div>
          <div className="w-10 h-10 rounded-2xl gradient-primary flex items-center justify-center shadow-glow">
            <Shield className="text-primary-foreground" size={18} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 space-y-6">
        {/* Quick Nav */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <Link to="/admin/tokens" className="rounded-2xl border bg-card hover:bg-muted p-3 flex items-center gap-2 text-sm font-bold"><Shield size={16} className="text-destructive" /> روابط الوصول</Link>
          <Link to="/admin/cities" className="rounded-2xl border bg-card hover:bg-muted p-3 flex items-center gap-2 text-sm font-bold"><Building2 size={16} className="text-primary" /> المدن</Link>
          <Link to="/admin/home" className="rounded-2xl border bg-card hover:bg-muted p-3 flex items-center gap-2 text-sm font-bold"><Sparkles size={16} className="text-warning" /> الشاشة الرئيسية</Link>
          <Link to="/dashboard/reception" className="rounded-2xl border bg-card hover:bg-muted p-3 flex items-center gap-2 text-sm font-bold"><Users size={16} className="text-success" /> الاستقبال</Link>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard icon={Users} label="المستخدمون" value={stats.users} hue="primary" />
          <StatCard icon={Building2} label="مزوّدو الخدمة" value={stats.providers} hue="accent" />
          <StatCard icon={Calendar} label="الحجوزات" value={stats.bookings} hue="success" />
          <StatCard icon={Star} label="التقييمات" value={stats.reviews} hue="warning" />
        </section>



        {/* Providers */}
        <section className="rounded-3xl border bg-card shadow-sm overflow-hidden">
          <div className="p-4 flex flex-wrap items-center gap-3 border-b">
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <TrendingUp size={18} className="text-primary" />
              <h2 className="font-extrabold">إدارة المزوّدين</h2>
              <span className="text-xs text-muted-foreground">({filtered.length})</span>
            </div>
            <div className="relative flex-1 max-w-xs">
              <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="بحث بالاسم أو المدينة..."
                className="w-full rounded-2xl border border-input bg-background pr-9 pl-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>
            <button
              onClick={() => loadAll()}
              className="rounded-2xl gradient-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-glow"
            >
              تحديث
            </button>
          </div>

          {busy ? (
            <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-sm text-muted-foreground">
              <Building2 className="mx-auto mb-2 opacity-50" size={32} />
              لا يوجد مزوّدون بعد. أضف بعض البيانات من قاعدة البيانات لتظهر هنا.
            </div>
          ) : (
            <div className="divide-y">
              {filtered.map((p) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-4 flex flex-wrap items-center gap-3"
                >
                  <Link to="/admin/providers/$id" params={{ id: p.id }} className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/15 to-accent/15 flex items-center justify-center font-extrabold text-primary hover:opacity-80">
                    {p.name.charAt(0)}
                  </Link>
                  <div className="flex-1 min-w-[160px]">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold">{p.name}</h3>
                      {p.verified && <CheckCircle2 size={14} className="text-primary fill-primary/15" />}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {TYPE_LABEL[p.type]} • {p.city ?? "—"} • ⭐ {Number(p.rating ?? 0).toFixed(1)} ({p.reviews_count ?? 0})
                    </p>
                  </div>
                  <StatusPill status={p.status} />
                  <div className="flex items-center gap-2">
                    <ToggleBtn active={p.verified} onClick={() => toggleField(p.id, "verified", !p.verified)} icon={CheckCircle2} label="موثّق" />
                    <ToggleBtn active={p.featured} onClick={() => toggleField(p.id, "featured", !p.featured)} icon={Sparkles} label="مميّز" />
                    <select
                      value={p.status}
                      onChange={(e) => setStatus(p.id, e.target.value as Provider["status"])}
                      className="rounded-xl border border-input bg-background px-2 py-1.5 text-xs"
                    >
                      <option value="active">نشط</option>
                      <option value="pending">قيد المراجعة</option>
                      <option value="suspended">موقوف</option>
                    </select>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        <Link to="/admin/providers/$id" params={{ id: "new" }} className="rounded-3xl border bg-card hover:bg-muted p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl gradient-primary flex items-center justify-center shadow-glow">
            <Plus className="text-primary-foreground" size={18} />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-sm">إضافة مزوّد جديد</h3>
            <p className="text-xs text-muted-foreground">سجّل مستشفى، عيادة، مختبر، أشعة أو صيدلية.</p>
          </div>
          <ArrowRight size={16} className="rotate-180 text-muted-foreground" />
        </Link>
      </main>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, hue }: { icon: any; label: string; value: number; hue: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border bg-card p-4 shadow-sm"
    >
      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-3 bg-${hue}/10 text-${hue}`}>
        <Icon size={20} />
      </div>
      <p className="text-2xl font-extrabold">{value.toLocaleString("ar")}</p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </motion.div>
  );
}

function StatusPill({ status }: { status: Provider["status"] }) {
  const map = {
    active: { c: "bg-success/10 text-success", t: "نشط" },
    pending: { c: "bg-warning/10 text-warning", t: "مراجعة" },
    suspended: { c: "bg-destructive/10 text-destructive", t: "موقوف" },
  } as const;
  const s = map[status];
  return <span className={`text-[10px] font-bold rounded-full px-2.5 py-1 ${s.c}`}>{s.t}</span>;
}

function ToggleBtn({ active, onClick, icon: Icon, label }: { active: boolean; onClick: () => void; icon: any; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-[11px] font-bold transition ${
        active ? "gradient-primary text-primary-foreground shadow-glow" : "bg-muted text-muted-foreground hover:bg-muted/70"
      }`}
    >
      {active ? <Icon size={12} /> : <XCircle size={12} />}
      {label}
    </button>
  );
}
