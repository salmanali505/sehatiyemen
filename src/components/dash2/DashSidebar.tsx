import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { SehatiLogo } from "@/components/SehatiLogo";
import type { DashNavItem } from "@/lib/dash/permissions";

type Props = {
  items: DashNavItem[];
  title: string;
  collapsed?: boolean;
  onToggle?: () => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
};

export default function DashSidebar({ items, title, collapsed, onToggle, mobileOpen, onCloseMobile }: Props) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // Group items by their group tag preserving order.
  const groups: { key: string; items: DashNavItem[] }[] = [];
  for (const it of items) {
    const key = it.group ?? "";
    const g = groups.find((g) => g.key === key);
    if (g) g.items.push(it);
    else groups.push({ key, items: [it] });
  }

  const content = (
    <div className={`flex flex-col h-full bg-card border-l border-border/60 ${collapsed ? "w-[76px]" : "w-[260px]"} transition-[width] duration-300`}>
      <div className="p-3 border-b border-border/60 flex items-center gap-2">
        <SehatiLogo size={28} />
        {!collapsed && <div className="flex-1 min-w-0">
          <p className="text-[11px] text-muted-foreground leading-none">صحتي</p>
          <p className="text-sm font-black truncate">{title}</p>
        </div>}
        {onToggle && (
          <button onClick={onToggle} className="hidden md:flex w-8 h-8 rounded-xl items-center justify-center text-muted-foreground hover:bg-muted" aria-label="طي القائمة">
            {collapsed ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
        )}
        {onCloseMobile && (
          <button onClick={onCloseMobile} className="md:hidden w-8 h-8 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-muted" aria-label="إغلاق">
            <X size={16} />
          </button>
        )}
      </div>
      <nav className="flex-1 overflow-y-auto p-2 space-y-4">
        {groups.map((g, gi) => (
          <div key={gi}>
            {!collapsed && g.key && (
              <p className="text-[10px] font-bold text-muted-foreground/70 px-3 py-1 uppercase tracking-wider">{g.key}</p>
            )}
            <ul className="space-y-0.5">
              {g.items.map((it, i) => {
                const active = pathname === it.to;
                const Icon = it.icon;
                return (
                  <li key={i}>
                    <Link
                      to={it.to as any}
                      onClick={onCloseMobile}
                      className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-bold transition ${
                        active ? "gradient-primary text-primary-foreground shadow-glow" : "text-foreground/80 hover:bg-muted"
                      } ${collapsed ? "justify-center" : ""}`}
                      title={collapsed ? it.label : undefined}
                    >
                      <Icon size={18} className="shrink-0" />
                      {!collapsed && <span className="truncate">{it.label}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex sticky top-0 h-screen shrink-0">{content}</aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <button className="flex-1 bg-black/40 backdrop-blur-sm" onClick={onCloseMobile} aria-label="إغلاق" />
          <div className="w-[280px] shadow-float h-full">{content}</div>
        </div>
      )}
    </>
  );
}
