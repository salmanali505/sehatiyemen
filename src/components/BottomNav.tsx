import { Home, Search, Calendar, Bell, User } from "lucide-react";
import { motion } from "framer-motion";
import { Link, useLocation } from "@tanstack/react-router";

const items = [
  { id: "home", label: "الرئيسية", icon: Home, to: "/" },
  { id: "search", label: "البحث", icon: Search, to: "/search" },
  { id: "bookings", label: "الحجوزات", icon: Calendar, to: "/bookings" },
  { id: "notifications", label: "الإشعارات", icon: Bell, to: "/notifications" },
  { id: "profile", label: "حسابي", icon: User, to: "/profile" },
] as const;

export function BottomNav() {
  const loc = useLocation();
  const active = items.find((i) => i.to === loc.pathname)?.id ?? "home";

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 pt-2 pointer-events-none">
      <nav className="pointer-events-auto mx-auto max-w-md glass rounded-3xl shadow-float px-2 py-2 flex items-center justify-between">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <Link
              key={item.id}
              to={item.to}
              className="relative flex-1 flex flex-col items-center gap-1 py-2 px-1 rounded-2xl"
            >
              {isActive && (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute inset-0 gradient-primary rounded-2xl shadow-glow"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <Icon
                className={`relative z-10 transition-all ${isActive ? "text-primary-foreground" : "text-muted-foreground"}`}
                size={isActive ? 22 : 20}
                strokeWidth={isActive ? 2.4 : 2}
              />
              <span className={`relative z-10 text-[10px] font-bold ${isActive ? "text-primary-foreground" : "text-muted-foreground"}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
