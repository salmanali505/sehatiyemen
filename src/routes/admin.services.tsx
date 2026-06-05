import { createFileRoute, Link } from "@tanstack/react-router";
import AdminShell from "@/components/admin/AdminShell";
import { Briefcase } from "lucide-react";

export const Route = createFileRoute("/admin/services")({
  head: () => ({ meta: [{ title: "الخدمات الطبية | الإدارة" }] }),
  component: () => (
    <AdminShell title="مركز الخدمات الطبية" subtitle="خدمات لكل نوع منشأة" icon={Briefcase}>
      <div className="rounded-3xl border bg-card p-8 text-center">
        <p className="text-sm text-muted-foreground mb-4">تُدار الخدمات الطبية كنوع <strong>service</strong> داخل مركز التخصصات.</p>
        <Link to="/admin/specialties" className="inline-block rounded-2xl gradient-primary text-primary-foreground px-5 py-2.5 text-sm font-bold shadow-glow">فتح مركز التخصصات</Link>
      </div>
    </AdminShell>
  ),
});
