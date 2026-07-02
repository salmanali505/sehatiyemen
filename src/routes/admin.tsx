import { createFileRoute, Outlet, useNavigate, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { Loader2, Shield, Menu } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { useAuth } from "@/lib/auth-context";
import { useRoles } from "@/lib/useRoles";

export const Route = createFileRoute("/admin")({
  component: AdminShell,
});

function AdminShell() {
  const { user, loading: aL } = useAuth();
  const { isAdmin, loading: rL } = useRoles();
  const nav = useNavigate();

  useEffect(() => { if (!aL && !user) nav({ to: "/auth" }); }, [aL, user, nav]);

  if (aL || rL) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 text-center" dir="rtl">
        <div>
          <Shield className="mx-auto text-muted-foreground mb-3" size={40} />
          <h1 className="font-extrabold text-xl">صلاحية غير متوفرة</h1>
          <p className="text-sm text-muted-foreground mt-1">لوحة تحكم المشرف تتطلب صلاحيات إدارية.</p>
          <Link
            to="/"
            className="inline-block mt-4 rounded-2xl gradient-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-glow"
          >
            العودة للرئيسية
          </Link>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen>
      <div className="min-h-screen flex w-full bg-background" dir="rtl">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="sticky top-0 z-30 h-12 flex items-center gap-2 bg-background/70 backdrop-blur-xl px-3">
            <SidebarTrigger className="rounded-lg">
              <Menu className="h-4 w-4" />
            </SidebarTrigger>
            <div className="flex-1" />
            <span className="text-[10px] text-muted-foreground font-bold">Sehati Enterprise · Admin</span>
          </header>
          <main className="flex-1 min-w-0">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
