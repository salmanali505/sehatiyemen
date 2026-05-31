import { Search, SlidersHorizontal } from "lucide-react";

export function SearchBar() {
  return (
    <div className="px-4 mb-4">
      <div className="flex items-center gap-2 bg-card rounded-2xl shadow-card border border-border/40 p-1 pr-4">
        <Search className="text-muted-foreground" size={18} />
        <input
          type="text"
          placeholder="ابحث عن طبيب، عيادة، تخصص..."
          className="flex-1 bg-transparent outline-none text-sm font-medium placeholder:text-muted-foreground py-3"
        />
        <button className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
          <SlidersHorizontal className="text-primary-foreground" size={16} />
        </button>
      </div>
    </div>
  );
}
