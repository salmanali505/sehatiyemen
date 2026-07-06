import { Home, Search, Sparkles, Calendar, User } from "lucide-react";
import { motion } from "framer-motion";
import { Link, useLocation } from "@tanstack/react-router";

// Order renders right-to-left in RTL. Center slot (index 2) is the elevated home button.
const items = [
  { id: "search", label: "البحث", icon: Search, to: "/search" },
  { id: "bookings", label: "الحجوزات", icon: Calendar, to: "/bookings" },
  { id: "home", label: "الرئيسية", icon: Home, to: "/" }, // center
  { id: "assistant", label: "المساعد", icon: Sparkles, to: "/assistant" },
  { id: "profile", label: "حسابي", icon: User, to: "/profile" },
] as const;

export function BottomNav() {
  const loc = useLocation();
  const activeId = items.find((i) => i.to === loc.pathname)?.id ?? "home";
  const center = items[2];
  const sides = [items[0], items[1], items[3], items[4]];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {/* Full-width brand bar */}
      <div
        className="relative w-full pt-3 pb-[max(env(safe-area-inset-bottom),14px)] shadow-[0_-10px_30px_-8px_rgba(10,25,80,0.35)]"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.42 0.22 262) 0%, oklch(0.55 0.24 258) 55%, oklch(0.62 0.20 240) 100%)",
        }}
      >
        {/* subtle top highlight */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/20" />
        {/* Elevated center home */}
        <Link
          to={center.to}
          aria-label={center.label}
          className="absolute left-1/2 -translate-x-1/2 -top-7 w-16 h-16 rounded-full flex items-center justify-center ring-4 ring-background active:scale-95 transition-transform"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.78 0.19 145), oklch(0.68 0.22 155))",
            boxShadow:
              "0 12px 28px -8px rgba(0,200,83,0.55), inset 0 -3px 8px rgba(0,0,0,0.15)",
          }}
        >
          {activeId === center.id && (
            <motion.span
              layoutId="home-ring"
              className="absolute inset-0 rounded-full ring-2 ring-white/70"
              transition={{ type: "spring", stiffness: 300, damping: 22 }}
            />
          )}
          <Home size={26} strokeWidth={2.6} className="text-white relative z-10" />
        </Link>

        {/* Nav row */}
        <nav dir="rtl" className="relative grid grid-cols-5 items-center px-2">
          {sides.slice(0, 2).map((item) => (
            <NavBtn key={item.id} item={item} active={activeId === item.id} />
          ))}
          <div aria-hidden />
          {sides.slice(2, 4).map((item) => (
            <NavBtn key={item.id} item={item} active={activeId === item.id} />
          ))}
        </nav>
      </div>
    </div>
  );
}

function NavBtn({
  item,
  active,
}: {
  item: { id: string; label: string; icon: any; to: string };
  active: boolean;
}) {
  const Icon = item.icon;
  return (
    <Link
      to={item.to}
      className="relative flex flex-col items-center justify-center gap-1 py-1.5 select-none"
    >
      {active && (
        <motion.span
          layoutId="nav-active-pill"
          className="absolute inset-x-2 top-0 h-full rounded-2xl bg-white/15 backdrop-blur-sm"
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        />
      )}
      <motion.span
        whileTap={{ scale: 0.82 }}
        animate={active ? { y: -2, scale: 1.05 } : { y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        className="relative z-10 flex flex-col items-center gap-0.5"
      >
        <Icon
          size={22}
          strokeWidth={active ? 2.7 : 2.1}
          className={
            active
              ? "text-white drop-shadow-[0_2px_6px_rgba(255,255,255,0.45)]"
              : "text-white/70"
          }
        />
        <span
          className={`text-[10px] font-bold tracking-tight ${
            active ? "text-white" : "text-white/70"
          }`}
        >
          {item.label}
        </span>
        {active && (
          <motion.span
            layoutId="nav-active-dot"
            className="absolute -bottom-1 w-1 h-1 rounded-full bg-white"
          />
        )}
      </motion.span>
    </Link>
  );
}
