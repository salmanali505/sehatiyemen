import { Home, Search, Calendar, Bell, User } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

const items = [
  { id: "home", label: "الرئيسية", icon: Home },
  { id: "search", label: "البحث", icon: Search },
  { id: "bookings", label: "الحجوزات", icon: Calendar },
  { id: "notifications", label: "الإشعارات", icon: Bell },
  { id: "profile", label: "حسابي", icon: User },
];

export function BottomNav() {
  const [active, setActive] = useState("home");

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 pt-2 pointer-events-none">
      <nav className="pointer-events-auto mx-auto max-w-md glass rounded-3xl shadow-float px-2 py-2 flex items-center justify-between">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActive(item.id)}
              className="relative flex-1 flex flex-col items-center gap-1 py-2 px-1 rounded-2xl transition-colors"
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
            </button>
          );
        })}
      </nav>
    </div>
  );
}
