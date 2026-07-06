import { createFileRoute, Link } from "@tanstack/react-router";
import { Search as SearchIcon, MapPin, Star, BadgeCheck, ArrowRight } from "lucide-react";
import { useState, useMemo } from "react";
import { providers, categories } from "@/lib/mockData";
import { BottomNav } from "@/components/BottomNav";

export const Route = createFileRoute("/search")({
  head: () => ({ meta: [{ title: "بحث | صحتي" }] }),
  component: SearchPage,
});

function SearchPage() {
  const [q, setQ] = useState(""); const [filter, setFilter] = useState<string>("all");
  const [openOnly, setOpenOnly] = useState(false);
  const results = useMemo(() => providers.filter((p) =>
    (filter === "all" || p.kind === filter.slice(0, -1) || p.kind === filter) &&
    (!openOnly || p.open) &&
    (q === "" || p.name.includes(q) || p.city.includes(q) || p.typeLabel.includes(q))
  ), [q, filter, openOnly]);

  return (
    <div className="min-h-screen bg-background pb-36">
      <div className="px-4 pt-12 pb-4">
        <div className="flex items-center gap-3 mb-4">
          <Link to="/" className="w-10 h-10 rounded-full glass flex items-center justify-center"><ArrowRight size={18} /></Link>
          <h1 className="text-xl font-black">بحث متقدم</h1>
        </div>
        <div className="flex items-center gap-2 bg-card rounded-2xl shadow-card border border-border/40 p-1 pr-4">
          <SearchIcon size={18} className="text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث عن طبيب، عيادة، مدينة..."
            className="flex-1 bg-transparent outline-none text-sm font-medium py-3" />
        </div>

        <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-hide">
          <Chip active={filter === "all"} onClick={() => setFilter("all")}>الكل</Chip>
          {categories.map((c) => (
            <Chip key={c.id} active={filter === c.id} onClick={() => setFilter(c.id)}>{c.label}</Chip>
          ))}
        </div>
        <div className="flex gap-2 mt-2">
          <Chip active={openOnly} onClick={() => setOpenOnly(!openOnly)}>مفتوح الآن</Chip>
        </div>

        <p className="text-xs text-muted-foreground mt-4">{results.length} نتيجة</p>
      </div>

      <div className="px-4 space-y-3">
        {results.map((p) => (
          <Link key={p.id} to="/provider/$id" params={{ id: p.id }}
            className="block bg-card rounded-3xl shadow-card overflow-hidden border border-border/40">
            <div className="flex gap-3 p-3">
              <img src={p.image} alt={p.name} className="w-24 h-24 rounded-2xl object-cover" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <h4 className="font-bold text-sm line-clamp-1 flex-1">{p.name}</h4>
                  {p.verified && <BadgeCheck size={14} className="text-primary fill-primary/20" />}
                </div>
                <p className="text-xs text-primary font-bold mt-0.5">{p.typeLabel}</p>
                <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-0.5"><Star size={10} className="text-warning fill-warning" /><b className="text-foreground">{p.rating}</b></span>
                  <span className="flex items-center gap-0.5"><MapPin size={10} />{p.city}</span>
                </div>
                <span className={`mt-2 inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${p.open ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"}`}>
                  {p.open ? "مفتوح الآن" : "مغلق"}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
      <BottomNav />
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick}
      className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${active ? "gradient-primary text-primary-foreground shadow-soft" : "bg-muted text-muted-foreground"}`}>
      {children}
    </button>
  );
}
