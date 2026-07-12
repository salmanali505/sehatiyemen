import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import * as Icons from "lucide-react";
import { Stethoscope } from "lucide-react";
import { categories as defaultCategories } from "@/lib/mockData";
import { supabase } from "@/integrations/supabase/client";

type Cat = { id: string; label: string; icon: any; color: string; count?: number };

const COLORS = [
  "from-blue-500 to-blue-600",
  "from-cyan-500 to-cyan-600",
  "from-emerald-500 to-emerald-600",
  "from-indigo-500 to-indigo-600",
  "from-teal-500 to-teal-600",
  "from-fuchsia-500 to-pink-600",
  "from-amber-500 to-orange-600",
];

function iconFor(name?: string | null) {
  if (!name) return Stethoscope;
  const key = name.trim();
  return ((Icons as any)[key] as any) ?? Stethoscope;
}

export function CategoryGrid() {
  const [items, setItems] = useState<Cat[]>(defaultCategories as any);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("specialties")
        .select("id, name_ar, icon, kind, active, sort_order")
        .eq("active", true)
        .in("kind", ["category", "specialty"])
        .is("parent_id", null)
        .order("sort_order")
        .limit(10);
      if (data && data.length) {
        setItems(data.map((s, i) => ({
          id: s.id,
          label: s.name_ar,
          icon: iconFor(s.icon),
          color: COLORS[i % COLORS.length],
        })));
      }
    })();
  }, []);

  const cols = items.length >= 5 ? "grid-cols-5" : `grid-cols-${Math.max(items.length, 2)}`;

  return (
    <div className="px-4">
      <div className={`grid ${cols} gap-2`}>
        {items.map((cat, i) => {
          const Icon = cat.icon;
          return (
            <motion.div key={cat.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }} whileTap={{ scale: 0.92 }}>
              <Link to="/search" search={{ kind: cat.id }} className="flex flex-col items-center gap-1.5">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center shadow-soft`}>
                  <Icon className="text-white" size={24} strokeWidth={2.2} />
                </div>
                <span className="text-[11px] font-bold text-foreground text-center leading-tight">{cat.label}</span>
                {cat.count != null && <span className="text-[9px] text-muted-foreground">{cat.count}+</span>}
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
