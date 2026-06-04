import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Loader2, ShieldAlert, QrCode, Calendar, Clock, User, Phone, CheckCircle2, LogOut, Search, Camera,
} from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { QrScanner } from "@/components/QrScanner";

export const Route = createFileRoute("/portal/reception/$token")({
  head: () => ({ meta: [{ title: "Reception Portal" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: ReceptionPortal,
});

type Booking = {
  id: string; booking_number: string; patient_name: string; patient_phone: string;
  appointment_date: string; appointment_time: string; service_name: string | null;
  doctor_name: string | null; provider_id: string; provider_name: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
};

function ReceptionPortal() {
  const { token } = Route.useParams();
  const [state, setState] = useState<"checking" | "invalid" | "ok">("checking");
  const [provider, setProvider] = useState<{ id: string; name: string } | null>(null);
  const [reception, setReception] = useState<{ full_name: string; permissions: any } | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState<"today" | "upcoming" | "all">("today");
  const [query, setQuery] = useState("");
  const [scannerOpen, setScannerOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: tk } = await supabase
        .from("access_tokens")
        .select("id, kind, active, expires_at, provider_id, reception_user_id")
        .eq("token", token).eq("kind", "reception").maybeSingle();
      if (!tk || !tk.active || (tk.expires_at && new Date(tk.expires_at) < new Date())) { setState("invalid"); return; }

      const [{ data: p }, { data: r }] = await Promise.all([
        tk.provider_id ? supabase.from("providers").select("id, name").eq("id", tk.provider_id).maybeSingle() : Promise.resolve({ data: null }) as any,
        tk.reception_user_id ? supabase.from("reception_users").select("full_name, permissions, active").eq("id", tk.reception_user_id).maybeSingle() : Promise.resolve({ data: null }) as any,
      ]);
      if (!p || (r && !r.active)) { setState("invalid"); return; }
      setProvider(p);
      setReception(r);
      await loadBookings(p.name);
      await supabase.from("access_tokens").update({ last_used_at: new Date().toISOString() }).eq("id", tk.id);
      setState("ok");
    })();
  }, [token]);

  async function loadBookings(providerName: string) {
    const { data } = await supabase
      .from("bookings")
      .select("*")
      .eq("provider_name", providerName)
      .order("appointment_date", { ascending: true })
      .limit(200);
    setBookings((data ?? []) as Booking[]);
  }

  async function updateStatus(id: string, status: Booking["status"]) {
    const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    setBookings((b) => b.map((x) => (x.id === id ? { ...x, status } : x)));
    toast.success("تم التحديث");
  }

  if (state === "checking") return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;
  if (state === "invalid") return (
    <div className="min-h-screen flex items-center justify-center px-6 text-center" dir="rtl">
      <div>
        <ShieldAlert className="mx-auto text-destructive mb-3" size={48} />
        <h1 className="font-extrabold text-2xl">رابط غير صالح</h1>
        <p className="text-sm text-muted-foreground mt-2">تواصل مع إدارة المنشأة للحصول على رابط جديد.</p>
      </div>
    </div>
  );

  const today = new Date().toISOString().slice(0, 10);
  const filtered = bookings.filter((b) => {
    if (filter === "today" && b.appointment_date !== today) return false;
    if (filter === "upcoming" && b.appointment_date < today) return false;
    if (query && !(b.patient_name.includes(query) || b.booking_number.includes(query) || b.patient_phone.includes(query))) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-background pb-12" dir="rtl">
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-background/85 border-b">
        <div className="mx-auto max-w-4xl px-4 py-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl gradient-primary flex items-center justify-center shadow-glow">
            <QrCode className="text-primary-foreground" size={18} />
          </div>
          <div className="flex-1">
            <h1 className="font-extrabold text-lg">لوحة الاستقبال</h1>
            <p className="text-xs text-muted-foreground">
              {provider?.name} {reception?.full_name && `• ${reception.full_name}`}
            </p>
          </div>
          <button
            onClick={() => { sessionStorage.clear(); window.location.href = "/"; }}
            className="p-2 rounded-xl hover:bg-muted text-destructive"
            title="خروج"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6 space-y-4">
        <div className="grid grid-cols-3 gap-2">
          {(["today", "upcoming", "all"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-2xl px-3 py-2.5 text-xs font-bold transition ${filter === f ? "gradient-primary text-primary-foreground shadow-glow" : "bg-muted text-muted-foreground"}`}
            >
              {f === "today" ? "اليوم" : f === "upcoming" ? "القادمة" : "الكل"}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="بحث برقم الحجز / الاسم / الهاتف..."
            className="w-full rounded-2xl border border-input bg-background pr-9 pl-3 py-3 text-sm outline-none focus:border-primary"
          />
        </div>

        <div className="rounded-3xl border bg-card overflow-hidden shadow-sm">
          <div className="p-4 border-b flex items-center gap-2">
            <Calendar size={18} className="text-primary" />
            <h2 className="font-extrabold">المواعيد</h2>
            <span className="text-xs text-muted-foreground">({filtered.length})</span>
          </div>
          {filtered.length === 0 ? (
            <div className="p-12 text-center text-sm text-muted-foreground">لا توجد مواعيد ضمن هذا الفلتر.</div>
          ) : (
            <div className="divide-y">
              {filtered.map((b) => (
                <motion.div key={b.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4">
                  <div className="flex flex-wrap items-start gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary/15 to-accent/15 flex items-center justify-center">
                      <User size={18} className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-[180px]">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold">{b.patient_name}</h3>
                        <span className="text-[10px] font-mono text-muted-foreground">#{b.booking_number}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1 flex-wrap">
                        <span className="flex items-center gap-1"><Calendar size={12} /> {b.appointment_date}</span>
                        <span className="flex items-center gap-1"><Clock size={12} /> {b.appointment_time}</span>
                        <a href={`tel:${b.patient_phone}`} className="flex items-center gap-1 text-primary">
                          <Phone size={12} /> {b.patient_phone}
                        </a>
                      </div>
                      {(b.doctor_name || b.service_name) && (
                        <p className="text-xs mt-1">
                          {b.doctor_name && <span className="font-semibold">{b.doctor_name}</span>}
                          {b.doctor_name && b.service_name && " • "}
                          {b.service_name}
                        </p>
                      )}
                    </div>
                    <StatusPill status={b.status} />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {b.status === "pending" && (
                      <button onClick={() => updateStatus(b.id, "confirmed")} className="rounded-xl bg-primary/10 text-primary text-[11px] font-bold px-3 py-1.5">✓ تأكيد</button>
                    )}
                    {b.status !== "completed" && b.status !== "cancelled" && (
                      <button onClick={() => updateStatus(b.id, "completed")} className="rounded-xl bg-success/10 text-success text-[11px] font-bold px-3 py-1.5 flex items-center gap-1">
                        <CheckCircle2 size={12} /> تسجيل الحضور / إنهاء
                      </button>
                    )}
                    {b.status !== "cancelled" && (
                      <button onClick={() => updateStatus(b.id, "cancelled")} className="rounded-xl bg-destructive/10 text-destructive text-[11px] font-bold px-3 py-1.5">إلغاء</button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function StatusPill({ status }: { status: Booking["status"] }) {
  const map = {
    pending: { c: "bg-warning/10 text-warning", t: "بانتظار" },
    confirmed: { c: "bg-primary/10 text-primary", t: "مؤكد" },
    completed: { c: "bg-success/10 text-success", t: "مكتمل" },
    cancelled: { c: "bg-destructive/10 text-destructive", t: "ملغي" },
  } as const;
  const s = map[status];
  return <span className={`text-[10px] font-bold rounded-full px-2.5 py-1 ${s.c}`}>{s.t}</span>;
}
