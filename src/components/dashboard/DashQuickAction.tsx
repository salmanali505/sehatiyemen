import { Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";

type Hue = "primary" | "accent" | "success" | "warning" | "destructive";
type Item = {
  to?: string;
  onClick?: () => void;
  icon: LucideIcon;
  label: string;
  hue?: Hue;
};

const HUE: Record<Hue, { bg: string; icon: string; ring: string; text: string }> = {
  primary:     { bg: "bg-primary/8",     icon: "text-primary",     ring: "ring-primary/15",     text: "text-primary" },
  accent:      { bg: "bg-accent/12",     icon: "text-accent",      ring: "ring-accent/20",      text: "text-accent" },
  success:     { bg: "bg-success/12",    icon: "text-success",     ring: "ring-success/20",     text: "text-success" },
  warning:     { bg: "bg-warning/15",    icon: "text-warning",     ring: "ring-warning/25",     text: "text-warning" },
  destructive: { bg: "bg-destructive/8", icon: "text-destructive", ring: "ring-destructive/15", text: "text-destructive" },
};

export function DashQuickActions({
  title = "الإجراءات السريعة",
  items,
}: {
  title?: string;
  items: Item[];
}) {
  return (
    <section className="rounded-[28px] border border-border/60 bg-card p-4 shadow-card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-black">{title}</h3>
      </div>
      <div className="flex items-stretch gap-3 overflow-x-auto no-scrollbar -mx-1 px-1 pb-1">
        {items.map((it, i) => {
          const c = HUE[it.hue ?? "primary"];
          const body = (
            <div
              className={`w-[104px] shrink-0 rounded-[22px] ${c.bg} ring-1 ${c.ring} p-3.5 flex flex-col items-center justify-center gap-2.5
                hover:-translate-y-0.5 active:scale-[0.97] transition-all duration-200`}
            >
              <div className={`w-11 h-11 rounded-2xl bg-white/80 flex items-center justify-center ${c.icon} shadow-sm`}>
                <it.icon size={22} strokeWidth={2.2} />
              </div>
              <span className={`text-[11px] font-black text-center leading-tight ${c.text}`}>
                {it.label}
              </span>
            </div>
          );
          if (it.to) return <Link key={i} to={it.to as any}>{body}</Link>;
          return <button key={i} onClick={it.onClick}>{body}</button>;
        })}
      </div>
    </section>
  );
}
