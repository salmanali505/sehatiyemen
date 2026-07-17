import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown } from "lucide-react";

type Hue = "primary" | "accent" | "success" | "warning";
type Props = {
  icon: LucideIcon;
  label: string;
  value: string | number;
  trend?: number | null;
  hue?: Hue;
};

const HUE: Record<Hue, string> = {
  primary: "bg-primary/10 text-primary",
  accent:  "bg-accent/15 text-accent",
  success: "bg-success/15 text-success",
  warning: "bg-warning/20 text-warning",
};

export default function DashKpi({ icon: Icon, label, value, trend, hue = "primary" }: Props) {
  const positive = (trend ?? 0) >= 0;
  return (
    <div className="rounded-[26px] border border-border/60 bg-card p-4 shadow-card hover:shadow-soft transition-shadow">
      <div className="flex items-start justify-between mb-4">
        {trend !== null && trend !== undefined ? (
          <span
            className={`inline-flex items-center gap-1 text-[10px] font-black rounded-full px-2 py-1 ${
              positive ? "bg-success/12 text-success" : "bg-destructive/10 text-destructive"
            }`}
          >
            {positive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {Math.abs(trend)}%
          </span>
        ) : (
          <span />
        )}
        <div className={`w-11 h-11 rounded-2xl ${HUE[hue]} flex items-center justify-center`}>
          <Icon size={20} strokeWidth={2.2} />
        </div>
      </div>
      <p className="text-[28px] font-black leading-none tabular-nums">{value}</p>
      <p className="text-xs text-muted-foreground mt-2">{label}</p>
    </div>
  );
}
