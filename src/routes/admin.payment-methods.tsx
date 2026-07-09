import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Wallet, Plus, Loader2, Pencil, Trash2, Eye, EyeOff, Save, XCircle } from "lucide-react";
import AdminShell, { EmptyState } from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/payment-methods")({
  head: () => ({ meta: [{ title: "طرق الدفع | الإدارة" }] }),
  component: PaymentMethodsAdmin,
});

type PM = {
  id: string;
  code: string;
  name_ar: string;
  name_en: string | null;
  type: "cash" | "bank_transfer" | "wallet" | "card" | "other";
  instructions: string | null;
  account_details: any;
  logo_url: string | null;
  requires_proof: boolean;
  enabled: boolean;
  sort_order: number;
};

const emptyForm: Partial<PM> = {
  code: "", name_ar: "", name_en: "", type: "cash",
  instructions: "", account_details: {}, logo_url: "",
  requires_proof: false, enabled: true, sort_order: 0,
};

const TYPE_LABELS: Record<PM["type"], string> = {
  cash: "نقدي", bank_transfer: "تحويل بنكي", wallet: "محفظة إلكترونية", card: "بطاقة", other: "أخرى",
};

function PaymentMethodsAdmin() {
  const [items, setItems] = useState<PM[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<PM> | null>(null);
  const [accountText, setAccountText] = useState("");

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.from("payment_methods").select("*").order("sort_order").order("created_at");
    if (error) toast.error(error.message);
    setItems((data ?? []) as PM[]);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  function startEdit(pm?: PM) {
    if (pm) {
      setEditing({ ...pm });
      setAccountText(JSON.stringify(pm.account_details ?? {}, null, 2));
    } else {
      setEditing({ ...emptyForm });
      setAccountText("{}");
    }
  }

  async function save() {
    if (!editing) return;
    if (!editing.code?.trim() || !editing.name_ar?.trim()) return toast.error("الكود والاسم العربي مطلوبان");
    let details: any = {};
    try { details = accountText.trim() ? JSON.parse(accountText) : {}; }
    catch { return toast.error("تفاصيل الحساب ليست JSON صالحاً"); }
    const payload = {
      code: editing.code!.trim(),
      name_ar: editing.name_ar!.trim(),
      name_en: editing.name_en?.trim() || null,
      type: editing.type ?? "cash",
      instructions: editing.instructions?.trim() || null,
      account_details: details,
      logo_url: editing.logo_url?.trim() || null,
      requires_proof: !!editing.requires_proof,
      enabled: editing.enabled ?? true,
      sort_order: Number(editing.sort_order) || 0,
    };
    const q = editing.id
      ? supabase.from("payment_methods").update(payload).eq("id", editing.id)
      : supabase.from("payment_methods").insert(payload);
    const { error } = await q;
    if (error) return toast.error(error.message);
    toast.success("تم الحفظ");
    setEditing(null);
    load();
  }

  async function toggle(pm: PM) {
    const { error } = await supabase.from("payment_methods").update({ enabled: !pm.enabled }).eq("id", pm.id);
    if (error) return toast.error(error.message);
    load();
  }

  async function del(pm: PM) {
    if (!confirm(`حذف "${pm.name_ar}"؟`)) return;
    const { error } = await supabase.from("payment_methods").delete().eq("id", pm.id);
    if (error) return toast.error(error.message);
    toast.success("تم الحذف");
    load();
  }

  return (
    <AdminShell
      title="طرق الدفع"
      subtitle="أضف، عدّل، فعّل أو أخفِ طرق الدفع المتاحة للمستخدمين عند الحجز"
      icon={Wallet}
      actions={
        <button
          onClick={() => startEdit()}
          className="rounded-2xl gradient-primary text-primary-foreground px-3 py-2 text-xs font-bold shadow-glow flex items-center gap-1"
        >
          <Plus size={14} /> طريقة جديدة
        </button>
      }
    >
      {loading ? (
        <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>
      ) : items.length === 0 ? (
        <EmptyState icon={Wallet} title="لا توجد طرق دفع بعد" />
      ) : (
        <div className="rounded-3xl border bg-card overflow-hidden divide-y">
          {items.map((pm) => (
            <div key={pm.id} className="p-4 flex flex-wrap items-center gap-3">
              <div className="flex-1 min-w-[180px]">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-extrabold text-sm">{pm.name_ar}</span>
                  <span className="text-[10px] rounded-full bg-muted text-muted-foreground px-2 py-0.5 font-bold">
                    {TYPE_LABELS[pm.type]}
                  </span>
                  <span className="text-[10px] rounded-full bg-primary/10 text-primary px-2 py-0.5 font-bold font-mono" dir="ltr">
                    {pm.code}
                  </span>
                  {pm.requires_proof && (
                    <span className="text-[10px] rounded-full bg-warning/15 text-warning px-2 py-0.5 font-bold">
                      يتطلب إثباتاً
                    </span>
                  )}
                </div>
                {pm.instructions && (
                  <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{pm.instructions}</p>
                )}
              </div>
              <span className={`text-[10px] font-bold rounded-full px-2 py-0.5 ${pm.enabled ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}`}>
                {pm.enabled ? "مفعّل" : "مخفي"}
              </span>
              <button onClick={() => toggle(pm)} className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center" title={pm.enabled ? "إخفاء" : "إظهار"}>
                {pm.enabled ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
              <button onClick={() => startEdit(pm)} className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center" title="تعديل">
                <Pencil size={15} />
              </button>
              <button onClick={() => del(pm)} className="w-9 h-9 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center" title="حذف">
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur p-4 flex items-center justify-center" onClick={() => setEditing(null)}>
          <div className="bg-card rounded-3xl border max-w-lg w-full p-5 space-y-3 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-lg">{editing.id ? "تعديل طريقة دفع" : "طريقة دفع جديدة"}</h3>
              <button onClick={() => setEditing(null)} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <XCircle size={16} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <label className="block text-xs">
                <span className="font-bold text-muted-foreground">الكود</span>
                <input value={editing.code ?? ""} onChange={(e) => setEditing({ ...editing, code: e.target.value })}
                  placeholder="cash / kuraimi / jaib..." dir="ltr"
                  className="mt-1 w-full rounded-2xl border border-input bg-background px-3 py-2 text-sm text-right" />
              </label>
              <label className="block text-xs">
                <span className="font-bold text-muted-foreground">النوع</span>
                <select value={editing.type ?? "cash"} onChange={(e) => setEditing({ ...editing, type: e.target.value as PM["type"] })}
                  className="mt-1 w-full rounded-2xl border border-input bg-background px-3 py-2 text-sm">
                  {(Object.keys(TYPE_LABELS) as PM["type"][]).map((k) => (
                    <option key={k} value={k}>{TYPE_LABELS[k]}</option>
                  ))}
                </select>
              </label>
            </div>

            <label className="block text-xs">
              <span className="font-bold text-muted-foreground">الاسم بالعربية</span>
              <input value={editing.name_ar ?? ""} onChange={(e) => setEditing({ ...editing, name_ar: e.target.value })}
                className="mt-1 w-full rounded-2xl border border-input bg-background px-3 py-2 text-sm" />
            </label>
            <label className="block text-xs">
              <span className="font-bold text-muted-foreground">الاسم بالإنجليزية (اختياري)</span>
              <input value={editing.name_en ?? ""} onChange={(e) => setEditing({ ...editing, name_en: e.target.value })}
                dir="ltr" className="mt-1 w-full rounded-2xl border border-input bg-background px-3 py-2 text-sm text-right" />
            </label>

            <label className="block text-xs">
              <span className="font-bold text-muted-foreground">تعليمات تظهر للمستخدم</span>
              <textarea value={editing.instructions ?? ""} onChange={(e) => setEditing({ ...editing, instructions: e.target.value })}
                rows={3} className="mt-1 w-full rounded-2xl border border-input bg-background px-3 py-2 text-sm resize-none" />
            </label>

            <label className="block text-xs">
              <span className="font-bold text-muted-foreground">تفاصيل الحساب (JSON)</span>
              <textarea value={accountText} onChange={(e) => setAccountText(e.target.value)} rows={4} dir="ltr"
                placeholder='{"bank":"...","account":"...","holder":"..."}'
                className="mt-1 w-full rounded-2xl border border-input bg-background px-3 py-2 text-xs font-mono resize-none text-right" />
            </label>

            <label className="block text-xs">
              <span className="font-bold text-muted-foreground">رابط الشعار (اختياري)</span>
              <input value={editing.logo_url ?? ""} onChange={(e) => setEditing({ ...editing, logo_url: e.target.value })}
                dir="ltr" className="mt-1 w-full rounded-2xl border border-input bg-background px-3 py-2 text-sm text-right" />
            </label>

            <div className="grid grid-cols-3 gap-2">
              <label className="flex items-center gap-2 text-xs bg-muted rounded-2xl px-3 py-2 cursor-pointer">
                <input type="checkbox" checked={!!editing.requires_proof} onChange={(e) => setEditing({ ...editing, requires_proof: e.target.checked })} />
                <span className="font-bold">يتطلب إثباتاً</span>
              </label>
              <label className="flex items-center gap-2 text-xs bg-muted rounded-2xl px-3 py-2 cursor-pointer">
                <input type="checkbox" checked={editing.enabled ?? true} onChange={(e) => setEditing({ ...editing, enabled: e.target.checked })} />
                <span className="font-bold">مفعّل</span>
              </label>
              <label className="block text-xs">
                <span className="font-bold text-muted-foreground">الترتيب</span>
                <input type="number" value={editing.sort_order ?? 0} onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })}
                  className="mt-1 w-full rounded-2xl border border-input bg-background px-3 py-2 text-sm" />
              </label>
            </div>

            <div className="flex gap-2 pt-2">
              <button onClick={save} className="flex-1 rounded-2xl gradient-primary text-primary-foreground py-2.5 font-bold shadow-glow flex items-center justify-center gap-2">
                <Save size={16} /> حفظ
              </button>
              <button onClick={() => setEditing(null)} className="rounded-2xl bg-muted px-4 font-bold">إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
