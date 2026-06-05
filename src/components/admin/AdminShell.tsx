import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Loader2, Shield } from "lucide-react";
import { ReactNode, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRoles } from "@/lib/useRoles";

type Props = {
  title: string;
  subtitle?: string;
  icon?: any;
  actions?: ReactNode;
  children: ReactNode;
  back?: string;
  maxWidth?: "3xl" | "5xl" | "7xl";
};

export default function AdminShell({ title, subtitle, icon: Icon = Shield, actions, children, back = "/admin", maxWidth = "5xl" }: Props) {
  const { user, loading: aL } = useAuth();
  const { isAdmin, loading: rL } = useRoles();
  const nav = useNavigate();

  useEffect(() => { if (!aL && !user) nav({ to: "/auth" }); }, [aL, user, nav]);

  if (aL || rL) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;
  if (!isAdmin) return (
    <div className="min-h-screen flex items-center justify-center px-6 text-center" dir="rtl">
      <div>
        <Shield className="mx-auto text-muted-foreground mb-3" size={40} />
        <h1 className="font-extrabold text-xl">صلاحية غير متوفرة</h1>
        <p className="text-sm text-muted-foreground mt-1">مخصص للمشرف العام فقط.</p>
        <Link to="/" className="inline-block mt-4 rounded-2xl gradient-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-glow">الرئيسية</Link>
      </div>
    </div>
  );

  const mw = maxWidth === "3xl" ? "max-w-3xl" : maxWidth === "7xl" ? "max-w-7xl" : "max-w-5xl";

  return (
    <div className="min-h-screen bg-background pb-16" dir="rtl">
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-background/85 border-b">
        <div className={`mx-auto ${mw} px-4 py-4 flex items-center gap-3`}>
          <Link to={back} className="rounded-xl p-2 hover:bg-muted"><ArrowRight size={20} /></Link>
          <div className="flex-1 min-w-0">
            <h1 className="font-extrabold text-lg truncate">{title}</h1>
            {subtitle && <p className="text-xs text-muted-foreground truncate">{subtitle}</p>}
          </div>
          {actions}
          <div className="w-10 h-10 rounded-2xl gradient-primary flex items-center justify-center shadow-glow">
            <Icon className="text-primary-foreground" size={18} />
          </div>
        </div>
      </header>
      <main className={`mx-auto ${mw} px-4 py-6 space-y-5`}>{children}</main>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, hint }: { icon: any; title: string; hint?: string }) {
  return (
    <div className="rounded-3xl border bg-card p-12 text-center text-sm text-muted-foreground">
      <Icon className="mx-auto mb-2 opacity-50" size={32} />
      <p className="font-bold text-base text-foreground">{title}</p>
      {hint && <p className="mt-1 text-xs">{hint}</p>}
    </div>
  );
}

export function SectionCard({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <section className="rounded-3xl border bg-card shadow-sm overflow-hidden">
      <div className="p-4 flex items-center gap-3 border-b">
        <h2 className="font-extrabold flex-1">{title}</h2>
        {action}
      </div>
      <div>{children}</div>
    </section>
  );
}
