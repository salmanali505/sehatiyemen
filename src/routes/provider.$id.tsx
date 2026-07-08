import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, MapPin, Star, BadgeCheck, Phone, MessageCircle, Heart, Share2, Clock, ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";
import { getProvider, doctors as allDoctors } from "@/lib/mockData";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ReviewsSection } from "@/components/ReviewsSection";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/provider/$id")({
  head: ({ params }) => {
    const p = getProvider(params.id);
    return { meta: [{ title: `${p?.name ?? "مزود"} | صحتي` }, { name: "description", content: p?.description ?? "" }] };
  },
  component: ProviderPage,
});

function ProviderPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const p = getProvider(id);
  const [tab, setTab] = useState<"about" | "services" | "doctors" | "gallery" | "reviews">("about");
  const [favId, setFavId] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !p) return;
    supabase.from("favorites").select("id").eq("user_id", user.id).eq("kind", "provider").eq("target_id", p.id).maybeSingle()
      .then(({ data }) => setFavId(data?.id ?? null));
  }, [user, p?.id]);

  async function toggleFav() {
    if (!user) { toast.error("سجّل الدخول لإضافة المفضلة"); return; }
    if (!p) return;
    if (favId) {
      await supabase.from("favorites").delete().eq("id", favId);
      setFavId(null); toast.success("تم الحذف من المفضلة");
    } else {
      const { data } = await supabase.from("favorites").insert({
        user_id: user.id, kind: "provider", target_id: p.id, target_name: p.name,
        target_meta: { image: p.image, city: p.city, typeLabel: p.typeLabel },
      }).select("id").single();
      setFavId(data?.id ?? null); toast.success("تمت الإضافة للمفضلة");
    }
  }

  if (!p) return <div className="p-6 text-center">المزود غير موجود</div>;
  const providerDoctors = allDoctors.filter((d) => p.doctors.includes(d.id));

  return (
    <div className="min-h-screen bg-background pb-40">
      <div className="relative h-56">
        <img src={p.cover} alt={p.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
        <div className="absolute top-12 inset-x-4 flex items-center justify-between">
          <Link to="/" className="w-10 h-10 rounded-full glass flex items-center justify-center">
            <ArrowRight size={18} />
          </Link>
          <div className="flex gap-2">
            <button onClick={toggleFav}
              className="w-10 h-10 rounded-full glass flex items-center justify-center">
              <Heart size={18} className={favId ? "fill-destructive text-destructive" : ""} />
            </button>
            <button className="w-10 h-10 rounded-full glass flex items-center justify-center">
              <Share2 size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-16 relative z-10">
        <div className="bg-card rounded-3xl shadow-float p-5 border border-border/40">
          <div className="flex items-start gap-3">
            <img src={p.image} alt={p.name} className="w-20 h-20 rounded-2xl object-cover shadow-card" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1 flex-wrap">
                <h1 className="text-lg font-black text-foreground">{p.name}</h1>
                {p.verified && <BadgeCheck className="text-primary fill-primary/20" size={18} />}
              </div>
              <p className="text-xs text-primary font-bold mt-0.5">{p.typeLabel}</p>
              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Star size={12} className="text-warning fill-warning" /><b className="text-foreground">{p.rating}</b> ({p.reviews})</span>
                <span className="flex items-center gap-1"><MapPin size={12} />{p.city}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-4">
            <Stat label="متابع" value={p.followers.toLocaleString("ar-EG")} />
            <Stat label="تقييم" value={p.reviews.toString()} />
            <Stat label="الحالة" value={p.open ? "مفتوح" : "مغلق"} highlight={p.open ? "success" : "destructive"} />
          </div>

          <div className="flex gap-2 mt-4">
            <a href={`tel:${p.phone}`} className="flex-1 flex items-center justify-center gap-1 bg-muted text-foreground py-2.5 rounded-xl text-xs font-bold">
              <Phone size={14} /> اتصال
            </a>
            <a href={`https://wa.me/${p.whatsapp.replace(/\D/g, "")}`} className="flex-1 flex items-center justify-center gap-1 bg-success text-success-foreground py-2.5 rounded-xl text-xs font-bold">
              <MessageCircle size={14} /> واتساب
            </a>
          </div>
        </div>

        <div className="flex gap-1 mt-5 bg-muted rounded-2xl p-1 overflow-x-auto scrollbar-hide">
          {[["about", "نبذة"], ["services", "خدمات"], ["doctors", "أطباء"], ["gallery", "صور"], ["reviews", "تقييمات"]].map(([k, l]) => (
            <button key={k} onClick={() => setTab(k as typeof tab)}
              className={`flex-1 min-w-[70px] py-2 rounded-xl text-xs font-bold ${tab === k ? "bg-card text-primary shadow-soft" : "text-muted-foreground"}`}>
              {l}
            </button>
          ))}
        </div>

        <div className="mt-4">
          {tab === "about" && (
            <div className="bg-card rounded-3xl p-5 shadow-card space-y-3">
              <p className="text-sm text-foreground leading-relaxed">{p.description}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground"><Clock size={14} /><span>ساعات العمل: <b className="text-foreground">{p.hours}</b></span></div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground"><MapPin size={14} /><span>{p.address}</span></div>
            </div>
          )}
          {tab === "services" && (
            <div className="space-y-2">
              {p.services.length === 0 && <p className="text-center text-muted-foreground text-sm py-8">لا توجد خدمات مدرجة</p>}
              {p.services.map((s, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="bg-card rounded-2xl p-4 shadow-card flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm">{s.name}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">{s.duration}</p>
                  </div>
                  <div className="text-left">
                    <p className="text-lg font-black text-primary">{s.price.toLocaleString("ar-EG")}</p>
                    <p className="text-[10px] text-muted-foreground">ريال يمني</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
          {tab === "doctors" && (
            <div className="grid grid-cols-2 gap-3">
              {providerDoctors.length === 0 && <p className="col-span-2 text-center text-muted-foreground text-sm py-8">لا يوجد أطباء</p>}
              {providerDoctors.map((d) => (
                <div key={d.id} className="bg-card rounded-2xl p-3 shadow-card">
                  <img src={d.image} alt={d.name} className="w-full aspect-square rounded-xl object-cover" />
                  <h4 className="font-bold text-sm mt-2 line-clamp-1">{d.name}</h4>
                  <p className="text-[11px] text-primary font-semibold">{d.specialty}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star size={10} className="text-warning fill-warning" />
                    <span className="text-[10px] font-bold">{d.rating}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          {tab === "gallery" && (
            <div className="grid grid-cols-2 gap-2">
              {p.gallery.map((g, i) => (
                <img key={i} src={g} alt="" loading="lazy" className="w-full aspect-square rounded-2xl object-cover shadow-card" />
              ))}
            </div>
          )}
          {tab === "reviews" && <ReviewsSection providerId={p.id} />}
        </div>
      </div>

      <div className="fixed bottom-0 inset-x-0 p-4 glass border-t border-border/40">
        <button onClick={() => navigate({ to: "/book/$providerId", params: { providerId: p.id } })}
          className="w-full gradient-primary text-primary-foreground font-black py-4 rounded-2xl shadow-glow flex items-center justify-center gap-2">
          احجز موعد الآن <ChevronLeft size={18} />
        </button>
      </div>
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: "success" | "destructive" }) {
  return (
    <div className="bg-muted/60 rounded-xl py-2 text-center">
      <p className={`text-sm font-black ${highlight === "success" ? "text-success" : highlight === "destructive" ? "text-destructive" : "text-foreground"}`}>{value}</p>
      <p className="text-[10px] text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}
