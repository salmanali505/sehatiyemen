import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Star, Phone, MessageCircle, MapPin, Clock, Calendar, BadgeCheck, Image as ImageIcon } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { getDoctor, providers as allProviders } from "@/lib/mockData";
import { BottomNav } from "@/components/BottomNav";

export const Route = createFileRoute("/doctor/$id")({
  head: ({ params }) => {
    const d = getDoctor(params.id);
    return {
      meta: [
        { title: `${d?.name ?? "طبيب"} | صحتي` },
        { name: "description", content: d?.bio ?? "" },
      ],
    };
  },
  component: DoctorPage,
});

function DoctorPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const d = getDoctor(id);
  const [tab, setTab] = useState<"about" | "gallery" | "reviews">("about");

  if (!d) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <p className="text-muted-foreground">الطبيب غير موجود</p>
        <Link to="/" className="mt-4 gradient-primary text-primary-foreground font-bold px-6 py-2 rounded-full">العودة للرئيسية</Link>
      </div>
    );
  }

  const clinics = allProviders.filter((p) => p.doctors.includes(d.id));
  const primaryClinic = clinics[0];
  const phone = primaryClinic?.phone ?? "+967";
  const wa = primaryClinic?.whatsapp ?? "+967";

  return (
    <div className="min-h-screen bg-background pb-40">
      <div className="relative gradient-hero pt-12 pb-24 px-4 overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-accent/25 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-primary-glow/30 rounded-full blur-3xl" />
        <div className="relative flex items-center justify-between mb-6">
          <Link to="/" className="w-10 h-10 rounded-full glass flex items-center justify-center text-white"><ArrowRight size={18} /></Link>
          <h1 className="text-white font-black text-sm">ملف الطبيب</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="px-4 -mt-20 relative z-10">
        <div className="bg-card rounded-3xl shadow-float p-5 border border-border/40">
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 rounded-2xl overflow-hidden gradient-primary p-0.5 shrink-0">
              <img src={d.image} alt={d.name} className="w-full h-full object-cover rounded-2xl" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1 flex-wrap">
                <h2 className="text-lg font-black text-foreground">{d.name}</h2>
                <BadgeCheck className="text-primary fill-primary/20" size={16} />
              </div>
              <p className="text-xs text-primary font-bold mt-1">{d.specialty}</p>
              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Star size={12} className="text-warning fill-warning" /><b className="text-foreground">{d.rating}</b> ({d.reviews})</span>
                <span>خبرة {d.exp}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-4">
            <Stat label="التقييم" value={d.rating.toString()} />
            <Stat label="مراجعة" value={d.reviews.toString()} />
            <Stat label="الخبرة" value={d.exp} />
          </div>

          <div className="flex gap-2 mt-4">
            <a href={`tel:${phone}`} className="flex-1 flex items-center justify-center gap-1 bg-muted text-foreground py-2.5 rounded-xl text-xs font-bold">
              <Phone size={14} /> اتصال
            </a>
            <a href={`https://wa.me/${wa.replace(/\D/g, "")}`} className="flex-1 flex items-center justify-center gap-1 bg-success text-success-foreground py-2.5 rounded-xl text-xs font-bold">
              <MessageCircle size={14} /> واتساب
            </a>
          </div>
        </div>

        <div className="flex gap-1 mt-5 bg-muted rounded-2xl p-1">
          {[["about", "نبذة"], ["gallery", "صور"], ["reviews", "تقييمات"]].map(([k, l]) => (
            <button key={k} onClick={() => setTab(k as typeof tab)}
              className={`flex-1 py-2 rounded-xl text-xs font-bold ${tab === k ? "bg-card text-primary shadow-soft" : "text-muted-foreground"}`}>
              {l}
            </button>
          ))}
        </div>

        <div className="mt-4">
          {tab === "about" && (
            <div className="space-y-3">
              <div className="bg-card rounded-3xl p-5 shadow-card space-y-3">
                <div>
                  <p className="text-[11px] text-muted-foreground font-bold">المؤهلات</p>
                  <p className="text-sm mt-1">{d.qualifications}</p>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground font-bold">نبذة</p>
                  <p className="text-sm mt-1 leading-relaxed">{d.bio}</p>
                </div>
                {primaryClinic && (
                  <>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-border/40">
                      <Clock size={14} /><span>ساعات العمل: <b className="text-foreground">{primaryClinic.hours}</b></span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin size={14} /><span>{primaryClinic.address}</span>
                    </div>
                  </>
                )}
              </div>

              {clinics.length > 0 && (
                <div>
                  <h3 className="text-xs font-black text-muted-foreground mt-2 mb-2">يعمل في</h3>
                  <div className="space-y-2">
                    {clinics.map((c) => (
                      <Link key={c.id} to="/provider/$id" params={{ id: c.id }}
                        className="flex items-center gap-3 bg-card rounded-2xl p-3 shadow-card">
                        <img src={c.image} alt={c.name} className="w-14 h-14 rounded-xl object-cover" />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm line-clamp-1">{c.name}</p>
                          <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5"><MapPin size={10} />{c.city} - {c.area}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {primaryClinic && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(primaryClinic.address)}`}
                  target="_blank" rel="noreferrer"
                  className="flex items-center justify-center gap-2 bg-card border border-border rounded-2xl p-3 text-sm font-bold"
                >
                  <MapPin size={16} className="text-primary" /> الموقع على الخريطة
                </a>
              )}
            </div>
          )}

          {tab === "gallery" && (
            <div className="grid grid-cols-2 gap-2">
              {(primaryClinic?.gallery ?? []).length === 0 ? (
                <div className="col-span-2 text-center py-10 text-muted-foreground">
                  <ImageIcon size={32} className="mx-auto opacity-40" />
                  <p className="text-sm mt-2">لا توجد صور</p>
                </div>
              ) : (
                (primaryClinic?.gallery ?? []).map((g, i) => (
                  <motion.img key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                    src={g} alt="" className="w-full aspect-square rounded-2xl object-cover shadow-card" />
                ))
              )}
            </div>
          )}

          {tab === "reviews" && (
            <div className="bg-card rounded-3xl p-6 shadow-card text-center text-muted-foreground text-sm">
              التقييمات ستظهر هنا قريباً
            </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-0 inset-x-0 p-4 glass border-t border-border/40 z-40">
        <button
          onClick={() => primaryClinic && navigate({ to: "/book/$providerId", params: { providerId: primaryClinic.id } })}
          disabled={!primaryClinic}
          className="w-full gradient-primary text-primary-foreground font-black py-4 rounded-2xl shadow-glow flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Calendar size={18} /> احجز موعد الآن
        </button>
      </div>

      <BottomNav />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-muted/60 rounded-xl py-2 text-center">
      <p className="text-sm font-black text-foreground">{value}</p>
      <p className="text-[10px] text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}
