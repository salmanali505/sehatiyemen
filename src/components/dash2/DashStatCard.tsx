import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown } from "lucide-react";

type Tone = "primary" | "success" | "warning" | "destructive" | "accent" | "muted";

type Props = {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  tone?: Tone;
  hint?: string;
  delta?: number;
};

const toneMap: Record<Tone, { bg: string; fg: string; ring: string }> = {
  primary:     { bg: "bg-primary/10",     fg: "text-primary",     ring: "ring-primary/20" },
  success:     { bg: "bg-success/10",     fg: "text-success",     ring: "ring-success/20" },
  warning:     { bg: "bg-warning/10",     fg: "text-warning",     ring: "ring-warning/20" },
  destructive: { bg: "bg-destructive/10", fg: "text-destructive", ring: "ring-destructive/20" },
  accent:      { bg: "bg-accent/10",      fg: "text-accent",      ring: "ring-accent/20" },
  muted:       { bg: "bg-muted",          fg: "text-muted-foreground", ring: "ring-border" },
};

export default function DashStatCard({ label, value, icon: Icon, tone = "primary", hint, delta }: Props) {
  const t = toneMap[tone];
  const positive = (delta ?? 0) >= 0;
  return (
    <div className="rounded-3xl bg-card border border-border/60 shadow-card p-4 relative overflow-hidden">
      <div className="flex items-start justify-between mb-3">
        <span className="text-[11px] font-bold text-muted-foreground">{label}</span>
        {Icon && (
          <div className={`w-9 h-9 rounded-2xl ${t.bg} ${t.fg} ring-1 ${t.ring} flex items-center justify-center`}>
            <Icon size={16} />
          </div>
        )}
      </div>
      <div className="text-2xl md:text-3xl font-black leading-none">{value}</div>
      {(hint || typeof delta === "number") && (
        <div className="mt-2 flex items-center gap-2 text-[10px]">
          {typeof delta === "number" && (
            <span className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-bold ${positive ? "bg-success/12 text-success" : "bg-destructive/12 text-destructive"}`}>
              {positive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
              {Math.abs(delta).toFixed(1)}%
            </span>
          )}
          {hint && <span className="text-muted-foreground truncate">{hint}</span>}
        </div>
      )}
    </div>
  );
}
