import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { SplashScreen } from "@/components/SplashScreen";
import { HomeHeader } from "@/components/HomeHeader";
import { SearchBar } from "@/components/SearchBar";
import { HeroSlider } from "@/components/HeroSlider";
import { CategoryGrid } from "@/components/CategoryGrid";
import { SectionHeader } from "@/components/SectionHeader";
import { ProviderCard } from "@/components/ProviderCard";
import { DoctorCard } from "@/components/DoctorCard";
import { OffersStrip } from "@/components/OffersStrip";
import { BottomNav } from "@/components/BottomNav";
import { featuredProviders, topDoctors, providers as allProviders, doctors as allDoctors } from "@/lib/mockData";
import { useSelectedCity } from "@/lib/useCities";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "صحتي | Sehati - حجز المواعيد الطبية بسهولة" },
      { name: "description", content: "منصة صحتي - أكبر شبكة لحجز المواعيد الطبية في اليمن. عيادات، مستشفيات، مختبرات، مراكز أشعة وصيدليات." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const [showSplash, setShowSplash] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setShowSplash(false), 2500);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <AnimatePresence>{showSplash && <SplashScreen />}</AnimatePresence>

      <main className="min-h-screen bg-background pb-36 relative">
        {/* Decorative background */}
        <div className="absolute inset-x-0 top-0 h-80 gradient-health opacity-[0.08] -z-0" />
        <div className="absolute top-0 right-0 w-72 h-72 bg-primary/10 rounded-full blur-3xl -z-0" />
        <div className="absolute top-20 left-0 w-72 h-72 bg-accent/10 rounded-full blur-3xl -z-0" />

        <div className="relative z-10">
          <HomeHeader />
          <SearchBar />
          <HeroSlider />

          <div className="mt-6">
            <SectionHeader title="استكشف الخدمات" subtitle="اختر التخصص المناسب" />
            <CategoryGrid />
          </div>

          <div className="mt-7">
            <SectionHeader title="عروض وخصومات" subtitle="عروض حصرية لفترة محدودة" />
            <OffersStrip />
          </div>

          <div className="mt-6">
            <SectionHeader title="مزودون مميزون" subtitle="الأعلى تقييماً والأكثر موثوقية" />
            <div className="flex gap-3 overflow-x-auto scrollbar-hide px-4 pb-2">
              {featuredProviders.map((p) => <ProviderCard key={p.id} {...p} />)}
            </div>
          </div>

          <div className="mt-6">
            <SectionHeader title="أطباء متميزون" subtitle="نخبة من أفضل الأطباء" />
            <div className="flex gap-3 overflow-x-auto scrollbar-hide px-4 pb-2">
              {topDoctors.map((d) => <DoctorCard key={d.id} {...d} />)}
            </div>
          </div>

          <div className="mt-6">
            <SectionHeader title="مفتوح الآن" subtitle="مزودون متاحون لاستقبالك" />
            <div className="flex gap-3 overflow-x-auto scrollbar-hide px-4 pb-2">
              {featuredProviders.filter((p) => p.open).map((p) => <ProviderCard key={p.id} {...p} />)}
            </div>
          </div>

          <div className="mt-8 mx-4 p-5 rounded-3xl gradient-hero text-white shadow-glow relative overflow-hidden">
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-accent/30 rounded-full blur-3xl" />
            <div className="relative">
              <p className="text-xs font-bold text-white/80">عائلتك بأمان</p>
              <h3 className="text-xl font-black mt-1">احجز لأفراد عائلتك</h3>
              <p className="text-sm text-white/85 mt-1">أضف أفراد عائلتك واحجز لهم بضغطة واحدة</p>
              <button className="mt-3 bg-white text-primary px-5 py-2 rounded-full text-xs font-black shadow-lg">
                أضف عائلة
              </button>
            </div>
          </div>
        </div>

        <BottomNav />
      </main>
    </>
  );
}
