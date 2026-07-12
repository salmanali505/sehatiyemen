import { useEffect, useState } from "react";
import { offers as defaultOffers } from "@/lib/mockData";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

type Offer = { id: string | number; title: string; desc: string; discount: string; color: string };

const COLORS = [
  "from-emerald-500 to-teal-600",
  "from-blue-500 to-indigo-600",
  "from-cyan-500 to-blue-600",
  "from-fuchsia-500 to-pink-600",
  "from-amber-500 to-orange-600",
];

export function OffersStrip() {
  const [items, setItems] = useState<Offer[]>(defaultOffers);

  useEffect(() => {
    (async () => {
      const now = new Date().toISOString();
      const { data } = await supabase
        .from("offers")
        .select("id, title, description, discount_percent, discount_amount")
        .eq("active", true)
        .eq("approved", true)
        .or(`starts_at.is.null,starts_at.lte.${now}`)
        .or(`ends_at.is.null,ends_at.gte.${now}`)
        .order("created_at", { ascending: false })
        .limit(10);
      if (data && data.length) {
        setItems(data.map((o, i) => ({
          id: o.id,
          title: o.title,
          desc: o.description || "عرض حصري",
          discount: o.discount_percent ? `خصم ${o.discount_percent}%`
            : o.discount_amount ? `خصم ${Number(o.discount_amount).toLocaleString("ar-EG")}` : "عرض",
          color: COLORS[i % COLORS.length],
        })));
      }
    })();
  }, []);

  return (
    <div className="flex gap-3 overflow-x-auto scrollbar-hide px-4 pb-2">
      {items.map((o, i) => (
        <motion.div key={o.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}>
          <Link to="/search" search={{ q: o.title }}
            className={`block min-w-[220px] bg-gradient-to-br ${o.color} rounded-3xl p-4 text-white shadow-glow relative overflow-hidden`}>
            <div className="absolute -top-4 -left-4 w-20 h-20 rounded-full bg-white/15 blur-2xl" />
            <Sparkles className="text-white/80 mb-2" size={18} />
            <p className="text-[11px] font-semibold text-white/90">{o.desc}</p>
            <h4 className="text-lg font-black mt-1">{o.title}</h4>
            <div className="mt-2 inline-block bg-white/25 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-black">
              {o.discount}
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
