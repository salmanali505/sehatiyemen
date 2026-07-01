import { useEffect, useMemo, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarHeader, SidebarFooter, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem, useSidebar,
} from "@/components/ui/sidebar";
import { ADMIN_MENU, type MenuItem } from "@/lib/adminMenu";
import { supabase } from "@/integrations/supabase/client";
import {
  ChevronDown, Search, Star, StarOff, Sun, Moon, Shield, Sparkles,
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

function flattenLeaves(items: MenuItem[]): MenuItem[] {
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
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({ dashboard: true });
  const [openSubs, setOpenSubs] = useState<Record<string, boolean>>({});
  const [counters, setCounters] = useState<Counters>({});

  useEffect(() => { setFavs(loadFavs()); }, []);
  useEffect(() => {
    if (typeof document === "undefined") return;
    const isDark = document.documentElement.classList.contains("dark");
    setDark(isDark);
  }, []);

  // real-time counters
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
      flattenLeaves(s.items).forEach((i) => { map[i.id] = { ...i, section: s.id, sectionTitle: s.title }; })
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

  const resolveTo = (i: MenuItem) => i.to ?? `/admin/soon?t=${encodeURIComponent(i.title)}`;

  const renderLeaf = (i: MenuItem, depth = 0) => {
    const to = resolveTo(i);
    const active = isActive(i.to);
    const badge = i.badgeKey ? counters[i.badgeKey] : undefined;
    const Icon = i.icon;
    const isFav = favs.includes(i.id);
    const inner = (
      <>
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
      </>
    );
    if (depth === 0) {
      return (
        <SidebarMenuItem key={i.id}>
          <SidebarMenuButton asChild isActive={active} tooltip={i.title}>
            <Link to={to} className="flex items-center gap-2">{inner}</Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      );
    }
    return (
      <SidebarMenuSubItem key={i.id}>
        <SidebarMenuSubButton asChild isActive={active}>
          <Link to={to} className="flex items-center gap-2">{inner}</Link>
        </SidebarMenuSubButton>
      </SidebarMenuSubItem>
    );
  };

  const renderItem = (i: MenuItem) => {
    if (i.children?.length) {
      const open = openSubs[i.id] ?? i.children.some((c) => isActive(c.to));
      const Icon = i.icon;
      return (
        <SidebarMenuItem key={i.id}>
          <SidebarMenuButton
            onClick={() => setOpenSubs((p) => ({ ...p, [i.id]: !open }))}
            tooltip={i.title}
          >
            {Icon ? <Icon className="h-4 w-4 shrink-0" /> : null}
            {!collapsed && <span className="flex-1 truncate">{i.title}</span>}
            {!collapsed && <ChevronDown className={`h-3 w-3 transition ${open ? "rotate-180" : ""}`} />}
          </SidebarMenuButton>
          {!collapsed && open && (
            <SidebarMenuSub>
              {i.children.map((c) => renderLeaf(c, 1))}
            </SidebarMenuSub>
          )}
        </SidebarMenuItem>
      );
    }
    return renderLeaf(i, 0);
  };

  return (
    <Sidebar side="right" collapsible="icon">
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center shadow-glow shrink-0">
            <Shield className="h-4 w-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="font-extrabold text-sm truncate">صحتي — المشرف</p>
              <p className="text-[10px] text-muted-foreground">Enterprise Control</p>
            </div>
          )}
          {!collapsed && (
            <button onClick={toggleDark} className="rounded-lg p-1.5 hover:bg-muted" aria-label="theme">
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          )}
        </div>
        {!collapsed && (
          <div className="px-2 pb-2">
            <div className="relative">
              <Search className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="بحث في القوائم..."
                className="w-full rounded-lg border bg-background pr-7 pl-2 py-1.5 text-xs outline-none focus:border-primary"
              />
            </div>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        {!collapsed && searchResults.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>نتائج البحث</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>{searchResults.map((i) => renderLeaf(i, 0))}</SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {!collapsed && favItems.length > 0 && searchResults.length === 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-warning" /> المفضلة
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>{favItems.map((i) => renderLeaf(i, 0))}</SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {searchResults.length === 0 && ADMIN_MENU.map((section) => {
          const open = openSections[section.id] ?? section.items.some((it) =>
            it.children?.some((c) => isActive(c.to)) || isActive(it.to)
          );
          const SIcon = section.icon;
          return (
            <SidebarGroup key={section.id}>
              {!collapsed ? (
                <SidebarGroupLabel
                  onClick={() => setOpenSections((p) => ({ ...p, [section.id]: !open }))}
                  className="cursor-pointer flex items-center gap-2 select-none hover:text-foreground"
                >
                  <SIcon className="h-3.5 w-3.5" />
                  <span className="flex-1">{section.title}</span>
                  <ChevronDown className={`h-3 w-3 transition ${open ? "rotate-180" : ""}`} />
                </SidebarGroupLabel>
              ) : (
                <SidebarGroupLabel><SIcon className="h-3.5 w-3.5" /></SidebarGroupLabel>
              )}
              {(open || collapsed) && (
                <SidebarGroupContent>
                  <SidebarMenu>{section.items.map(renderItem)}</SidebarMenu>
                </SidebarGroupContent>
              )}
            </SidebarGroup>
          );
        })}
      </SidebarContent>

      <SidebarFooter className="border-t">
        {!collapsed ? (
          <div className="px-2 py-2 text-[10px] text-muted-foreground">
            <p className="font-bold text-foreground text-xs">Sehati v3.0</p>
            <p>Enterprise Control Panel</p>
          </div>
        ) : null}
      </SidebarFooter>
    </Sidebar>
  );
}
