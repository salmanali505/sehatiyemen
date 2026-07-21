import { Search } from "lucide-react";
type Props = { value: string; onChange: (v: string) => void; placeholder?: string };
export default function DashSearchBar({ value, onChange, placeholder = "بحث..." }: Props) {
  return (
    <div className="relative">
      <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-input bg-card pr-9 pl-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
      />
    </div>
  );
}
