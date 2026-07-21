import { Loader2 } from "lucide-react";
export default function DashLoader({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 gap-2 text-muted-foreground">
      <Loader2 className="animate-spin text-primary" size={28} />
      {label && <span className="text-xs">{label}</span>}
    </div>
  );
}
