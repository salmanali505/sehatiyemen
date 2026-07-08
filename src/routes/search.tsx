import { createFileRoute, Link } from "@tanstack/react-router";
import { Search as SearchIcon, MapPin, Star, BadgeCheck, ArrowRight, Stethoscope } from "lucide-react";
import { useState, useMemo } from "react";
import { providers, doctors, categories } from "@/lib/mockData";
import { BottomNav } from "@/components/BottomNav";
import { useSelectedCity } from "@/lib/useCities";

export const Route = createFileRoute("/search")({
  head: () => ({ meta: [{ title: "بحث | صحتي" }] }),
  component: SearchPage,
});

const norm = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[\u064B-\u065F\u0670]/g, "").trim();

function SearchPage() {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [openOnly, setOpenOnly] = useState(false);
  const [cityScope, setCityScope] = useState<"city" | "all">("city");
  const { city } = useSelectedCity();
  const nq = norm(q);

  const providerResults = useMemo(() => providers.filter((p) => {
    if (cityScope === "city" && p.city !== city) return false;
    if (filter !== "all" && p.kind !== filter.replace(/s$/, "") && p.kind !== filter) return false;
    if (openOnly && !p.open) return false;
    if (!nq) return true;
    return [p.name, p.city, p.typeLabel, p.area].some((v) => norm(v).includes(nq));
  }), [nq, filter, openOnly, cityScope, city]);

  const doctorResults = useMemo(() => {
    if (!nq && filter !== "all") return [];
    const inCityProviderIds = new Set(providers.filter((p) => cityScope === "all" || p.city === city).map((p) => p.id));
    return doctors.filter((d) => {
      const doctorsProviders = providers.filter((p) => p.doctors.includes(d.id));
      const inScope = doctorsProviders.some((p) => inCityProviderIds.has(p.id));
      if (!inScope) return false;
      if (!nq) return true;
      return [d.name, d.specialty].some((v) => norm(v).includes(nq));
    });
  }, [nq, filter, cityScope, city]);

  const total = providerResults.length + doctorResults.length;

  return (
    <div className="min-h-screen bg-background pb-36">
      <div className="px-4 pt-12 pb-4">
        <div className="flex items-center gap-3 mb-4">
          <Link to="/" className="w-10 h-10 rounded-full glass flex items-center justify-center"><ArrowRight size={18} /></Link>
          <h1 className="text-xl font-black">بحث متقدم</h1>
        </div>
        <div className="flex items-center gap-2 bg-card rounded-2xl shadow-card border border-border/40 p-1 pr-4">
          <SearchIcon size={18} className="text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="طبيب، تخصص، عيادة، مدينة..."
            className="flex-1 bg-transparent outline-none text-sm font-medium py-3" />
        </div>

        <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-hide">
          <Chip active={filter === "all"} onClick={() => setFilter("all")}>الكل</Chip>
          {categories.map((c) => (
            <Chip key={c.id} active={filter === c.id} onClick={() => setFilter(c.id)}>{c.label}</Chip>
          ))}
        </div>
        <div className="flex gap-2 mt-2 flex-wrap">
          <Chip active={openOnly} onClick={() => setOpenOnly(!openOnly)}>مفتوح الآن</Chip>
          <Chip active={cityScope === "city"} onClick={() => setCityScope(cityScope === "city" ? "all" : "city")}>
            {cityScope === "city" ? `${city} فقط` : "كل المدن"}
          </Chip>
        </div>

        <p className="text-xs text-muted-foreground mt-4">{total} نتيجة</p>
      </div>

      <div className="px-4 space-y-3">
        {total === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <SearchIcon size={40} className="mx-auto opacity-40" />
            <p className="mt-3 font-bold text-sm">لا توجد نتائج مطابقة</p>
            <p className="text-xs mt-1">جرّب تغيير الكلمة أو توسيع نطاق البحث</p>
          </div>
        )}

        {doctorResults.length > 0 && (
          <>
            <h3 className="text-xs font-black text-muted-foreground mt-2">الأطباء</h3>
            {doctorResults.map((d) => (
              <Link key={d.id} to="/doctor/$id" params={{ id: d.id }}
                className="block bg-card rounded-3xl shadow-card overflow-hidden border border-border/40">
                <div className="flex gap-3 p-3">
                  <img src={d.image} alt={d.name} className="w-20 h-20 rounded-2xl object-cover" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm line-clamp-1">{d.name}</h4>
                    <p className="text-xs text-primary font-bold mt-0.5">{d.specialty}</p>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-0.5"><Star size={10} className="text-warning fill-warning" /><b className="text-foreground">{d.rating}</b></span>
                      <span className="flex items-center gap-0.5"><Stethoscope size={10} />خبرة {d.exp}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </>
        )}

        {providerResults.length > 0 && (
          <>
            <h3 className="text-xs font-black text-muted-foreground mt-4">المزودون</h3>
            {providerResults.map((p) => (
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
          </>
        )}
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
