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
  compact?: boolean;
};

/**
 * Gradient hero header — enterprise dashboard style.
 * Curved bottom, brand gradient, menu + notifications + logo, welcome block.
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
  compact = false,
}: Props) {
  return (
    <div className="relative">
      <div
        className={`gradient-dash-header relative overflow-hidden px-4 rounded-b-[40px] shadow-glow
          ${compact ? "pt-10 pb-14" : "pt-12 pb-24"}`}
      >
        {/* Decorative glows */}
        <div
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 90% 0%, rgba(255,255,255,0.45), transparent 55%), radial-gradient(circle at 10% 100%, rgba(255,255,255,0.2), transparent 50%)",
          }}
        />

        {/* Top row */}
        <div className="relative flex items-center justify-between mb-5">
          <div className="flex items-center gap-1">
            {onMenu ? (
              <button
                onClick={onMenu}
                className="rounded-2xl p-2.5 text-primary-foreground/95 hover:bg-white/15 active:scale-95 transition"
                aria-label="القائمة"
              >
                <Menu size={22} />
              </button>
            ) : back ? (
              <Link
                to={back}
                className="rounded-2xl p-2.5 text-primary-foreground/95 hover:bg-white/15 active:scale-95 transition"
                aria-label="رجوع"
              >
                <ArrowRight size={20} className="rotate-180" />
              </Link>
            ) : null}
            <Link
              to="/notifications"
              className="relative rounded-2xl p-2.5 text-primary-foreground/95 hover:bg-white/15 active:scale-95 transition"
              aria-label="الإشعارات"
            >
              <Bell size={20} />
              {notifCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-black flex items-center justify-center ring-2 ring-primary">
                  {notifCount > 99 ? "99+" : notifCount}
                </span>
              )}
            </Link>
          </div>
          <SehatiLogo size={36} />
        </div>

        {/* Welcome row */}
        {!compact && (
          <div className="relative flex items-center gap-4">
            <div className="w-[72px] h-[72px] rounded-[26px] bg-white shadow-xl flex items-center justify-center overflow-hidden shrink-0 ring-4 ring-white/40">
              {avatarSrc ? (
                <img src={avatarSrc} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-black text-primary">{avatarFallback}</span>
              )}
            </div>
            <div className="flex-1 min-w-0 text-primary-foreground">
              <p className="text-xs opacity-90 mb-0.5">{greeting}</p>
              <h1 className="text-[26px] font-black truncate leading-tight">{title}</h1>
              {subtitle && (
                <p className="text-[11px] opacity-85 truncate mt-1">{subtitle}</p>
              )}
            </div>
            {right}
          </div>
        )}
        {compact && (
          <div className="relative text-primary-foreground">
            <h1 className="text-2xl font-black leading-tight">{title}</h1>
            {subtitle && <p className="text-xs opacity-85 mt-1">{subtitle}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
