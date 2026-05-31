import { offers } from "@/lib/mockData";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export function OffersStrip() {
  return (
    <div className="flex gap-3 overflow-x-auto scrollbar-hide px-4 pb-2">
      {offers.map((o, i) => (
        <motion.div
          key={o.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.08 }}
          className={`min-w-[220px] bg-gradient-to-br ${o.color} rounded-3xl p-4 text-white shadow-glow relative overflow-hidden`}
        >
          <div className="absolute -top-4 -left-4 w-20 h-20 rounded-full bg-white/15 blur-2xl" />
          <Sparkles className="text-white/80 mb-2" size={18} />
          <p className="text-[11px] font-semibold text-white/90">{o.desc}</p>
          <h4 className="text-lg font-black mt-1">{o.title}</h4>
          <div className="mt-2 inline-block bg-white/25 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-black">
            {o.discount}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
