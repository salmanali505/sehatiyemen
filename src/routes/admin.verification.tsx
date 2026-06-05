import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ShieldCheck, Loader2, Check, X } from "lucide-react";
import AdminShell, { EmptyState } from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/verification")({
  head: () => ({ meta: [{ title: "التوثيق | الإدارة" }] }),
  component: VerifyAdmin,
});

function VerifyAdmin() {
  const [tab, setTab] = useState<"requests" | "verified">("requests");
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { load(); }, [tab]);
  async function load() {
    setLoading(true);
    const { data } = await supabase.from("providers").select("*").eq("verified", tab === "verified").order("created_at", { ascending: false }).limit(200);
    setItems(data ?? []);
    setLoading(false);
  }
  async function setV(id: string, v: boolean) {
    await supabase.from("providers").update({ verified: v }).eq("id", id);
    load();
  }

  return (
    <AdminShell title="مركز التوثيق" subtitle="طلبات، موثقون، رسوم، إعدادات" icon={ShieldCheck}>
      <div className="flex gap-2">
        <button onClick={() => setTab("requests")} className={`rounded-2xl px-4 py-2 text-xs font-bold ${tab === "requests" ? "gradient-primary text-primary-foreground shadow-glow" : "bg-muted text-muted-foreground"}`}>طلبات التوثيق</button>
        <button onClick={() => setTab("verified")} className={`rounded-2xl px-4 py-2 text-xs font-bold ${tab === "verified" ? "gradient-primary text-primary-foreground shadow-glow" : "bg-muted text-muted-foreground"}`}>الموثقون</button>
      </div>
      {loading ? <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>
        : items.length === 0 ? <EmptyState icon={ShieldCheck} title="لا توجد عناصر" />
        : <div className="rounded-3xl border bg-card overflow-hidden divide-y">
            {items.map((p) => (
              <div key={p.id} className="p-3 flex items-center gap-3">
                <div className="flex-1">
                  <p className="font-bold text-sm">{p.name}</p>
                  <p className="text-[10px] text-muted-foreground">{p.type} • {p.city || "—"}</p>
                </div>
                {tab === "requests"
                  ? <button onClick={() => setV(p.id, true)} className="rounded-2xl bg-success/10 text-success px-3 py-1.5 text-xs font-bold flex items-center gap-1"><Check size={12} /> توثيق</button>
                  : <button onClick={() => setV(p.id, false)} className="rounded-2xl bg-destructive/10 text-destructive px-3 py-1.5 text-xs font-bold flex items-center gap-1"><X size={12} /> سحب التوثيق</button>}
              </div>
            ))}
          </div>}
    </AdminShell>
  );
}
