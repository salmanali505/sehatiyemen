import type { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

export default function DashEmptyState({
  icon: Icon, title, description, action,
}: { icon: LucideIcon; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="rounded-3xl border-2 border-dashed border-border p-8 text-center bg-card/50">
      <div className="w-16 h-16 rounded-3xl bg-muted mx-auto mb-3 flex items-center justify-center text-muted-foreground">
        <Icon size={28} />
      </div>
      <h3 className="font-bold mb-1">{title}</h3>
      {description && <p className="text-xs text-muted-foreground mb-3">{description}</p>}
      {action}
    </div>
  );
}
