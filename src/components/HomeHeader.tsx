import { Bell, MapPin } from "lucide-react";
import { SehatiLogo } from "./SehatiLogo";
import { motion } from "framer-motion";

export function HomeHeader() {
  return (
    <div className="px-4 pt-12 pb-4 flex items-center justify-between">
      <SehatiLogo size={42} withName />
      <div className="flex items-center gap-2">
        <button className="w-10 h-10 rounded-full glass flex items-center justify-center shadow-card">
          <MapPin size={18} className="text-primary" />
        </button>
        <button className="relative w-10 h-10 rounded-full glass flex items-center justify-center shadow-card">
          <Bell size={18} className="text-primary" />
          <motion.span
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute top-1.5 left-1.5 w-2.5 h-2.5 bg-destructive rounded-full border-2 border-background"
          />
        </button>
      </div>
    </div>
  );
}
