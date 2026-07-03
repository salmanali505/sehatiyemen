import { useEffect, useMemo, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarHeader, SidebarFooter, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { ADMIN_MENU, type MenuItem } from "@/lib/adminMenu";
import { supabase } from "@/integrations/supabase/client";
import {
  Search, Star, StarOff, Sun, Moon, Shield, Sparkles,
} from "lucide-react";

type Counters = Record<string, number>;

const FAV_KEY = "sehati_admin_favs_v1";

function loadFavs(): string[] {
  if (typeof localStorage === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(FAV_KEY) || "[]"); } catch { return []; }
}
function saveFavs(ids: string[]) {
  try { localStorage.setItem(FAV_KEY, JSON.stringify(ids)); } catch {}
}

function flattenAll(items: MenuItem[]): MenuItem[] {
  const out: MenuItem[] = [];
  const walk = (arr: MenuItem[]) => arr.forEach((i) => {
    if (i.children?.length) walk(i.children);
    else out.push(i);
  });
  walk(items);
  return out;
}

export function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [q, setQ] = useState("");
  const [favs, setFavs] = useState<string[]>([]);
  const [dark, setDark] = useState(false);
  const [counters, setCounters] = useState<Counters>({});

  useEffect(() => { setFavs(loadFavs()); }, []);
  useEffect(() => {
    if (typeof document === "undefined") return;
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  useEffect(() => {
    let ignore = false;
    (async () => {
      const [u, p, d, b, n, ver, of, ads, pay, tix] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("providers").select("*", { count: "exact", head: true }),
        supabase.from("bookings").select("doctor_name").not("doctor_name", "is", null).limit(5000),
        supabase.from("bookings").select("*", { count: "exact", head: true }),
        supabase.from("notifications").select("*", { count: "exact", head: true }).eq("read", false),
        supabase.from("providers").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("offers").select("*", { count: "exact", head: true }).eq("active", true),
        supabase.from("ads").select("*", { count: "exact", head: true }).eq("active", true),
        supabase.from("payments").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("support_tickets").select("*", { count: "exact", head: true }).eq("status", "open"),
      ]);
      if (ignore) return;
      setCounters({
        users: u.count ?? 0,
        providers: p.count ?? 0,
        doctors: new Set((d.data ?? []).map((x: any) => x.doctor_name)).size,
        bookings: b.count ?? 0,
        notifs: n.count ?? 0,
        verification: ver.count ?? 0,
        offers: of.count ?? 0,
        ads: ads.count ?? 0,
        payments: pay.count ?? 0,
        tickets: tix.count ?? 0,
      });
    })();
    return () => { ignore = true; };
  }, [pathname]);

  const toggleFav = (id: string) => {
    setFavs((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      saveFavs(next);
      return next;
    });
  };

  const toggleDark = () => {
    const el = document.documentElement;
    el.classList.toggle("dark");
    setDark(el.classList.contains("dark"));
  };

  const allLeaves = useMemo(() => {
    const map: Record<string, MenuItem & { section: string; sectionTitle: string }> = {};
    ADMIN_MENU.forEach((s) =>
      flattenAll(s.items).forEach((i) => { map[i.id] = { ...i, section: s.id, sectionTitle: s.title }; })
    );
    return map;
  }, []);

  const searchResults = useMemo(() => {
    if (!q.trim()) return [];
    const term = q.trim();
    return Object.values(allLeaves)
      .filter((i) => i.title.includes(term) || i.sectionTitle.includes(term))
      .slice(0, 25);
  }, [q, allLeaves]);

  const favItems = favs.map((id) => allLeaves[id]).filter(Boolean);

  const isActive = (to?: string) => !!to && (pathname === to || (to !== "/admin" && pathname.startsWith(to)));
  const resolveTo = (i: MenuItem) => i.to ?? `/admin/soon?id=${encodeURIComponent(i.id)}&t=${encodeURIComponent(i.title)}`;

  const renderLeaf = (i: MenuItem) => {
    const to = resolveTo(i);
    const active = isActive(i.to);
    const badge = i.badgeKey ? counters[i.badgeKey] : undefined;
    const Icon = i.icon;
    const isFav = favs.includes(i.id);
    return (
      <SidebarMenuItem key={i.id}>
        <SidebarMenuButton asChild isActive={active} tooltip={i.title}>
          <Link to={to} className="flex items-center gap-2">
            {Icon ? <Icon className="h-4 w-4 shrink-0" /> : null}
            {!collapsed && <span className="flex-1 truncate">{i.title}</span>}
            {!collapsed && badge != null && badge > 0 && (
              <span className="ml-auto rounded-full bg-primary/15 text-primary text-[10px] font-bold px-1.5 py-0.5 min-w-[20px] text-center">
                {badge > 99 ? "99+" : badge}
              </span>
            )}
            {!collapsed && (
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFav(i.id); }}
                className="opacity-60 hover:opacity-100 shrink-0"
                aria-label="مفضلة"
              >
                {isFav ? <Star className="h-3 w-3 fill-warning text-warning" /> : <StarOff className="h-3 w-3" />}
              </button>
            )}
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  return (
    <Sidebar
      side="right"
      collapsible="icon"
      className="[&>[data-sidebar=sidebar]]:bg-card [&>[data-sidebar=sidebar]]:border-l [&>[data-sidebar=sidebar]]:border-border [&>[data-sidebar=sidebar]]:shadow-card"
    >
      <SidebarHeader className="border-b border-border bg-card">
        <div className="flex items-center gap-2 px-2 py-2.5">
          <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-glow shrink-0">
            <Shield className="h-4 w-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="font-extrabold text-sm truncate text-foreground">صحتي — المشرف</p>
              <p className="text-[10px] text-muted-foreground">Enterprise Control</p>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={toggleDark}
              className="rounded-lg p-1.5 hover:bg-muted transition-colors border border-border"
              aria-label="theme"
            >
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          )}
        </div>
        {!collapsed && (
          <div className="px-2 pb-2">
            <div className="relative">
              <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="بحث في القوائم..."
                className="w-full rounded-xl border border-border bg-muted/40 pr-8 pl-3 py-2 text-xs outline-none focus:border-primary focus:bg-background transition-colors"
              />
            </div>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className="bg-card px-1.5 py-2 gap-1.5">
        {!collapsed && searchResults.length > 0 && (
          <SidebarGroup className="rounded-2xl border border-border bg-background/60 p-1.5">
            <SidebarGroupLabel className="text-primary font-bold">نتائج البحث</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>{searchResults.map(renderLeaf)}</SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {!collapsed && favItems.length > 0 && searchResults.length === 0 && (
          <SidebarGroup className="rounded-2xl border border-warning/30 bg-warning/5 p-1.5">
            <SidebarGroupLabel className="flex items-center gap-1 text-warning font-bold">
              <Sparkles className="h-3 w-3" /> المفضلة
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>{favItems.map(renderLeaf)}</SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {searchResults.length === 0 && ADMIN_MENU.map((section) => (
          <SidebarGroup
            key={section.id}
            className={`rounded-2xl border border-border bg-background/50 ${collapsed ? "p-1" : "p-1.5"} transition-colors hover:border-primary/30`}
          >
            {!collapsed ? (
              <SidebarGroupLabel className="flex items-center gap-2 select-none rounded-xl px-2 py-1.5 text-foreground/80 font-bold">
                <span className="w-6 h-6 rounded-lg gradient-primary flex items-center justify-center shadow-sm">
                  <section.icon className="h-3.5 w-3.5 text-primary-foreground" />
                </span>
                <span className="flex-1 text-xs">{section.title}</span>
              </SidebarGroupLabel>
            ) : (
              <SidebarGroupLabel className="justify-center">
                <section.icon className="h-4 w-4 text-primary" />
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent className={collapsed ? "" : "mt-1 border-t border-border/60 pt-1"}>
              <SidebarMenu>{flattenAll(section.items).map(renderLeaf)}</SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-border bg-card">
        {!collapsed ? (
          <div className="px-3 py-2.5 text-[10px] text-muted-foreground">
            <p className="font-extrabold text-foreground text-xs">Sehati v3.0</p>
            <p>Enterprise Control Panel</p>
          </div>
        ) : (
          <div className="flex items-center justify-center py-2">
            <Shield className="h-4 w-4 text-primary" />
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
