import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MessageSquare, Loader2 } from "lucide-react";
import AdminShell, { EmptyState } from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/support")({
  head: () => ({ meta: [{ title: "الدعم الفني | الإدارة" }] }),
  component: SupportAdmin,
});

function SupportAdmin() {
  const [items, setItems] = useState<any[]>([]);
  const [tab, setTab] = useState("open");
  const [kind, setKind] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, [tab, kind]);
  async function load() {
    setLoading(true);
    let qb = supabase.from("support_tickets").select("*").order("created_at", { ascending: false });
    if (tab !== "all") qb = qb.eq("status", tab);
    if (kind !== "all") qb = qb.eq("kind", kind);
    const { data } = await qb;
    setItems(data ?? []);
    setLoading(false);
  }
  async function setStatus(id: string, s: string) {
    await supabase.from("support_tickets").update({ status: s }).eq("id", id);
    toast.success("تم"); load();
  }

  return (
    <AdminShell title="الرسائل والدعم الفني" subtitle="شكاوى، اقتراحات، تذاكر، محادثات" icon={MessageSquare}>
      <div className="flex flex-wrap gap-2">
        {["all", "open", "in_progress", "resolved", "closed"].map((s) => (
          <button key={s} onClick={() => setTab(s)} className={`rounded-2xl px-3 py-1.5 text-xs font-bold ${tab === s ? "gradient-primary text-primary-foreground shadow-glow" : "bg-muted text-muted-foreground"}`}>
            {s === "all" ? "الكل" : s === "open" ? "مفتوحة" : s === "in_progress" ? "قيد العمل" : s === "resolved" ? "تم الحل" : "مغلقة"}
          </button>
        ))}
        <span className="mx-2 text-muted-foreground">|</span>
        {["all", "complaint", "suggestion", "ticket", "chat"].map((k) => (
          <button key={k} onClick={() => setKind(k)} className={`rounded-2xl px-3 py-1.5 text-xs font-bold ${kind === k ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"}`}>
            {k === "all" ? "كل الأنواع" : k === "complaint" ? "شكوى" : k === "suggestion" ? "اقتراح" : k === "ticket" ? "تذكرة" : "محادثة"}
          </button>
        ))}
      </div>

      {loading ? <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>
        : items.length === 0 ? <EmptyState icon={MessageSquare} title="لا توجد رسائل" />
        : <div className="rounded-3xl border bg-card overflow-hidden divide-y">
            {items.map((t) => (
              <div key={t.id} className="p-3 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-[10px] font-bold rounded-full px-2 py-0.5 ${t.priority === "high" ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"}`}>{t.priority}</span>
                  <p className="font-bold text-sm flex-1">{t.subject}</p>
                  <select value={t.status} onChange={(e) => setStatus(t.id, e.target.value)}
                    className="rounded-xl border border-input bg-background px-2 py-1 text-xs">
                    <option value="open">مفتوحة</option>
                    <option value="in_progress">قيد العمل</option>
                    <option value="resolved">تم الحل</option>
                    <option value="closed">مغلقة</option>
                  </select>
                </div>
                {t.message && <p className="text-xs text-muted-foreground">{t.message}</p>}
                <p className="text-[10px] text-muted-foreground">{new Date(t.created_at).toLocaleString("ar")}</p>
              </div>
            ))}
          </div>}
    </AdminShell>
  );
}
