import { ReactNode } from "react";
type Tone = "primary" | "success" | "warning" | "destructive" | "muted" | "accent";
const map: Record<Tone, string> = {
  primary:     "bg-primary/12 text-primary",
  success:     "bg-success/15 text-success",
  warning:     "bg-warning/15 text-warning",
  destructive: "bg-destructive/12 text-destructive",
  accent:      "bg-accent/15 text-accent",
  muted:       "bg-muted text-muted-foreground",
};
export default function DashBadge({ tone = "muted", children }: { tone?: Tone; children: ReactNode }) {
  return <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${map[tone]}`}>{children}</span>;
}
