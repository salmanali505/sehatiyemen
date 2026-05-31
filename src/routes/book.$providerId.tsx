import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ArrowRight, ChevronLeft, Check, Calendar, Clock, User } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { getProvider, doctors as allDoctors } from "@/lib/mockData";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/book/$providerId")({
  head: () => ({ meta: [{ title: "حجز موعد | صحتي" }] }),
  component: BookingFlow,
});

const TIMES = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "16:00", "16:30", "17:00", "17:30", "18:00"];
const RESERVED = new Set(["10:30", "16:30"]);

function BookingFlow() {
  const { providerId } = Route.useParams();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const p = getProvider(providerId);
  const [step, setStep] = useState(1);
  const [doctorId, setDoctorId] = useState<string | null>(null);
  const [serviceIdx, setServiceIdx] = useState<number | null>(null);
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState<string | null>(null);
  const [name, setName] = useState(""); const [phone, setPhone] = useState("");
  const [age, setAge] = useState(""); const [gender, setGender] = useState<"male" | "female">("male");
  const [notes, setNotes] = useState("");
  const [bookingNumber, setBookingNumber] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { if (!loading && !user) navigate({ to: "/auth" }); }, [loading, user, navigate]);
  if (!p) return <div className="p-6 text-center">المزود غير موجود</div>;

  const providerDoctors = allDoctors.filter((d) => p.doctors.includes(d.id));
  const next = () => setStep((s) => Math.min(s + 1, 5));
  const back = () => step === 1 ? navigate({ to: "/provider/$id", params: { id: providerId } }) : setStep((s) => s - 1);

  const canNext = () => {
    if (step === 1) return doctorId !== null || providerDoctors.length === 0;
    if (step === 2) return serviceIdx !== null || p.services.length === 0;
    if (step === 3) return time !== null;
    if (step === 4) return name && phone && age;
    return false;
  };

  const submit = async () => {
    if (!user || !time) return;
    setSubmitting(true);
    const doctor = providerDoctors.find((d) => d.id === doctorId);
    const service = serviceIdx !== null ? p.services[serviceIdx] : null;
    const { data, error } = await supabase.from("bookings").insert({
      user_id: user.id,
      provider_id: p.id, provider_name: p.name, provider_type: p.typeLabel,
      doctor_id: doctor?.id ?? null, doctor_name: doctor?.name ?? null,
      service_name: service?.name ?? null,
      patient_name: name, patient_phone: phone, patient_age: parseInt(age), patient_gender: gender,
      notes, appointment_date: date, appointment_time: time, status: "pending",
    }).select("booking_number").single();
    setSubmitting(false);
    if (error) { toast.error("فشل الحجز: " + error.message); return; }
    setBookingNumber(data.booking_number);
    setStep(5);
    toast.success("تم الحجز بنجاح");
  };

  if (step === 5 && bookingNumber) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-20 h-20 rounded-full bg-success flex items-center justify-center mb-4">
          <Check className="text-white" size={40} />
        </motion.div>
        <h1 className="text-2xl font-black">تم تأكيد الحجز!</h1>
        <p className="text-muted-foreground mt-2 text-center">سيتم التواصل معك قريباً</p>
        <div className="mt-6 bg-card rounded-3xl p-6 shadow-float w-full max-w-sm border border-border/40">
          <p className="text-xs text-muted-foreground text-center">رقم الحجز</p>
          <p className="text-2xl font-black text-center text-primary mt-1">{bookingNumber}</p>
          <div className="mt-4 mx-auto w-40 h-40 bg-muted rounded-2xl flex items-center justify-center">
            <div className="text-center"><div className="text-4xl">▦</div><p className="text-[10px] text-muted-foreground mt-1">QR Code</p></div>
          </div>
          <div className="mt-4 space-y-2 text-sm">
            <Row k="المزود" v={p.name} />
            <Row k="التاريخ" v={date} />
            <Row k="الوقت" v={time!} />
            <Row k="المريض" v={name} />
          </div>
        </div>
        <button onClick={() => navigate({ to: "/bookings" })}
          className="mt-6 gradient-primary text-primary-foreground font-black py-3 px-8 rounded-2xl shadow-glow">
          عرض حجوزاتي
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="px-4 pt-12 pb-4">
        <div className="flex items-center gap-3">
          <button onClick={back} className="w-10 h-10 rounded-full glass flex items-center justify-center"><ArrowRight size={18} /></button>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">حجز موعد</p>
            <h1 className="font-black text-lg line-clamp-1">{p.name}</h1>
          </div>
        </div>
        <div className="flex gap-1.5 mt-4">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className={`flex-1 h-1.5 rounded-full ${s <= step ? "gradient-primary" : "bg-muted"}`} />
          ))}
        </div>
        <p className="text-[11px] text-muted-foreground mt-2">الخطوة {step} من 4</p>
      </div>

      <div className="px-4">
        {step === 1 && (
          <div>
            <h2 className="font-black mb-3">اختر الطبيب</h2>
            {providerDoctors.length === 0 ? (
              <div className="bg-card rounded-2xl p-6 text-center text-sm text-muted-foreground">لا يوجد أطباء — تابع للخطوة التالية</div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {providerDoctors.map((d) => (
                  <button key={d.id} onClick={() => setDoctorId(d.id)}
                    className={`text-right bg-card rounded-2xl p-3 border-2 transition ${doctorId === d.id ? "border-primary shadow-glow" : "border-transparent shadow-card"}`}>
                    <img src={d.image} alt={d.name} className="w-full aspect-square rounded-xl object-cover" />
                    <h4 className="font-bold text-sm mt-2 line-clamp-1">{d.name}</h4>
                    <p className="text-[11px] text-primary font-semibold">{d.specialty}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="font-black mb-3">اختر الخدمة</h2>
            {p.services.length === 0 ? (
              <div className="bg-card rounded-2xl p-6 text-center text-sm text-muted-foreground">لا توجد خدمات — تابع</div>
            ) : (
              <div className="space-y-2">
                {p.services.map((s, i) => (
                  <button key={i} onClick={() => setServiceIdx(i)}
                    className={`w-full text-right bg-card rounded-2xl p-4 border-2 flex items-center justify-between ${serviceIdx === i ? "border-primary shadow-glow" : "border-transparent shadow-card"}`}>
                    <div><h4 className="font-bold text-sm">{s.name}</h4><p className="text-xs text-muted-foreground">{s.duration}</p></div>
                    <p className="font-black text-primary">{s.price.toLocaleString("ar-EG")} ر.ي</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="font-black mb-3 flex items-center gap-2"><Calendar size={16} /> التاريخ والوقت</h2>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} min={new Date().toISOString().slice(0, 10)}
              className="w-full bg-card rounded-2xl p-4 text-sm font-bold border border-border/40 shadow-card" />
            <p className="mt-4 mb-2 text-sm font-bold flex items-center gap-1"><Clock size={14} /> الأوقات المتاحة</p>
            <div className="grid grid-cols-3 gap-2">
              {TIMES.map((t) => {
                const reserved = RESERVED.has(t);
                return (
                  <button key={t} disabled={reserved} onClick={() => setTime(t)}
                    className={`py-2.5 rounded-xl text-sm font-bold border-2 transition ${
                      reserved ? "bg-destructive/10 text-destructive border-transparent line-through" :
                      time === t ? "gradient-primary text-primary-foreground border-primary shadow-glow" :
                      "bg-success/10 text-success border-transparent"
                    }`}>{t}</button>
                );
              })}
            </div>
            <p className="mt-3 text-[11px] text-muted-foreground flex gap-3">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-success" />متاح</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-destructive" />محجوز</span>
            </p>
          </div>
        )}

        {step === 4 && (
          <div>
            <h2 className="font-black mb-3 flex items-center gap-2"><User size={16} /> بيانات المريض</h2>
            <div className="space-y-2">
              <input placeholder="الاسم الكامل" value={name} onChange={(e) => setName(e.target.value)}
                className="w-full bg-card rounded-2xl p-4 text-sm font-medium border border-border/40 shadow-card outline-none focus:border-primary" />
              <input placeholder="رقم الهاتف" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-card rounded-2xl p-4 text-sm font-medium border border-border/40 shadow-card outline-none focus:border-primary" />
              <div className="grid grid-cols-2 gap-2">
                <input placeholder="العمر" type="number" value={age} onChange={(e) => setAge(e.target.value)}
                  className="bg-card rounded-2xl p-4 text-sm font-medium border border-border/40 shadow-card outline-none focus:border-primary" />
                <select value={gender} onChange={(e) => setGender(e.target.value as "male" | "female")}
                  className="bg-card rounded-2xl p-4 text-sm font-medium border border-border/40 shadow-card outline-none">
                  <option value="male">ذكر</option><option value="female">أنثى</option>
                </select>
              </div>
              <textarea placeholder="ملاحظات (اختياري)" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
                className="w-full bg-card rounded-2xl p-4 text-sm font-medium border border-border/40 shadow-card outline-none focus:border-primary resize-none" />
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 inset-x-0 p-4 glass border-t border-border/40">
        <button onClick={step === 4 ? submit : next} disabled={!canNext() || submitting}
          className="w-full gradient-primary text-primary-foreground font-black py-4 rounded-2xl shadow-glow flex items-center justify-center gap-2 disabled:opacity-40">
          {submitting ? "جاري الحجز..." : step === 4 ? "تأكيد الحجز" : "متابعة"} <ChevronLeft size={18} />
        </button>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return <div className="flex justify-between gap-2"><span className="text-muted-foreground">{k}</span><span className="font-bold text-left line-clamp-1">{v}</span></div>;
}
