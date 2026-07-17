export type Period = "day" | "week" | "month" | "year";

const LABELS: Record<Period, string> = {
  day: "اليوم",
  week: "الأسبوع",
  month: "الشهر",
  year: "السنة",
};

export default function DashPeriodChips({
  value,
  onChange,
}: {
  value: Period;
  onChange: (p: Period) => void;
}) {
  const items: Period[] = ["year", "month", "week", "day"];
  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
      {items.map((p) => {
        const active = p === value;
        return (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={`shrink-0 rounded-2xl px-5 py-2.5 text-xs font-black transition-all duration-200
              ${
                active
                  ? "gradient-primary text-primary-foreground shadow-glow scale-105"
                  : "bg-card border border-border/60 text-foreground hover:border-primary/40 hover:bg-primary/5"
              }`}
          >
            {LABELS[p]}
          </button>
        );
      })}
    </div>
  );
}
