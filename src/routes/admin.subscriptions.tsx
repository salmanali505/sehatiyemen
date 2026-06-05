import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CreditCard, Loader2, Plus } from "lucide-react";
import AdminShell, { EmptyState } from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/subscriptions")({
  head: () => ({ meta: [{ title: "الاشتراكات | الإدارة" }] }),
  component: SubsAdmin,
});

type Sub = { id: string; provider_id: string; package_id: string; status: string; cycle: string; ends_at: string | null; amount: number; auto_renew: boolean };

function SubsAdmin() {
  const [items, setItems] = useState<any[]>([]);
  const [pkgs, setPkgs] = useState<any[]>([]);
  const [provs, setProvs] = useState<any[]>([]);
  const [tab, setTab] = useState("active");
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ provider_id: "", package_id: "", cycle: "monthly" });

  useEffect(() => { load(); }, [tab]);
  async function load() {
    setLoading(true);
    const [{ data: s }, { data: p }, { data: pr }] = await Promise.all([
      supabase.from("subscriptions").select("*, packages(name_ar, price_monthly, price_yearly), providers(name)").eq("status", tab).order("created_at", { ascending: false }),
      supabase.from("packages").select("*").order("sort_order"),
      supabase.from("providers").select("id, name").order("name"),
    ]);
    setItems(s ?? []); setPkgs(p ?? []); setProvs(pr ?? []);
    setLoading(false);
  }
  async function create() {
    if (!form.provider_id || !form.package_id) return toast.error("اختر المنشأة والباقة");
    const pkg = pkgs.find((p) => p.id === form.package_id);
    const amount = form.cycle === "yearly" ? pkg.price_yearly : pkg.price_monthly;
    const ends = new Date(); ends.setMonth(ends.getMonth() + (form.cycle === "yearly" ? 12 : 1));
    const { error } = await supabase.from("subscriptions").insert({
      provider_id: form.provider_id, package_id: form.package_id,
      cycle: form.cycle, amount, ends_at: ends.toISOString(), status: "active",
    });
    if (error) return toast.error(error.message);
    await supabase.from("providers").update({ package_id: form.package_id, subscription_status: "active" }).eq("id", form.provider_id);
    toast.success("تم إنشاء الاشتراك"); load();
  }
  async function setStatus(id: string, s: string) {
    await supabase.from("subscriptions").update({ status: s }).eq("id", id);
    load();
  }

  const TABS = [{ k: "active", t: "نشطة" }, { k: "expired", t: "منتهية" }, { k: "suspended", t: "معلقة" }];

  return (
    <AdminShell title="إدارة الاشتراكات" subtitle="نشطة، منتهية، معلقة، تجديدات وفواتير" icon={CreditCard}>
      <div className="rounded-3xl border bg-card p-4 space-y-3">
        <h3 className="font-bold flex items-center gap-2"><Plus size={16} /> اشتراك جديد</h3>
        <div className="grid sm:grid-cols-4 gap-2">
          <select value={form.provider_id} onChange={(e) => setForm({ ...form, provider_id: e.target.value })}
            className="rounded-2xl border border-input bg-background px-3 py-2 text-sm">
            <option value="">المنشأة</option>
            {provs.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <select value={form.package_id} onChange={(e) => setForm({ ...form, package_id: e.target.value })}
            className="rounded-2xl border border-input bg-background px-3 py-2 text-sm">
            <option value="">الباقة</option>
            {pkgs.map((p) => <option key={p.id} value={p.id}>{p.name_ar}</option>)}
          </select>
          <select value={form.cycle} onChange={(e) => setForm({ ...form, cycle: e.target.value })}
            className="rounded-2xl border border-input bg-background px-3 py-2 text-sm">
            <option value="monthly">شهري</option>
            <option value="yearly">سنوي</option>
          </select>
          <button onClick={create} className="rounded-2xl gradient-primary text-primary-foreground font-bold text-sm shadow-glow">تفعيل</button>
        </div>
      </div>

      <div className="flex gap-2">
        {TABS.map((t) => (
          <button key={t.k} onClick={() => setTab(t.k)}
            className={`rounded-2xl px-4 py-2 text-xs font-bold ${tab === t.k ? "gradient-primary text-primary-foreground shadow-glow" : "bg-muted text-muted-foreground"}`}>
            {t.t}
          </button>
        ))}
      </div>

      {loading ? <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>
        : items.length === 0 ? <EmptyState icon={CreditCard} title="لا توجد اشتراكات" />
        : <div className="rounded-3xl border bg-card overflow-hidden divide-y">
            {items.map((s) => (
              <div key={s.id} className="p-3 flex flex-wrap items-center gap-3">
                <div className="flex-1 min-w-[200px]">
                  <p className="font-bold text-sm">{s.providers?.name || "—"}</p>
                  <p className="text-[10px] text-muted-foreground">{s.packages?.name_ar} • {s.cycle === "yearly" ? "سنوي" : "شهري"} • ${s.amount}</p>
                </div>
                <p className="text-[10px] text-muted-foreground">ينتهي: {s.ends_at ? new Date(s.ends_at).toLocaleDateString("ar") : "—"}</p>
                <select value={s.status} onChange={(e) => setStatus(s.id, e.target.value)}
                  className="rounded-xl border border-input bg-background px-2 py-1.5 text-xs">
                  <option value="active">نشط</option>
                  <option value="suspended">معلق</option>
                  <option value="expired">منتهي</option>
                  <option value="cancelled">ملغي</option>
                </select>
              </div>
            ))}
          </div>}
    </AdminShell>
  );
}
