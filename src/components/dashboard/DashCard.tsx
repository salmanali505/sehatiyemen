import { Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Hue = "primary" | "accent" | "success" | "warning" | "destructive";
type Props = {
  to?: string;
  onClick?: () => void;
  icon: LucideIcon;
  title: string;
  desc?: string;
  count?: number | string;
  badge?: string;
  hue?: Hue;
};

const HUE: Record<Hue, { bg: string; text: string; ring: string }> = {
  primary:     { bg: "bg-primary/10",     text: "text-primary",     ring: "ring-primary/20" },
  accent:      { bg: "bg-accent/15",      text: "text-accent",      ring: "ring-accent/20" },
  success:     { bg: "bg-success/15",     text: "text-success",     ring: "ring-success/20" },
  warning:     { bg: "bg-warning/20",     text: "text-warning",     ring: "ring-warning/25" },
  destructive: { bg: "bg-destructive/10", text: "text-destructive", ring: "ring-destructive/20" },
};

export default function DashCard({
  to, onClick, icon: Icon, title, desc, count, badge, hue = "primary",
}: Props) {
  const c = HUE[hue];
  const inner = (
    <div className="group h-full rounded-[26px] border border-border/60 bg-card p-4 shadow-card hover:shadow-soft hover:border-primary/40 hover:-translate-y-0.5 transition-all duration-200 active:scale-[0.98]">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-12 h-12 rounded-2xl ${c.bg} ${c.text} flex items-center justify-center ring-1 ${c.ring}`}>
          <Icon size={22} strokeWidth={2.2} />
        </div>
        {badge && (
          <span className={`text-[10px] font-black rounded-full px-2 py-1 ${c.bg} ${c.text}`}>
            {badge}
          </span>
        )}
      </div>
      <h3 className="font-black text-sm leading-tight mb-1 line-clamp-1">{title}</h3>
      {desc && (
        <p className="text-[11px] text-muted-foreground line-clamp-2 leading-snug">{desc}</p>
      )}
      <div className="mt-3 pt-3 border-t border-border/60 flex items-center justify-between">
        {count !== undefined ? (
          <span className="text-lg font-black text-foreground tabular-nums">{count}</span>
        ) : (
          <span className="text-[11px] text-muted-foreground">فتح</span>
        )}
        <ChevronLeft
          size={16}
          className="text-muted-foreground group-hover:text-primary group-hover:-translate-x-0.5 transition"
        />
      </div>
    </div>
  );
  if (to) return <Link to={to as any} className="block h-full">{inner}</Link>;
  return <button onClick={onClick} className="block w-full text-right h-full">{inner}</button>;
}
