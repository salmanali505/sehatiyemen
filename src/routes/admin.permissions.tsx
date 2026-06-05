import { createFileRoute, Link } from "@tanstack/react-router";
import AdminShell from "@/components/admin/AdminShell";
import { ShieldAlert, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/admin/permissions")({
  head: () => ({ meta: [{ title: "الصلاحيات | الإدارة" }] }),
  component: () => (
    <AdminShell title="مركز الصلاحيات" subtitle="إدارة أدوار وصلاحيات كل مستخدم" icon={ShieldAlert}>
      <div className="rounded-3xl border bg-card p-5 space-y-3">
        <p className="text-sm text-muted-foreground">يعتمد النظام على ثلاثة أدوار رئيسية:</p>
        <ul className="space-y-2 text-sm">
          <li className="flex items-center gap-2"><span className="text-[10px] font-bold rounded-full bg-destructive/10 text-destructive px-2 py-0.5">admin</span> صلاحيات كاملة على المنصة</li>
          <li className="flex items-center gap-2"><span className="text-[10px] font-bold rounded-full bg-accent/10 text-accent px-2 py-0.5">provider</span> إدارة منشآته فقط</li>
          <li className="flex items-center gap-2"><span className="text-[10px] font-bold rounded-full bg-primary/10 text-primary px-2 py-0.5">patient</span> الحساب الافتراضي للمرضى</li>
          <li className="flex items-center gap-2"><span className="text-[10px] font-bold rounded-full bg-warning/10 text-warning px-2 py-0.5">reception</span> حسابات استقبال مرتبطة بمنشأة</li>
        </ul>
        <Link to="/admin/users" className="inline-flex items-center gap-1 rounded-2xl gradient-primary text-primary-foreground px-4 py-2 text-sm font-bold shadow-glow"><ArrowLeft size={14} /> إدارة صلاحيات المستخدمين</Link>
      </div>
      <div className="rounded-3xl border bg-card p-5">
        <h3 className="font-extrabold text-sm mb-2">صلاحيات الباقات</h3>
        <p className="text-xs text-muted-foreground">تُدار حدود وصلاحيات كل باقة (أطباء، موظفون، إشعارات، إعلانات، عروض) من <Link to="/admin/packages" className="text-primary font-bold">مركز الباقات</Link>.</p>
      </div>
    </AdminShell>
  ),
});
