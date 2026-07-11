import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Link } from "@tanstack/react-router";
import doctor from "@/assets/hero-doctor.jpg";
import hospital from "@/assets/hero-hospital.jpg";
import lab from "@/assets/hero-lab.jpg";

const slides = [
  {
    img: doctor,
    title: "أطباء متخصصون",
    subtitle: "نخبة من أفضل الأطباء بين يديك",
    cta: "احجز الآن",
    tint: "from-primary/85 via-primary/40 to-transparent",
    to: "/search" as const,
    search: { kind: "clinics" as string },
  },
  {
    img: hospital,
    title: "مستشفيات معتمدة",
    subtitle: "رعاية صحية متكاملة على أعلى مستوى",
    cta: "اكتشف المستشفيات",
    tint: "from-secondary/80 via-secondary/30 to-transparent",
    to: "/search" as const,
    search: { kind: "hospitals" as string },
  },
  {
    img: lab,
    title: "تحاليل ومختبرات",
    subtitle: "نتائج دقيقة وسريعة في وقت قياسي",
    cta: "ابحث عن مختبر",
    tint: "from-accent/80 via-accent/30 to-transparent",
    to: "/search" as const,
    search: { kind: "labs" as string },
  },
];

export function HeroSlider() {
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((p) => (p + 1) % slides.length), 4500);
    return () => clearInterval(t);
  }, []);

  const s = slides[i];

  return (
    <div className="relative mx-4 h-56 rounded-3xl overflow-hidden shadow-float">
      <AnimatePresence mode="wait">
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0"
        >
          <img src={s.img} alt={s.title} className="w-full h-full object-cover" />
          <div className={`absolute inset-0 bg-gradient-to-l ${s.tint}`} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      <Link to={s.to} search={s.search} className="absolute inset-0" aria-label={s.title} />

      <div className="relative h-full flex flex-col justify-end p-5 text-white pointer-events-none">
        <motion.div
          key={`text-${i}`}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl font-black drop-shadow-lg">{s.title}</h2>
          <p className="text-sm font-medium text-white/90 mt-1 drop-shadow">{s.subtitle}</p>
          <Link
            to={s.to}
            search={s.search}
            className="mt-3 inline-flex items-center gap-2 bg-white text-primary px-4 py-2 rounded-full text-xs font-bold shadow-lg hover:scale-105 transition-transform pointer-events-auto"
          >
            {s.cta}
            <ArrowLeft size={14} />
          </Link>
        </motion.div>

        <div className="absolute bottom-4 left-5 flex gap-1.5 pointer-events-auto">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setI(idx)}
              className={`h-1.5 rounded-full transition-all ${idx === i ? "w-6 bg-white" : "w-1.5 bg-white/50"}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
