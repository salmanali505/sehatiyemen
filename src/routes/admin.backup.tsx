import { createFileRoute } from "@tanstack/react-router";
import AdminShell from "@/components/admin/AdminShell";
import { DatabaseBackup, Info } from "lucide-react";

export const Route = createFileRoute("/admin/backup")({
  head: () => ({ meta: [{ title: "النسخ الاحتياطي | الإدارة" }] }),
  component: () => (
    <AdminShell title="مركز النسخ الاحتياطي" subtitle="نسخ يدوي، تلقائي، استعادة، أرشيف" icon={DatabaseBackup}>
      <div className="rounded-3xl border bg-card p-5 space-y-3 text-sm">
        <div className="flex items-center gap-2 text-primary"><Info size={16} /><strong>إدارة احترافية</strong></div>
        <p>يتم النسخ الاحتياطي التلقائي يومياً لقاعدة البيانات وتخزين الملفات عبر بنية Lovable Cloud السحابية.</p>
        <p className="text-xs text-muted-foreground">يمكن طلب استعادة نقطة زمنية (PITR) عبر دعم Lovable Cloud من مالك المشروع.</p>
      </div>
    </AdminShell>
  ),
});
