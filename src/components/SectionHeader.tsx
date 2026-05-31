import { ArrowLeft } from "lucide-react";

export function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="flex items-end justify-between px-4 mb-3">
      <div>
        <h3 className="text-lg font-black text-foreground">{title}</h3>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      <button className="flex items-center gap-1 text-xs font-bold text-primary">
        عرض الكل
        <ArrowLeft size={14} />
      </button>
    </div>
  );
}
