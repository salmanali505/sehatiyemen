import { createFileRoute, Outlet, useNavigate, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { Loader2, Shield } from "lucide-react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import AdminTopBar from "@/components/admin/AdminTopBar";
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-background">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 text-center bg-gradient-to-br from-background via-destructive/5 to-background" dir="rtl">
        <div>
          <div className="w-20 h-20 rounded-3xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <Shield className="text-destructive" size={40} />
          </div>
          <h1 className="font-extrabold text-2xl">صلاحية غير متوفرة</h1>
          <p className="text-sm text-muted-foreground mt-1">لوحة تحكم المشرف تتطلب صلاحيات إدارية.</p>
          <Link
            to="/"
            className="inline-block mt-5 rounded-2xl gradient-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-glow"
          >
            العودة للرئيسية
          </Link>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-background via-background to-primary/5" dir="rtl">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <AdminTopBar />
          <main className="flex-1 min-w-0">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
