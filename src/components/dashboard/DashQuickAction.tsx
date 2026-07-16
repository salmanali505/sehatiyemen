import { Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";

type Item = { to?: string; onClick?: () => void; icon: LucideIcon; label: string; hue?: "primary" | "accent" | "success" | "warning" };

const HUE: Record<string, string> = {
  primary: "bg-primary/10 text-primary ring-primary/20",
  accent:  "bg-accent/15 text-accent ring-accent/20",
  success: "bg-success/15 text-success ring-success/20",
  warning: "bg-warning/15 text-warning ring-warning/20",
};

export function DashQuickActions({ title = "الإجراءات السريعة", items }: { title?: string; items: Item[] }) {
  return (
    <section className="rounded-3xl border border-border/60 bg-card p-4 shadow-sm">
      <h3 className="text-sm font-black mb-3">{title}</h3>
      <div className="flex items-stretch gap-3 overflow-x-auto no-scrollbar -mx-1 px-1 pb-1">
        {items.map((it, i) => {
          const c = HUE[it.hue ?? "primary"];
          const body = (
            <div className={`w-24 shrink-0 rounded-2xl ${c} ring-1 p-3 flex flex-col items-center justify-center gap-2 hover:scale-[1.03] transition`}>
              <it.icon size={22} />
              <span className="text-[11px] font-black text-center leading-tight">{it.label}</span>
            </div>
          );
          if (it.to) return <Link key={i} to={it.to as any}>{body}</Link>;
          return <button key={i} onClick={it.onClick}>{body}</button>;
        })}
      </div>
    </section>
  );
}
