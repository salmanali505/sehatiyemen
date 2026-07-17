import { Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";

export type NavItem = {
  to?: string;
  onClick?: () => void;
  icon: LucideIcon;
  label: string;
  active?: boolean;
};

type Props = {
  items: [NavItem, NavItem, NavItem, NavItem];
  center: { icon: LucideIcon; label?: string; to?: string; onClick?: () => void };
};

/**
 * Floating bottom navigation bar with a raised centered action.
 * Used across Provider, Reception and Admin (mobile) dashboards.
 */
export default function DashBottomNav({ items, center }: Props) {
  const CenterIcon = center.icon;

  const centerInner = (
    <div className="relative -mt-8 w-16 h-16 rounded-full gradient-primary text-primary-foreground shadow-glow ring-4 ring-background flex items-center justify-center active:scale-95 transition">
      <CenterIcon size={26} strokeWidth={2.4} />
    </div>
  );

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 pointer-events-none"
      aria-label="التنقل الرئيسي"
    >
      <div className="mx-auto max-w-md px-3 pb-3 pointer-events-auto">
        <div
          className="relative grid grid-cols-5 items-end rounded-[26px] bg-card/95 backdrop-blur-xl border border-border/60 shadow-float px-2 pt-2 pb-2"
        >
          <NavCell item={items[0]} />
          <NavCell item={items[1]} />

          <div className="flex justify-center">
            {center.to ? (
              <Link to={center.to as any} aria-label={center.label ?? "إجراء"}>
                {centerInner}
              </Link>
            ) : (
              <button onClick={center.onClick} aria-label={center.label ?? "إجراء"}>
                {centerInner}
              </button>
            )}
          </div>

          <NavCell item={items[2]} />
          <NavCell item={items[3]} />
        </div>
      </div>
    </nav>
  );
}

function NavCell({ item }: { item: NavItem }) {
  const Icon = item.icon;
  const cls = `flex flex-col items-center gap-1 py-1.5 rounded-2xl transition ${
    item.active ? "text-primary" : "text-muted-foreground hover:text-foreground"
  }`;
  const body = (
    <>
      <Icon size={22} strokeWidth={item.active ? 2.4 : 2} />
      <span className="text-[10px] font-bold leading-none">{item.label}</span>
    </>
  );
  if (item.to) return <Link to={item.to as any} className={cls}>{body}</Link>;
  return <button onClick={item.onClick} className={cls}>{body}</button>;
}
