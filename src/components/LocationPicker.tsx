import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { MapPin, Check, X } from "lucide-react";
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

      {open && (
        <div
          className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm flex items-end"
          onClick={() => setOpen(false)}
          dir="rtl"
        >
          <div
            className="bg-card w-full rounded-t-3xl p-5 pb-8 space-y-3 max-h-[92vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-black text-lg">اختر مدينتك</h3>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"
              >
                <X size={16} />
              </button>
            </div>

            {loading ? (
              <div className="p-6 text-center text-sm text-muted-foreground">جارٍ التحميل...</div>
            ) : cities.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">لا توجد مدن متاحة</div>
            ) : (
              <div className="space-y-2">
                {cities.map((c) => {
                  const selected = c.name_ar === city;
                  return (
                    <button
                      key={c.id}
                      onClick={() => { setCity(c.name_ar); setOpen(false); }}
                      className={`w-full flex items-center justify-between p-3 rounded-2xl transition ${
                        selected ? "gradient-primary text-primary-foreground shadow-glow" : "bg-muted hover:bg-muted/70"
                      }`}
                    >
                      <span className="flex items-center gap-3 font-bold text-sm">
                        <MapPin size={16} /> {c.name_ar}
                      </span>
                      {selected && <Check size={18} />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
