import { useEffect, useState } from "react";
import { WifiOff, RefreshCw, CloudUpload, Check, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { useNetworkStatus } from "@/lib/pwa/useNetworkStatus";
import {
  flushBookingQueue,
  getQueuedBookings,
  subscribeQueue,
  type QueuedBooking,
} from "@/lib/pwa/booking-queue";
import { warmOfflineCache } from "@/lib/pwa/offline-cache";
import { registerPwa } from "@/lib/pwa/register";

const OFFLINE_FEATURES = [
  "تأكيد الحجوزات فوراً (تُحفظ وتُرسل لاحقاً)",
  "الدفع ورفع إثبات التحويل",
  "التقييمات والإشعارات الجديدة",
  "البحث عن مزودين جدد وتحديث النتائج",
  "المساعد الذكي",
];

/**
 * Accurate connectivity banner: shows online/offline/slow state, lists the
 * features unavailable without a network, and reports the pending booking queue.
 */
export function OfflineIndicator() {
  const { online, degraded, effectiveType } = useNetworkStatus();
  const [queue, setQueue] = useState<QueuedBooking[]>([]);
  const [open, setOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [justSynced, setJustSynced] = useState(false);

  useEffect(() => {
    registerPwa();
    warmOfflineCache();
    setQueue(getQueuedBookings());
    return subscribeQueue(setQueue);
  }, []);

  useEffect(() => {
    if (!online) return;
    warmOfflineCache();
    (async () => {
      if (getQueuedBookings().length === 0) return;
      setSyncing(true);
      const sent = await flushBookingQueue();
      setSyncing(false);
      if (sent > 0) {
        setJustSynced(true);
        toast.success(`تم إرسال ${sent} حجز كان بانتظار الاتصال`);
        setTimeout(() => setJustSynced(false), 4000);
      }
    })();
  }, [online]);

  const pending = queue.length;
  const visible = !online || degraded || pending > 0 || justSynced;
  if (!visible) return null;

  const tone = !online
    ? "bg-destructive text-destructive-foreground"
    : degraded
      ? "bg-warning text-warning-foreground"
      : "bg-success text-success-foreground";

  const title = !online
    ? "أنت بدون إنترنت — يعمل التطبيق بالوضع المحفوظ"
    : degraded
      ? `اتصال ضعيف${effectiveType ? ` (${effectiveType})` : ""} — قد يتأخر التحميل`
      : pending > 0
        ? `جاري مزامنة ${pending} حجز...`
        : "تمت المزامنة بنجاح";

  return (
    <div className="fixed inset-x-0 top-0 z-[200] px-3 pt-[env(safe-area-inset-top)]">
      <div className={`mx-auto mt-2 max-w-md rounded-2xl shadow-lg ${tone}`}>
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex w-full items-center gap-2 px-4 py-2.5 text-right"
          aria-expanded={open}
        >
          {!online ? (
            <WifiOff size={16} />
          ) : syncing || pending > 0 ? (
            <CloudUpload size={16} className={syncing ? "animate-pulse" : ""} />
          ) : (
            <Check size={16} />
          )}
          <span className="flex-1 text-xs font-bold">{title}</span>
          <ChevronDown size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} />
        </button>

        {open && (
          <div className="space-y-2 border-t border-white/25 px-4 py-3 text-[11px] font-medium">
            {!online && (
              <>
                <p className="font-bold">ميزات غير متاحة الآن:</p>
                <ul className="space-y-1 opacity-90">
                  {OFFLINE_FEATURES.map((f) => (
                    <li key={f}>• {f}</li>
                  ))}
                </ul>
                <p className="opacity-90">
                  المتاح: تصفح المحافظات والتخصصات والعروض المحفوظة، حجوزاتك السابقة، وإنشاء حجز
                  يُرسل تلقائياً عند عودة الاتصال.
                </p>
              </>
            )}
            {pending > 0 && (
              <div className="flex items-center justify-between gap-2 pt-1">
                <span>{pending} حجز بانتظار الإرسال</span>
                <button
                  disabled={!online || syncing}
                  onClick={async () => {
                    setSyncing(true);
                    const sent = await flushBookingQueue();
                    setSyncing(false);
                    if (sent > 0) toast.success(`تم إرسال ${sent} حجز`);
                    else toast.error("تعذّر الإرسال، سنحاول لاحقاً");
                  }}
                  className="flex items-center gap-1 rounded-xl bg-white/20 px-3 py-1.5 font-bold disabled:opacity-50"
                >
                  <RefreshCw size={12} className={syncing ? "animate-spin" : ""} />
                  إرسال الآن
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
