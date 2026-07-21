import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Bell, Menu, Moon, Search, Sun, LogOut, User } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import type { DashNavItem } from "@/lib/dash/permissions";

type Props = {
  onOpenMenu: () => void;
  menuItems: DashNavItem[];
};

export default function DashTopBar({ onOpenMenu, menuItems }: Props) {
  const [dark, setDark] = useState(false);
  const [notif, setNotif] = useState(0);
  const [q, setQ] = useState("");
  const [openResults, setOpenResults] = useState(false);
  const { user, signOut } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("dash-theme") : null;
    const isDark = saved === "dark";
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  useEffect(() => {
    if (!user) return;
    supabase.from("notifications").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("read", false)
      .then(({ count }) => setNotif(count ?? 0));
  }, [user]);

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("dash-theme", next ? "dark" : "light");
  };

  const current = menuItems.find((m) => m.to === pathname);

  const results = q.length > 1
    ? menuItems.filter((m) => m.label.toLowerCase().includes(q.toLowerCase())).slice(0, 8)
    : [];

  return (
    <header className="sticky top-0 z-30 bg-background/85 backdrop-blur-xl border-b border-border/60">
      <div className="flex items-center gap-2 h-14 px-3 md:px-5">
        <button onClick={onOpenMenu} className="md:hidden w-10 h-10 rounded-2xl flex items-center justify-center hover:bg-muted" aria-label="القائمة">
          <Menu size={20} />
        </button>

        {/* Breadcrumb */}
        <div className="hidden md:flex items-center gap-1 text-xs text-muted-foreground">
          <span>لوحة التحكم</span>
          {current && <><span className="opacity-50">/</span><span className="text-foreground font-bold">{current.label}</span></>}
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-md mx-auto">
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => { setQ(e.target.value); setOpenResults(true); }}
            onFocus={() => setOpenResults(true)}
            onBlur={() => setTimeout(() => setOpenResults(false), 150)}
            placeholder="ابحث في اللوحة..."
            className="w-full rounded-2xl bg-muted/50 border border-transparent focus:border-primary/40 focus:bg-card pr-9 pl-3 py-2 text-sm focus:outline-none"
          />
          {openResults && results.length > 0 && (
            <div className="absolute top-full mt-1 inset-x-0 rounded-2xl bg-card border border-border shadow-float overflow-hidden">
              {results.map((r, i) => {
                const Icon = r.icon;
                return (
                  <Link key={i} to={r.to as any} className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted" onClick={() => { setQ(""); setOpenResults(false); }}>
                    <Icon size={14} className="text-muted-foreground" />
                    <span className="flex-1">{r.label}</span>
                    {r.group && <span className="text-[10px] text-muted-foreground">{r.group}</span>}
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <button onClick={toggleDark} className="w-10 h-10 rounded-2xl flex items-center justify-center hover:bg-muted" aria-label="تبديل الوضع">
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <Link to="/notifications" className="relative w-10 h-10 rounded-2xl flex items-center justify-center hover:bg-muted" aria-label="الإشعارات">
          <Bell size={18} />
          {notif > 0 && (
            <span className="absolute top-1.5 right-1.5 min-w-[16px] h-[16px] px-1 rounded-full bg-destructive text-destructive-foreground text-[9px] font-black flex items-center justify-center">
              {notif > 99 ? "99+" : notif}
            </span>
          )}
        </Link>

        <div className="relative group">
          <button className="w-10 h-10 rounded-2xl gradient-primary text-primary-foreground font-black flex items-center justify-center shadow-glow" aria-label="حسابي">
            {(user?.email ?? "?").charAt(0).toUpperCase()}
          </button>
          <div className="absolute left-0 top-full mt-1 w-48 rounded-2xl bg-card border border-border shadow-float p-1 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition">
            <Link to="/profile" className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-muted text-sm"><User size={14} /> ملفي</Link>
            <button onClick={() => signOut()} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-destructive/10 text-destructive text-sm text-right"><LogOut size={14} /> تسجيل الخروج</button>
          </div>
        </div>
      </div>
    </header>
  );
}
