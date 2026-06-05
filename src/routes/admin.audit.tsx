import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ScrollText, Loader2 } from "lucide-react";
import AdminShell, { EmptyState } from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/audit")({
  head: () => ({ meta: [{ title: "السجلات الأمنية | الإدارة" }] }),
  component: AuditAdmin,
});

function AuditAdmin() {
  const [items, setItems] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, [filter]);
  async function load() {
    setLoading(true);
    let qb = supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(500);
    if (filter !== "all") qb = qb.eq("action", filter);
    const { data } = await qb;
    setItems(data ?? []);
    setLoading(false);
  }
  const ACTIONS = [
    { k: "all", t: "كل العمليات" },
    { k: "login", t: "تسجيل دخول" },
    { k: "logout", t: "تسجيل خروج" },
    { k: "login_failed", t: "محاولة فاشلة" },
    { k: "update", t: "تعديل" },
    { k: "delete", t: "حذف" },
    { k: "password_change", t: "تغيير كلمة مرور" },
  ];

  return (
    <AdminShell title="مركز السجلات الأمنية" subtitle="جميع العمليات الحسّاسة على المنصة" icon={ScrollText}>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {ACTIONS.map((a) => (
          <button key={a.k} onClick={() => setFilter(a.k)}
            className={`shrink-0 rounded-2xl px-3 py-1.5 text-xs font-bold ${filter === a.k ? "gradient-primary text-primary-foreground shadow-glow" : "bg-muted text-muted-foreground"}`}>
            {a.t}
          </button>
        ))}
      </div>

      {loading ? <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>
        : items.length === 0 ? <EmptyState icon={ScrollText} title="لا توجد سجلات" hint="سيتم تسجيل العمليات تلقائياً عند تفعيلها في الأنظمة الفرعية." />
        : <div className="rounded-3xl border bg-card overflow-hidden divide-y">
            {items.map((l) => (
              <div key={l.id} className="p-3 flex flex-wrap items-center gap-3 text-xs">
                <span className={`shrink-0 font-bold rounded-full px-2 py-0.5 ${l.action === "delete" || l.action === "login_failed" ? "bg-destructive/10 text-destructive" : l.action === "login" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
                  {l.action}
                </span>
                <span className="flex-1 min-w-[140px]">
                  <span className="font-bold">{l.actor_email || l.actor_id || "system"}</span>
                  {l.entity && <span className="text-muted-foreground"> • {l.entity}{l.entity_id ? `#${l.entity_id.slice(0, 6)}` : ""}</span>}
                </span>
                <span className="text-[10px] text-muted-foreground">{l.ip || "—"}</span>
                <span className="text-[10px] text-muted-foreground">{new Date(l.created_at).toLocaleString("ar")}</span>
              </div>
            ))}
          </div>}
    </AdminShell>
  );
}
