import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Search, Bell, Sun, Moon, ChevronLeft, LogOut, User as UserIcon,
  Settings, Shield, Command, Sparkles, Home, Zap, Plus, MessageSquare,
} from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ADMIN_MENU, type MenuItem } from "@/lib/adminMenu";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";

function flatten(items: MenuItem[]): MenuItem[] {
  const out: MenuItem[] = [];
  const walk = (arr: MenuItem[]) => arr.forEach((i) => {
    if (i.children?.length) walk(i.children); else out.push(i);
  });
  walk(items);
  return out;
}

const CRUMB_MAP: Record<string, string> = {
  admin: "لوحة التحكم",
  users: "المستخدمون", providers: "المنشآت", doctors: "الأطباء",
  bookings: "الحجوزات", ads: "الإعلانات", offers: "العروض",
  packages: "الباقات", subscriptions: "الاشتراكات", payments: "المدفوعات",
  "payment-methods": "طرق الدفع", notifications: "الإشعارات",
  content: "المحتوى", home: "الرئيسية", ui: "الواجهة", ai: "الذكاء الاصطناعي",
  analytics: "التحليلات", finance: "المالية", audit: "سجل التدقيق",
  facilities: "المنشآت", verification: "التوثيق", specialties: "التخصصات",
  services: "الخدمات", cities: "المدن", qr: "رمز QR", tokens: "الروابط",
  reports: "التقارير", settings: "الإعدادات", support: "الدعم",
  permissions: "الصلاحيات", backup: "النسخ الاحتياطي", smart: "الترتيب الذكي",
  soon: "قريباً",
};

