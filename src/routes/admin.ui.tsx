import { createFileRoute, Link } from "@tanstack/react-router";
import AdminShell from "@/components/admin/AdminShell";
import { Paintbrush, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/admin/ui")({
  head: () => ({ meta: [{ title: "واجهة التطبيق | الإدارة" }] }),
  component: () => (
    <AdminShell title="مركز إدارة واجهة التطبيق" subtitle="تصميم الصفحة الرئيسية، ترتيب الأقسام، الألوان، الأيقونات" icon={Paintbrush}>
      <div className="grid sm:grid-cols-2 gap-3">
        <Link to="/admin/home" className="rounded-3xl border bg-card p-5 hover:border-primary/40">
          <h3 className="font-extrabold">تصميم وترتيب الصفحة الرئيسية</h3>
          <p className="text-xs text-muted-foreground mt-1">إخفاء، إظهار، إعادة ترتيب، جدولة الأقسام</p>
          <span className="text-primary text-sm font-bold mt-2 inline-flex items-center gap-1">فتح <ArrowLeft size={14} /></span>
        </Link>
        <Link to="/admin/settings" className="rounded-3xl border bg-card p-5 hover:border-primary/40">
          <h3 className="font-extrabold">الهوية البصرية</h3>
          <p className="text-xs text-muted-foreground mt-1">الشعار، الاسم، اللون الأساسي، النصوص</p>
          <span className="text-primary text-sm font-bold mt-2 inline-flex items-center gap-1">فتح <ArrowLeft size={14} /></span>
        </Link>
      </div>
    </AdminShell>
  ),
});
