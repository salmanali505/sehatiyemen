import { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Bell, Menu } from "lucide-react";
import { SehatiLogo } from "@/components/SehatiLogo";

type Props = {
  title: string;
  subtitle?: string;
  greeting?: string;
  avatarSrc?: string | null;
  avatarFallback?: string;
  onMenu?: () => void;
  notifCount?: number;
  back?: string;
  right?: ReactNode;
};

/**
 * Gradient hero for all dashboards.
 * Sehati brand identity: uses --gradient-primary (blue), preserves logo & fonts.
 */
export default function DashHero({
  title,
  subtitle,
  greeting = "مرحباً بعودتك،",
  avatarSrc,
  avatarFallback = "S",
  onMenu,
  notifCount = 0,
  back,
  right,
}: Props) {
  return (
    <div className="relative">
      {/* Gradient panel with curved bottom */}
      <div className="gradient-primary relative overflow-hidden pt-12 pb-20 px-4 rounded-b-[36px] shadow-glow">
        <div className="absolute inset-0 opacity-25 pointer-events-none"
             style={{ background: "radial-gradient(circle at 85% 0%, rgba(255,255,255,0.35), transparent 55%)" }} />

        {/* Top bar */}
        <div className="relative flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            {onMenu ? (
              <button onClick={onMenu} className="rounded-xl p-2 text-primary-foreground/90 hover:bg-white/10 transition">
                <Menu size={22} />
              </button>
            ) : back ? (
              <Link to={back} className="rounded-xl p-2 text-primary-foreground/90 hover:bg-white/10 transition">
                <ArrowRight size={20} className="rotate-180" />
              </Link>
            ) : null}
            <Link to="/notifications" className="relative rounded-xl p-2 text-primary-foreground/90 hover:bg-white/10 transition">
              <Bell size={20} />
              {notifCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-black flex items-center justify-center">
                  {notifCount > 99 ? "99+" : notifCount}
                </span>
              )}
            </Link>
          </div>
          <SehatiLogo size={36} />
        </div>

        {/* Welcome row */}
        <div className="relative flex items-center gap-4">
          <div className="w-[68px] h-[68px] rounded-3xl bg-white/95 shadow-lg flex items-center justify-center overflow-hidden shrink-0">
            {avatarSrc ? (
              <img src={avatarSrc} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-black text-primary">{avatarFallback}</span>
            )}
          </div>
          <div className="flex-1 min-w-0 text-primary-foreground">
            <p className="text-xs opacity-85">{greeting}</p>
            <h1 className="text-2xl font-black truncate leading-tight">{title}</h1>
            {subtitle && <p className="text-[11px] opacity-80 truncate mt-0.5">{subtitle}</p>}
          </div>
          {right}
        </div>
      </div>
    </div>
  );
}
