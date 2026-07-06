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
    <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
      <div className="relative mx-auto max-w-md px-4 pb-4">
        {/* Curved bar via SVG mask */}
        <div className="pointer-events-auto relative">
          <svg
            viewBox="0 0 400 84"
            preserveAspectRatio="none"
            className="absolute inset-0 w-full h-[84px] drop-shadow-[0_-8px_24px_rgba(0,0,0,0.12)]"
            aria-hidden
          >
            <defs>
              <linearGradient id="navGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="hsl(var(--nav-a, 235 88% 62%))" />
                <stop offset="100%" stopColor="hsl(var(--nav-b, 258 92% 66%))" />
              </linearGradient>
            </defs>
            {/* Bar with center notch */}
            <path
              d="M20 12
                 L160 12
                 C172 12 176 40 200 40
                 C224 40 228 12 240 12
                 L380 12
                 C392 12 396 16 396 28
                 L396 72
                 C396 80 392 84 384 84
                 L16 84
                 C8 84 4 80 4 72
                 L4 28
                 C4 16 8 12 20 12 Z"
              fill="url(#navGrad)"
            />
          </svg>

          {/* Nav row */}
          <nav className="relative h-[84px] grid grid-cols-5 items-end pb-3 px-2" dir="rtl">
            {/* Right two */}
            {sides.slice(0, 2).map((item) => (
              <NavBtn key={item.id} item={item} active={activeId === item.id} />
            ))}

            {/* Center elevated button */}
            <div className="flex justify-center">
              <Link
                to={center.to}
                className="relative -translate-y-6 w-16 h-16 rounded-full flex flex-col items-center justify-center shadow-[0_10px_24px_-6px_rgba(255,140,50,0.55)] ring-4 ring-background"
                style={{
                  background:
                    "linear-gradient(135deg, hsl(28 96% 62%), hsl(20 95% 55%))",
                }}
                aria-label={center.label}
              >
                {activeId === center.id && (
                  <motion.span
                    layoutId="home-pulse"
                    className="absolute inset-0 rounded-full ring-2 ring-white/60"
                    transition={{ type: "spring", stiffness: 300, damping: 24 }}
                  />
                )}
                <Home size={26} strokeWidth={2.4} className="text-white relative z-10" />
              </Link>
            </div>

            {/* Left two */}
            {sides.slice(2, 4).map((item) => (
              <NavBtn key={item.id} item={item} active={activeId === item.id} />
            ))}
          </nav>
        </div>
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
      className="pointer-events-auto flex flex-col items-center justify-center gap-1 py-1.5 group"
    >
      <Icon
        size={active ? 24 : 22}
        strokeWidth={active ? 2.6 : 2.1}
        className={`transition-all ${
          active ? "text-white drop-shadow-[0_2px_6px_rgba(255,255,255,0.35)]" : "text-white/75 group-hover:text-white"
        }`}
      />
      <span className={`text-[10px] font-bold ${active ? "text-white" : "text-white/75"}`}>
        {item.label}
      </span>
    </Link>
  );
}
