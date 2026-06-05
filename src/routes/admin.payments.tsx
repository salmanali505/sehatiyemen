import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Banknote, Loader2, Plus } from "lucide-react";
import AdminShell, { EmptyState } from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/payments")({
  head: () => ({ meta: [{ title: "المدفوعات | الإدارة" }] }),
  component: PayAdmin,
});

function PayAdmin() {
  const [items, setItems] = useState<any[]>([]);
  const [tab, setTab] = useState("all");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState<any | null>(null);

  useEffect(() => { load(); }, [tab]);
  async function load() {
    setLoading(true);
    let qb = supabase.from("payments").select("*").order("created_at", { ascending: false }).limit(500);
    if (tab !== "all") qb = qb.eq("status", tab);
    const { data } = await qb;
    setItems(data ?? []);
    setLoading(false);
  }
  async function save() {
    if (!creating?.amount) return toast.error("المبلغ مطلوب");
    const { error } = await supabase.from("payments").insert(creating);
    if (error) return toast.error(error.message);
    setCreating(null); load();
  }

  return (
    <AdminShell title="إدارة المدفوعات" subtitle="فواتير، سحوبات، طرق الدفع، التحويلات" icon={Banknote}
      actions={<button onClick={() => setCreating({ kind: "subscription", status: "pending", currency: "USD" })}
        className="rounded-2xl gradient-primary text-primary-foreground px-3 py-2 text-xs font-bold shadow-glow flex items-center gap-1"><Plus size={14} /></button>}>
      <div className="flex gap-2 overflow-x-auto">
        {["all", "pending", "paid", "failed", "refunded"].map((s) => (
          <button key={s} onClick={() => setTab(s)} className={`rounded-2xl px-3 py-1.5 text-xs font-bold ${tab === s ? "gradient-primary text-primary-foreground shadow-glow" : "bg-muted text-muted-foreground"}`}>
            {s === "all" ? "الكل" : s === "pending" ? "معلقة" : s === "paid" ? "مدفوعة" : s === "failed" ? "فاشلة" : "مسترجعة"}
          </button>
        ))}
      </div>

      {loading ? <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>
        : items.length === 0 ? <EmptyState icon={Banknote} title="لا توجد مدفوعات" />
        : <div className="rounded-3xl border bg-card overflow-hidden divide-y">
            {items.map((p) => (
              <div key={p.id} className="p-3 flex flex-wrap items-center gap-3">
                <span className="text-sm font-extrabold">${p.amount} <span className="text-[10px] text-muted-foreground">{p.currency}</span></span>
                <span className="text-[10px] font-bold rounded-full bg-muted text-muted-foreground px-2 py-0.5">{p.kind}</span>
                <span className="flex-1 min-w-[100px] text-[10px] text-muted-foreground">{p.method || "—"} • {p.reference || "—"}</span>
                <span className={`text-[10px] font-bold rounded-full px-2 py-0.5 ${p.status === "paid" ? "bg-success/10 text-success" : p.status === "failed" ? "bg-destructive/10 text-destructive" : "bg-warning/10 text-warning"}`}>{p.status}</span>
                <span className="text-[10px] text-muted-foreground">{new Date(p.created_at).toLocaleDateString("ar")}</span>
              </div>
            ))}
          </div>}

      {creating && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur p-4 flex items-center justify-center" onClick={() => setCreating(null)}>
          <div className="bg-card rounded-3xl border max-w-md w-full p-5 space-y-3" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-extrabold text-lg">دفعة جديدة</h3>
            <input type="number" value={creating.amount || ""} onChange={(e) => setCreating({ ...creating, amount: +e.target.value })} placeholder="المبلغ"
              className="w-full rounded-2xl border border-input bg-background px-3 py-2 text-sm" />
            <select value={creating.kind} onChange={(e) => setCreating({ ...creating, kind: e.target.value })}
              className="w-full rounded-2xl border border-input bg-background px-3 py-2 text-sm">
              <option value="subscription">اشتراك</option>
              <option value="ad">إعلان</option>
              <option value="verification">توثيق</option>
              <option value="withdrawal">سحب</option>
            </select>
            <input value={creating.method || ""} onChange={(e) => setCreating({ ...creating, method: e.target.value })} placeholder="طريقة الدفع"
              className="w-full rounded-2xl border border-input bg-background px-3 py-2 text-sm" />
            <input value={creating.reference || ""} onChange={(e) => setCreating({ ...creating, reference: e.target.value })} placeholder="المرجع" dir="ltr"
              className="w-full rounded-2xl border border-input bg-background px-3 py-2 text-sm" />
            <div className="flex gap-2">
              <button onClick={save} className="flex-1 rounded-2xl gradient-primary text-primary-foreground py-2.5 font-bold shadow-glow">حفظ</button>
              <button onClick={() => setCreating(null)} className="rounded-2xl bg-muted px-4">إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
