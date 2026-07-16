import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown } from "lucide-react";

type Props = {
  icon: LucideIcon;
  label: string;
  value: string | number;
  trend?: number | null;
  hue?: "primary" | "accent" | "success" | "warning";
};

const HUE: Record<string, string> = {
  primary: "bg-primary/10 text-primary",
  accent:  "bg-accent/15 text-accent",
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning",
};

export default function DashKpi({ icon: Icon, label, value, trend, hue = "primary" }: Props) {
  const positive = (trend ?? 0) >= 0;
  return (
    <div className="rounded-3xl border border-border/60 bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        {trend !== null && trend !== undefined && (
          <span className={`inline-flex items-center gap-1 text-[10px] font-black rounded-full px-2 py-1 ${positive ? "bg-success/15 text-success" : "bg-destructive/10 text-destructive"}`}>
            {positive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
            {Math.abs(trend)}%
          </span>
        )}
        <div className={`w-10 h-10 rounded-2xl ${HUE[hue]} flex items-center justify-center`}>
          <Icon size={18} />
        </div>
      </div>
      <p className="text-2xl font-black leading-none">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </div>
  );
}
