import { Home, Search, Sparkles, Calendar, User } from "lucide-react";
import { motion } from "framer-motion";
import { Link, useLocation } from "@tanstack/react-router";

// RTL: first item renders on the right
const items = [
  { id: "home", label: "الرئيسية", icon: Home, to: "/" },
  { id: "search", label: "البحث", icon: Search, to: "/search" },
  { id: "bookings", label: "الحجوزات", icon: Calendar, to: "/bookings" },
  { id: "assistant", label: "المساعد", icon: Sparkles, to: "/assistant" },
  { id: "profile", label: "حسابي", icon: User, to: "/profile" },
] as const;

const VB_W = 500;
const VB_H = 80;
const SLOT = VB_W / 5; // 100

function barPath() {
  // Flat bar — circle sits centered inside without a raised notch
  const top = 6;
  return `M0 ${top} L${VB_W} ${top} L${VB_W} ${VB_H} L0 ${VB_H} Z`;
}



export function BottomNav() {
  const loc = useLocation();
  const activeIdx = Math.max(
    0,
    items.findIndex((i) => i.to === loc.pathname),
  );
  // In RTL, index 0 is on the right → visual x from left = last - idx
  const visualIdx = items.length - 1 - activeIdx;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="relative w-full pb-[env(safe-area-inset-bottom)]">
        {/* Flat curved bar */}
        <svg
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          preserveAspectRatio="none"
          className="block w-full h-[78px] drop-shadow-[0_-8px_20px_rgba(10,25,80,0.35)]"
          aria-hidden
        >
          <defs>
            <linearGradient id="navBrand" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="oklch(0.42 0.22 262)" />
              <stop offset="55%" stopColor="oklch(0.55 0.24 258)" />
              <stop offset="100%" stopColor="oklch(0.62 0.20 240)" />
            </linearGradient>
          </defs>
          <path fill="url(#navBrand)" d={barPath()} />
        </svg>

        {/* Circle that slides to active tab — centered inside the bar */}
        <motion.div
          className="absolute pointer-events-none"
          initial={false}
          animate={{ left: `${(visualIdx + 0.5) * 20}%` }}
          transition={{ type: "spring", stiffness: 260, damping: 26 }}
          style={{ top: 39, transform: "translate(-50%, -50%)" }}
        >
          <ActiveBadge icon={items[activeIdx].icon} />
        </motion.div>

        {/* Row of tabs */}
        <nav
          dir="rtl"
          className="absolute inset-x-0 bottom-0 h-[78px] grid grid-cols-5"
        >
          {items.map((item, i) => (
            <NavBtn key={item.id} item={item} active={i === activeIdx} />
          ))}
        </nav>

      </div>
    </div>
  );
}

function ActiveBadge({ icon: Icon }: { icon: any }) {
  return (
    <motion.div
      key={Icon.displayName || Icon.name}
      initial={{ scale: 0.6, opacity: 0, rotate: -20 }}
      animate={{ scale: 1, opacity: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 320, damping: 18 }}
      className="w-12 h-12 rounded-full flex items-center justify-center"
      style={{
        background:
          "linear-gradient(135deg, oklch(0.78 0.19 145), oklch(0.66 0.22 155))",
        boxShadow:
          "0 10px 22px -8px rgba(0,200,83,0.5), inset 0 -2px 6px rgba(0,0,0,0.18)",
      }}

    >
      <Icon size={24} strokeWidth={2.6} className="text-white" />
    </motion.div>
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
      className="relative flex flex-col items-end justify-end pb-3 pt-6 select-none"
    >
      <motion.span
        whileTap={{ scale: 0.85 }}
        className="w-full flex flex-col items-center gap-1"
      >
        {/* Hide icon when active (it lives in the elevated badge) */}
        <span
          className={`transition-opacity duration-200 ${active ? "opacity-0" : "opacity-100"}`}
        >
          <Icon size={22} strokeWidth={2.2} className="text-white/80" />
        </span>
        {/* Label only shows for inactive tabs; active tab shows just the elevated icon */}
        <motion.span
          initial={false}
          animate={
            active
              ? { opacity: 0, y: 6, height: 0 }
              : { opacity: 1, y: 0, height: "auto" }
          }
          transition={{ type: "spring", stiffness: 300, damping: 24 }}
          className="text-[10px] font-bold tracking-tight text-white/85 overflow-hidden"
        >
          {item.label}
        </motion.span>
      </motion.span>
    </Link>
  );
}

