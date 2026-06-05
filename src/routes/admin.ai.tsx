import { createFileRoute, Link } from "@tanstack/react-router";
import AdminShell from "@/components/admin/AdminShell";
import { BrainCircuit } from "lucide-react";

export const Route = createFileRoute("/admin/ai")({
  head: () => ({ meta: [{ title: "الذكاء الاصطناعي | الإدارة" }] }),
  component: () => (
    <AdminShell title="مركز الذكاء الاصطناعي" subtitle="المساعد، الردود، الاقتراحات، النماذج" icon={BrainCircuit}>
      <div className="rounded-3xl border bg-card p-5 space-y-3">
        <p className="text-sm">المساعد الذكي مفعّل ومتاح للمستخدمين عبر صفحة <Link to="/assistant" className="text-primary font-bold">المساعد</Link>.</p>
        <p className="text-xs text-muted-foreground">النموذج الافتراضي: <code className="bg-muted rounded px-1.5 py-0.5">google/gemini-2.5-flash</code> عبر بوابة Lovable AI.</p>
        <p className="text-xs text-muted-foreground">يتم تشغيل المساعد من خلال خادم آمن (server function) دون الحاجة لمفتاح API من المستخدم.</p>
      </div>
    </AdminShell>
  ),
});
