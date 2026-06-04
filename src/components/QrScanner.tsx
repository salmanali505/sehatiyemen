import { useEffect, useRef, useState } from "react";
import { X, Camera, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Props = {
  open: boolean;
  onClose: () => void;
  onResult: (text: string) => void;
};

const READER_ID = "sehati-qr-reader";

export function QrScanner({ open, onClose, onResult }: Props) {
  const scannerRef = useRef<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setError(null);

    (async () => {
      try {
        const mod = await import("html5-qrcode");
        if (cancelled) return;
        const { Html5Qrcode } = mod;
        const instance = new Html5Qrcode(READER_ID);
        scannerRef.current = instance;
        await instance.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 240, height: 240 } },
          (decoded) => {
            onResult(decoded);
            stop();
          },
          () => {}
        );
      } catch (e: any) {
        setError(e?.message ?? "تعذّر تشغيل الكاميرا");
      }
    })();

    async function stop() {
      const inst = scannerRef.current;
      scannerRef.current = null;
      if (inst) {
        try { await inst.stop(); await inst.clear(); } catch {}
      }
    }

    return () => { cancelled = true; void stop(); };
  }, [open, onResult]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="fixed inset-x-0 bottom-0 z-50 bg-card rounded-t-3xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col"
            dir="rtl"
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-extrabold flex items-center gap-2"><Camera size={18} className="text-primary" /> مسح رمز الحجز</h3>
              <button onClick={onClose} className="rounded-full p-2 hover:bg-muted"><X size={18} /></button>
            </div>
            <div className="p-4 flex flex-col items-center">
              <div id={READER_ID} className="w-full max-w-sm aspect-square rounded-2xl overflow-hidden bg-black" />
              {error && (
                <div className="mt-3 rounded-2xl bg-destructive/10 text-destructive px-4 py-2 text-xs flex items-center gap-2">
                  <AlertCircle size={14} /> {error}
                </div>
              )}
              <p className="mt-3 text-xs text-muted-foreground text-center">
                وجّه الكاميرا نحو رمز الـ QR الموجود في تأكيد الحجز.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
