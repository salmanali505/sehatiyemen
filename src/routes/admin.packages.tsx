import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Package, Plus, Loader2, Save, Trash2, Check } from "lucide-react";
import { toast } from "sonner";
import AdminShell, { EmptyState } from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/packages")({
  head: () => ({ meta: [{ title: "إدارة الباقات | الإدارة" }] }),
  component: PackagesAdmin,
});

type Pkg = {
  id: string; code: string; name_ar: string; tier: string;
  price_monthly: number; price_yearly: number;
  max_doctors: number; max_staff: number; max_reception: number;
  notif_limit: number; ads_limit: number; offers_limit: number;
  features: string[]; active: boolean; sort_order: number;
};

function PackagesAdmin() {
  const [items, setItems] = useState<Pkg[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Pkg | null>(null);

  useEffect(() => { load(); }, []);
  async function load() {
    setLoading(true);
    const { data } = await supabase.from("packages").select("*").order("sort_order");
    setItems((data ?? []) as Pkg[]);
    setLoading(false);
  }

  async function save() {
    if (!editing) return;
    const { id, ...rest } = editing;
    const { error } = await supabase.from("packages").update(rest).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("تم الحفظ");
    setEditing(null);
    load();
  }

  async function addNew() {
    const code = `custom_${Date.now()}`;
    const { error } = await supabase.from("packages").insert({ code, name_ar: "باقة جديدة", tier: "basic" });
    if (error) return toast.error(error.message);
    load();
  }

  async function del(id: string) {
    if (!confirm("حذف الباقة؟")) return;
    const { error } = await supabase.from("packages").delete().eq("id", id);
    if (error) return toast.error(error.message);
    load();
  }

  return (
    <AdminShell title="مركز إدارة الباقات" subtitle="أساسية، احترافية، VIP - الأسعار والمميزات والحدود" icon={Package}
      actions={<button onClick={addNew} className="rounded-2xl gradient-primary text-primary-foreground px-3 py-2 text-xs font-bold shadow-glow flex items-center gap-1"><Plus size={14} /> إضافة</button>}>
      {loading ? <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>
        : items.length === 0 ? <EmptyState icon={Package} title="لا توجد باقات بعد" />
        : <div className="grid md:grid-cols-3 gap-4">
            {items.map((p) => (
              <div key={p.id} className={`rounded-3xl border-2 bg-card p-5 shadow-sm ${p.tier === "vip" ? "border-warning shadow-glow" : p.tier === "pro" ? "border-primary" : "border-muted"}`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-extrabold text-lg">{p.name_ar}</h3>
                    <p className="text-[10px] text-muted-foreground">{p.code} • {p.tier}</p>
                  </div>
                  {p.active && <span className="text-[10px] font-bold bg-success/10 text-success rounded-full px-2 py-0.5">نشط</span>}
                </div>
                <div className="mb-3">
                  <p className="text-3xl font-extrabold">${p.price_monthly}<span className="text-xs text-muted-foreground">/شهري</span></p>
                  <p className="text-xs text-muted-foreground">${p.price_yearly} سنوي</p>
                </div>
                <ul className="space-y-1.5 text-xs mb-3 min-h-[120px]">
                  {(p.features || []).map((f, i) => <li key={i} className="flex items-center gap-1.5"><Check size={12} className="text-success" />{f}</li>)}
                </ul>
                <div className="grid grid-cols-3 gap-2 text-[10px] mb-3">
                  <Spec label="أطباء" val={p.max_doctors} />
                  <Spec label="موظفون" val={p.max_staff} />
                  <Spec label="استقبال" val={p.max_reception} />
                  <Spec label="إشعارات" val={p.notif_limit} />
                  <Spec label="إعلانات" val={p.ads_limit} />
                  <Spec label="عروض" val={p.offers_limit} />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setEditing(p)} className="flex-1 rounded-2xl bg-primary text-primary-foreground text-xs font-bold py-2">تعديل</button>
                  <button onClick={() => del(p.id)} className="rounded-2xl bg-destructive/10 text-destructive px-3 py-2"><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>}

      {editing && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur p-4 flex items-center justify-center" onClick={() => setEditing(null)}>
          <div className="bg-card rounded-3xl border max-w-lg w-full max-h-[90vh] overflow-auto p-5 space-y-3" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-extrabold text-lg">تعديل: {editing.name_ar}</h3>
            <Inp label="الاسم العربي" v={editing.name_ar} on={(v) => setEditing({ ...editing, name_ar: v })} />
            <div className="grid grid-cols-2 gap-3">
              <Inp label="سعر شهري" v={editing.price_monthly} type="number" on={(v) => setEditing({ ...editing, price_monthly: +v })} />
              <Inp label="سعر سنوي" v={editing.price_yearly} type="number" on={(v) => setEditing({ ...editing, price_yearly: +v })} />
              <Inp label="حد الأطباء" v={editing.max_doctors} type="number" on={(v) => setEditing({ ...editing, max_doctors: +v })} />
              <Inp label="حد الموظفين" v={editing.max_staff} type="number" on={(v) => setEditing({ ...editing, max_staff: +v })} />
              <Inp label="حد الاستقبال" v={editing.max_reception} type="number" on={(v) => setEditing({ ...editing, max_reception: +v })} />
              <Inp label="حد الإشعارات" v={editing.notif_limit} type="number" on={(v) => setEditing({ ...editing, notif_limit: +v })} />
              <Inp label="حد الإعلانات" v={editing.ads_limit} type="number" on={(v) => setEditing({ ...editing, ads_limit: +v })} />
              <Inp label="حد العروض" v={editing.offers_limit} type="number" on={(v) => setEditing({ ...editing, offers_limit: +v })} />
            </div>
            <label className="block">
              <span className="text-xs font-bold text-muted-foreground">المميزات (سطر لكل ميزة)</span>
              <textarea rows={5} value={(editing.features || []).join("\n")}
                onChange={(e) => setEditing({ ...editing, features: e.target.value.split("\n").filter(Boolean) })}
                className="w-full rounded-2xl border border-input bg-background px-3 py-2 text-sm mt-1" />
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={editing.active} onChange={(e) => setEditing({ ...editing, active: e.target.checked })} />
              <span>نشط</span>
            </label>
            <div className="flex gap-2 pt-2">
              <button onClick={save} className="flex-1 rounded-2xl gradient-primary text-primary-foreground py-2.5 font-bold shadow-glow flex items-center justify-center gap-2"><Save size={14} /> حفظ</button>
              <button onClick={() => setEditing(null)} className="rounded-2xl bg-muted px-4">إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}

function Spec({ label, val }: { label: string; val: number }) {
  return <div className="bg-muted/50 rounded-xl p-1.5 text-center"><p className="font-extrabold text-sm">{val}</p><p className="text-muted-foreground">{label}</p></div>;
}
function Inp({ label, v, on, type = "text" }: { label: string; v: any; on: (v: string) => void; type?: string }) {
  return (
    <label className="block">
      <span className="text-xs font-bold text-muted-foreground">{label}</span>
      <input type={type} value={v} onChange={(e) => on(e.target.value)}
        className="w-full rounded-2xl border border-input bg-background px-3 py-2 text-sm mt-1" />
    </label>
  );
}
