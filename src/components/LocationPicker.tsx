import { useEffect, useState } from "react";
import { MapPin, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCities, useSelectedCity } from "@/lib/useCities";

export function LocationPicker() {
  const [open, setOpen] = useState(false);
  const { cities, loading } = useCities();
  const { city, setCity } = useSelectedCity();

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 h-10 px-3 rounded-full glass shadow-card"
        aria-label="اختر المدينة"
      >
        <MapPin size={16} className="text-primary" />
        <span className="text-xs font-bold max-w-[80px] truncate">{city}</span>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-x-0 bottom-0 z-50 bg-card rounded-t-3xl shadow-2xl max-h-[80vh] overflow-hidden flex flex-col overscroll-contain touch-pan-y"
              dir="rtl"
              role="dialog"
              aria-modal="true"
              onTouchMove={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="font-extrabold">اختر مدينتك</h3>
                <button onClick={() => setOpen(false)} className="rounded-full p-2 hover:bg-muted">
                  <X size={18} />
                </button>
              </div>
              <div className="overflow-y-auto p-2">
                {loading ? (
                  <div className="p-6 text-center text-sm text-muted-foreground">جارٍ التحميل...</div>
                ) : cities.length === 0 ? (
                  <div className="p-6 text-center text-sm text-muted-foreground">لا توجد مدن متاحة</div>
                ) : (
                  cities.map((c) => {
                    const selected = c.name_ar === city;
                    return (
                      <button
                        key={c.id}
                        onClick={() => { setCity(c.name_ar); setOpen(false); }}
                        className={`w-full flex items-center justify-between p-3 rounded-2xl transition ${
                          selected ? "gradient-primary text-primary-foreground shadow-glow" : "hover:bg-muted"
                        }`}
                      >
                        <span className="flex items-center gap-3 font-bold">
                          <MapPin size={16} /> {c.name_ar}
                        </span>
                        {selected && <Check size={18} />}
                      </button>
                    );
                  })
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