export default function AdminTopBar() {
  const { user, signOut } = useAuth();
  const nav = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const [q, setQ] = useState("");
  const [openSearch, setOpenSearch] = useState(false);
  const [openUser, setOpenUser] = useState(false);
  const [openQuick, setOpenQuick] = useState(false);
  const [dark, setDark] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  const [ticketCount, setTicketCount] = useState(0);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof document !== "undefined") setDark(document.documentElement.classList.contains("dark"));
  }, []);

  useEffect(() => {
    (async () => {
      const [n, t] = await Promise.all([
        supabase.from("notifications").select("*", { count: "exact", head: true }).eq("read", false),
        supabase.from("support_tickets").select("*", { count: "exact", head: true }).eq("status", "open"),
      ]);
      setNotifCount(n.count ?? 0);
      setTicketCount(t.count ?? 0);
    })();
  }, [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault(); setOpenSearch(true); setTimeout(() => searchRef.current?.focus(), 50);
      }
      if (e.key === "Escape") { setOpenSearch(false); setOpenUser(false); setOpenQuick(false); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const allLeaves = useMemo(() => {
    const out: (MenuItem & { section: string })[] = [];
    ADMIN_MENU.forEach((s) => flatten(s.items).forEach((i) => out.push({ ...i, section: s.title })));
    return out;
  }, []);

  const results = useMemo(() => {
    if (!q.trim()) return allLeaves.slice(0, 12);
    const t = q.trim();
    return allLeaves.filter((i) => i.title.includes(t) || i.section.includes(t)).slice(0, 20);
  }, [q, allLeaves]);

  const toggleDark = () => {
    const el = document.documentElement;
    el.classList.toggle("dark");
    setDark(el.classList.contains("dark"));
  };

  const crumbs = useMemo(() => {
    const parts = pathname.split("/").filter(Boolean);
    return parts.map((p, i) => ({
      label: CRUMB_MAP[p] || decodeURIComponent(p),
      to: "/" + parts.slice(0, i + 1).join("/"),
      last: i === parts.length - 1,
    }));
  }, [pathname]);

  const displayName = (user?.user_metadata as any)?.full_name || user?.email?.split("@")[0] || "المشرف";
  const initial = displayName.charAt(0).toUpperCase();

  const quickActions = [
    { to: "/admin/ads", icon: Sparkles, label: "مراجعة الإعلانات", tone: "primary" },
    { to: "/admin/offers", icon: Sparkles, label: "مراجعة العروض", tone: "success" },
    { to: "/admin/verification", icon: Shield, label: "طلبات التوثيق", tone: "warning" },
    { to: "/admin/notifications", icon: Bell, label: "بث إشعار", tone: "accent" },
    { to: "/admin/facilities", icon: Plus, label: "منشأة جديدة", tone: "primary" },
    { to: "/admin/home", icon: Home, label: "بناء الرئيسية", tone: "accent" },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border/60 bg-card/70 backdrop-blur-2xl shadow-sm">
        <div className="h-14 px-3 flex items-center gap-2">
          <SidebarTrigger className="rounded-xl h-9 w-9 hover:bg-muted transition-colors" />

          {/* Breadcrumbs */}
          <nav className="hidden md:flex items-center gap-1 text-xs min-w-0 max-w-[38%]">
            {crumbs.map((c, i) => (
              <div key={c.to} className="flex items-center gap-1 min-w-0">
                {i > 0 && <ChevronLeft className="h-3 w-3 text-muted-foreground shrink-0 rotate-180 rtl:rotate-0" />}
                {c.last ? (
                  <span className="font-extrabold text-foreground truncate">{c.label}</span>
                ) : (
                  <Link to={c.to} className="text-muted-foreground hover:text-primary truncate transition-colors">{c.label}</Link>
                )}
              </div>
            ))}
          </nav>

          <div className="flex-1" />

          {/* Global Search */}
          <button
            onClick={() => { setOpenSearch(true); setTimeout(() => searchRef.current?.focus(), 50); }}
            className="hidden sm:flex items-center gap-2 h-9 rounded-2xl border border-border/70 bg-muted/40 hover:bg-muted px-3 text-xs text-muted-foreground min-w-[220px] transition-colors"
          >
            <Search className="h-3.5 w-3.5" />
            <span className="flex-1 text-right">بحث سريع في اللوحة…</span>
            <kbd className="hidden lg:flex items-center gap-0.5 rounded-md bg-background border border-border px-1.5 py-0.5 font-bold text-[9px]">
              <Command className="h-2.5 w-2.5" />K
            </kbd>
          </button>

          {/* Quick Actions */}
          <div className="relative">
            <button
              onClick={() => { setOpenQuick((v) => !v); setOpenUser(false); }}
              className="h-9 w-9 rounded-xl gradient-primary text-primary-foreground shadow-glow flex items-center justify-center hover:scale-105 transition-transform"
              aria-label="إجراءات سريعة"
            >
              <Zap className="h-4 w-4" />
            </button>
            {openQuick && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setOpenQuick(false)} />
                <div className="absolute end-0 mt-2 w-72 rounded-2xl border border-border bg-card shadow-xl p-2 z-40 animate-in fade-in slide-in-from-top-2">
                  <p className="px-2 py-1.5 text-[10px] font-bold text-muted-foreground">إجراءات سريعة</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {quickActions.map((a) => (
                      <Link key={a.to} to={a.to} onClick={() => setOpenQuick(false)}
                        className="rounded-xl p-2.5 border border-border hover:border-primary/40 hover:bg-primary/5 transition-colors">
                        <a.icon className="h-4 w-4 text-primary mb-1" />
                        <p className="text-[11px] font-bold leading-tight">{a.label}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Support Tickets */}
          <Link to="/admin/support" className="relative h-9 w-9 rounded-xl border border-border hover:bg-muted flex items-center justify-center transition-colors" aria-label="الدعم">
            <MessageSquare className="h-4 w-4" />
            {ticketCount > 0 && (
              <span className="absolute -top-1 -end-1 h-4 min-w-[16px] px-1 rounded-full bg-warning text-[9px] font-bold text-warning-foreground flex items-center justify-center shadow">
                {ticketCount > 9 ? "9+" : ticketCount}
              </span>
            )}
          </Link>

          {/* Notifications */}
          <Link to="/admin/notifications" className="relative h-9 w-9 rounded-xl border border-border hover:bg-muted flex items-center justify-center transition-colors" aria-label="الإشعارات">
            <Bell className="h-4 w-4" />
            {notifCount > 0 && (
              <span className="absolute -top-1 -end-1 h-4 min-w-[16px] px-1 rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground flex items-center justify-center shadow animate-pulse">
                {notifCount > 99 ? "99+" : notifCount}
              </span>
            )}
          </Link>

          {/* Theme */}
          <button onClick={toggleDark} className="h-9 w-9 rounded-xl border border-border hover:bg-muted flex items-center justify-center transition-colors" aria-label="الوضع">
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => { setOpenUser((v) => !v); setOpenQuick(false); }}
              className="h-9 rounded-xl border border-border hover:bg-muted flex items-center gap-2 pe-2 ps-1 transition-colors"
            >
              <span className="h-7 w-7 rounded-lg gradient-primary text-primary-foreground text-xs font-black flex items-center justify-center shadow-glow">
                {initial}
              </span>
              <span className="hidden md:block text-xs font-bold max-w-[100px] truncate">{displayName}</span>
            </button>
            {openUser && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setOpenUser(false)} />
                <div className="absolute end-0 mt-2 w-64 rounded-2xl border border-border bg-card shadow-xl overflow-hidden z-40 animate-in fade-in slide-in-from-top-2">
                  <div className="p-3 border-b border-border bg-gradient-to-l from-primary/10 to-transparent">
                    <div className="flex items-center gap-2">
                      <span className="h-10 w-10 rounded-xl gradient-primary text-primary-foreground font-black flex items-center justify-center shadow-glow">{initial}</span>
                      <div className="min-w-0">
                        <p className="text-sm font-extrabold truncate">{displayName}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
                        <span className="inline-flex items-center gap-1 mt-1 text-[9px] font-bold text-primary bg-primary/10 rounded-full px-2 py-0.5">
                          <Shield className="h-2.5 w-2.5" /> مشرف عام
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="p-1">
                    <Link to="/profile" onClick={() => setOpenUser(false)} className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-xs hover:bg-muted transition-colors">
                      <UserIcon className="h-3.5 w-3.5" /> الملف الشخصي
                    </Link>
                    <Link to="/admin/settings" onClick={() => setOpenUser(false)} className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-xs hover:bg-muted transition-colors">
                      <Settings className="h-3.5 w-3.5" /> إعدادات النظام
                    </Link>
                    <Link to="/" onClick={() => setOpenUser(false)} className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-xs hover:bg-muted transition-colors">
                      <Home className="h-3.5 w-3.5" /> العودة للتطبيق
                    </Link>
                    <button onClick={async () => { await signOut(); nav({ to: "/auth" }); }}
                      className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-xs hover:bg-destructive/10 text-destructive transition-colors">
                      <LogOut className="h-3.5 w-3.5" /> تسجيل الخروج
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Global Command Palette */}
      {openSearch && (
        <div className="fixed inset-0 z-50 bg-background/60 backdrop-blur-md p-4 pt-24 animate-in fade-in" onClick={() => setOpenSearch(false)}>
          <div className="mx-auto max-w-xl rounded-3xl border border-border bg-card shadow-2xl overflow-hidden animate-in slide-in-from-top-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 border-b border-border px-4 py-3">
              <Search className="h-4 w-4 text-primary" />
              <input
                ref={searchRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="ابحث في جميع أقسام لوحة التحكم…"
                className="flex-1 bg-transparent outline-none text-sm"
              />
              <kbd className="text-[10px] font-bold bg-muted rounded px-1.5 py-0.5">ESC</kbd>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-2">
              {results.length === 0 ? (
                <p className="p-8 text-center text-xs text-muted-foreground">لا توجد نتائج</p>
              ) : (
                results.map((r) => {
                  const to = r.to ?? `/admin/soon?id=${encodeURIComponent(r.id)}&t=${encodeURIComponent(r.title)}`;
                  const Icon = r.icon;
                  return (
                    <button key={r.id} onClick={() => { nav({ to }); setOpenSearch(false); setQ(""); }}
                      className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-muted transition-colors text-right">
                      {Icon && <Icon className="h-4 w-4 text-primary shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate">{r.title}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{r.section}</p>
                      </div>
                      <ChevronLeft className="h-3 w-3 text-muted-foreground" />
                    </button>
                  );
                })
              )}
            </div>
            <div className="border-t border-border px-4 py-2 bg-muted/30 text-[10px] text-muted-foreground flex items-center justify-between">
              <span>{results.length} نتيجة</span>
              <span>⌘K للفتح • ESC للإغلاق</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
