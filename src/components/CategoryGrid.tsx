import { motion } from "framer-motion";
import { categories } from "@/lib/mockData";

export function CategoryGrid() {
  return (
    <div className="px-4">
      <div className="grid grid-cols-5 gap-2">
        {categories.map((cat, i) => {
          const Icon = cat.icon;
          return (
            <motion.button
              key={cat.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileTap={{ scale: 0.92 }}
              className="flex flex-col items-center gap-1.5"
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center shadow-soft`}>
                <Icon className="text-white" size={24} strokeWidth={2.2} />
              </div>
              <span className="text-[11px] font-bold text-foreground text-center leading-tight">{cat.label}</span>
              <span className="text-[9px] text-muted-foreground">{cat.count}+</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
