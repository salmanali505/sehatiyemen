import { Clock, CheckCircle2, XCircle, FileEdit, AlertTriangle } from "lucide-react";

export type ModStatus = "draft" | "pending_review" | "approved" | "rejected" | "needs_edit";

export const MOD: Record<ModStatus, { label: string; cls: string; icon: any }> = {
  draft:          { label: "مسودة",         cls: "bg-muted text-muted-foreground",   icon: FileEdit },
  pending_review: { label: "قيد المراجعة",  cls: "bg-warning/15 text-warning",       icon: Clock },
  approved:       { label: "معتمد",         cls: "bg-success/15 text-success",       icon: CheckCircle2 },
  rejected:       { label: "مرفوض",         cls: "bg-destructive/15 text-destructive", icon: XCircle },
  needs_edit:     { label: "يحتاج تعديل",   cls: "bg-primary/15 text-primary",       icon: AlertTriangle },
};

export default function ModerationBadge({ status }: { status: string | null }) {
  const s = (status && (status in MOD) ? status : "draft") as ModStatus;
  const m = MOD[s];
  const Icon = m.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold rounded-full px-2 py-0.5 ${m.cls}`}>
      <Icon size={10} /> {m.label}
    </span>
  );
}
