import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Calendar, Clock, ArrowRight, QrCode } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { BottomNav } from "@/components/BottomNav";
import { QrCanvas } from "@/components/QrCanvas";

export const Route = createFileRoute("/bookings")({
  head: () => ({ meta: [{ title: "حجوزاتي | صحتي" }] }),
  component: BookingsPage,
});

type Booking = {
  id: string; booking_number: string; provider_name: string; provider_type: string | null;
  doctor_name: string | null; service_name: string | null;
  appointment_date: string; appointment_time: string; status: string;
};

function BookingsPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");

  useEffect(() => {
    if (!loading && !user) { navigate({ to: "/auth" }); return; }
    if (user) {
      supabase.from("bookings").select("*").order("appointment_date", { ascending: false })
        .then(({ data }) => setBookings((data ?? []) as Booking[]));
    }
  }, [user, loading, navigate]);

  const today = new Date().toISOString().slice(0, 10);
  const filtered = bookings.filter((b) => tab === "upcoming" ? b.appointment_date >= today : b.appointment_date < today);
  const statusMap: Record<string, { l: string; c: string }> = {
    pending: { l: "قيد التأكيد", c: "bg-warning/15 text-warning" },
    confirmed: { l: "مؤكد", c: "bg-success/15 text-success" },
    completed: { l: "مكتمل", c: "bg-primary/15 text-primary" },
    cancelled: { l: "ملغي", c: "bg-destructive/15 text-destructive" },
    no_show: { l: "لم يحضر", c: "bg-muted text-muted-foreground" },
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="px-4 pt-12 pb-4">
        <div className="flex items-center gap-3 mb-4">
          <Link to="/" className="w-10 h-10 rounded-full glass flex items-center justify-center"><ArrowRight size={18} /></Link>
          <h1 className="text-xl font-black">حجوزاتي</h1>
        </div>
        <div className="flex bg-muted rounded-2xl p-1">
          {(["upcoming", "past"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold ${tab === t ? "bg-card text-primary shadow-soft" : "text-muted-foreground"}`}>
              {t === "upcoming" ? "القادمة" : "السابقة"}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 space-y-3">
        {filtered.length === 0 && (
          <div className="bg-card rounded-3xl p-10 text-center shadow-card">
            <Calendar className="mx-auto text-muted-foreground mb-3" size={40} />
            <p className="font-bold">لا توجد حجوزات</p>
            <Link to="/search" className="mt-4 inline-block gradient-primary text-primary-foreground px-5 py-2 rounded-xl text-sm font-bold">احجز الآن</Link>
          </div>
        )}
        {filtered.map((b) => {
          const s = statusMap[b.status] ?? statusMap.pending;
          const [showQr, ...rest] = [false]; void rest;
          return <BookingItem key={b.id} b={b} statusLabel={s.l} statusClass={s.c} />;
        })}
      </div>
      <BottomNav />
    </div>
  );
}

function BookingItem({ b, statusLabel, statusClass }: { b: Booking; statusLabel: string; statusClass: string }) {
  const [showQr, setShowQr] = useState(false);
  return (
    <div className="bg-card rounded-3xl p-4 shadow-card border border-border/40">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-muted-foreground">#{b.booking_number}</p>
          <h4 className="font-bold text-sm mt-0.5 line-clamp-1">{b.provider_name}</h4>
          {b.doctor_name && <p className="text-xs text-primary font-semibold mt-0.5">{b.doctor_name}</p>}
          {b.service_name && <p className="text-xs text-muted-foreground mt-0.5">{b.service_name}</p>}
        </div>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusClass}`}>{statusLabel}</span>
      </div>
      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border/40 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><Calendar size={12} />{b.appointment_date}</span>
        <span className="flex items-center gap-1"><Clock size={12} />{b.appointment_time.slice(0, 5)}</span>
        <button
          onClick={() => setShowQr((v) => !v)}
          className="ms-auto flex items-center gap-1 rounded-full bg-primary/10 text-primary font-bold px-3 py-1"
        >
          <QrCode size={12} /> {showQr ? "إخفاء" : "QR"}
        </button>
      </div>
      {showQr && (
        <div className="mt-3 flex flex-col items-center gap-2">
          <QrCanvas value={b.booking_number} size={180} />
          <p className="text-[11px] text-muted-foreground font-mono">{b.booking_number}</p>
        </div>
      )}
    </div>
  );
}
