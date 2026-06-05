import { createFileRoute } from "@tanstack/react-router";
import AdminShell, { EmptyState } from "@/components/admin/AdminShell";
import { UserCog } from "lucide-react";

export const Route = createFileRoute("/admin/doctors")({
  head: () => ({ meta: [{ title: "الأطباء | الإدارة" }] }),
  component: () => (
    <AdminShell title="مركز إدارة الأطباء" subtitle="أطباء، مميزون، موثقون، جداول، تقييمات" icon={UserCog}>
      <EmptyState icon={UserCog} title="قيد التطوير" hint="سيُربط هذا المركز بسجل أطباء كل منشأة. يمكنك إدارة الأطباء حالياً من داخل كل منشأة." />
    </AdminShell>
  ),
});
