import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { LogOut, User as UserIcon, Heart, Calendar, Users, FileText, Settings, ChevronLeft, ArrowRight, Shield, Building2, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useRoles } from "@/lib/useRoles";
import { BottomNav } from "@/components/BottomNav";
import { SehatiLogo } from "@/components/SehatiLogo";
import { toast } from "sonner";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "حسابي | صحتي" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, loading, signOut } = useAuth();
  const { isAdmin, isProvider } = useRoles();
  const navigate = useNavigate();
  useEffect(() => { if (!loading && !user) navigate({ to: "/auth" }); }, [user, loading, navigate]);

  const items = [
    { icon: Settings, label: "تعديل الملف الشخصي والتوثيق", to: "/profile/edit" as const, accent: true },
    { icon: Sparkles, label: "المساعد الصحي الذكي", to: "/assistant" as const },
    { icon: Calendar, label: "حجوزاتي", to: "/bookings" as const },
    { icon: Heart, label: "المفضلة", to: "/favorites" as const },
    { icon: Users, label: "أفراد العائلة", to: "/family" as const },
    { icon: FileText, label: "السجل الصحي", to: "/records" as const },
  ];

  return (
    <div className="min-h-screen bg-background pb-36">
      <div className="gradient-hero pt-12 pb-20 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-60 h-60 bg-accent/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-primary-glow/30 rounded-full blur-3xl" />
        <div className="relative flex items-center justify-between mb-6">
          <Link to="/" className="w-10 h-10 rounded-full glass flex items-center justify-center text-white"><ArrowRight size={18} /></Link>
          <SehatiLogo size={32} />
        </div>
        <div className="relative flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur flex items-center justify-center border-2 border-white/40">
            <UserIcon className="text-white" size={36} />
          </div>
          <div className="flex-1 text-white">
            <h2 className="text-xl font-black">{user?.user_metadata?.full_name || "مستخدم صحتي"}</h2>
            <p className="text-sm text-white/80 mt-0.5">{user?.email}</p>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-12 relative z-10 space-y-2">
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <Link key={it.label} to={it.to}
              className={`bg-card rounded-2xl p-4 shadow-card flex items-center gap-3 border ${it.accent ? "border-primary/40 ring-1 ring-primary/20" : "border-border/40"}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${it.accent ? "gradient-primary text-primary-foreground shadow-glow" : "bg-primary/10 text-primary"}`}><Icon size={18} /></div>
              <span className="flex-1 font-bold text-sm">{it.label}</span>
              <ChevronLeft className="text-muted-foreground" size={18} />
            </Link>
          );
        })}

        {isProvider && (
          <Link to="/dashboard" className="bg-card rounded-2xl p-4 shadow-card flex items-center gap-3 border border-accent/40">
            <div className="w-10 h-10 rounded-xl bg-accent/15 text-accent flex items-center justify-center"><Building2 size={18} /></div>
            <span className="flex-1 font-bold text-sm">لوحة مزوّد الخدمة</span>
            <ChevronLeft className="text-muted-foreground" size={18} />
          </Link>
        )}
        {isAdmin && (
          <Link to="/admin" className="bg-card rounded-2xl p-4 shadow-card flex items-center gap-3 border border-primary/40">
            <div className="w-10 h-10 rounded-xl gradient-primary text-primary-foreground flex items-center justify-center shadow-glow"><Shield size={18} /></div>
            <span className="flex-1 font-bold text-sm">لوحة المشرف العام</span>
            <ChevronLeft className="text-muted-foreground" size={18} />
          </Link>
        )}

        <button onClick={async () => { await signOut(); toast.success("تم تسجيل الخروج"); navigate({ to: "/" }); }}
          className="w-full mt-4 bg-destructive/10 text-destructive rounded-2xl p-4 flex items-center justify-center gap-2 font-bold text-sm">
          <LogOut size={18} /> تسجيل الخروج
        </button>
      </div>
      <BottomNav />
    </div>
  );
}
