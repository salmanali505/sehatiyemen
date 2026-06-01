import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FileText, ArrowRight, Plus, Trash2, X, Pill, FlaskConical, Scan, Stethoscope, Syringe } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { BottomNav } from "@/components/BottomNav";
import { toast } from "sonner";

export const Route = createFileRoute("/records")({
  head: () => ({ meta: [{ title: "السجل الصحي | صحتي" }] }),
  component: RecordsPage,
});

type Record = { id: string; title: string; record_type: string; description: string | null; provider_name: string | null; doctor_name: string | null; record_date: string };
const types: Record<string, { label: string; icon: any; color: string }> = {
  prescription: { label: "وصفة طبية", icon: Pill, color: "bg-emerald-500/15 text-emerald-600" },
  lab_result: { label: "نتيجة مختبر", icon: FlaskConical, color: "bg-blue-500/15 text-blue-600" },
  radiology: { label: "أشعة", icon: Scan, color: "bg-indigo-500/15 text-indigo-600" },
  diagnosis: { label: "تشخيص", icon: Stethoscope, color: "bg-amber-500/15 text-amber-600" },
  vaccination: { label: "تطعيم", icon: Syringe, color: "bg-pink-500/15 text-pink-600" },
  other: { label: "أخرى", icon: FileText, color: "bg-muted text-muted-foreground" },
};

function RecordsPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [records, setRecords] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", record_type: "prescription", description: "", provider_name: "", doctor_name: "", record_date: new Date().toISOString().slice(0, 10) });

  useEffect(() => {
    if (!loading && !user) { navigate({ to: "/auth" }); return; }
    if (user) load();
  }, [user, loading]);

  async function load() {
    const { data } = await supabase.from("health_records").select("*").order("record_date", { ascending: false });
    setRecords(data ?? []);
  }

  async function add() {
    if (!form.title.trim() || !user) return;
    const { error } = await supabase.from("health_records").insert({
      user_id: user.id, ...form, record_type: form.record_type as any,
    });
    if (error) return toast.error(error.message);
    toast.success("تمت الإضافة");
    setOpen(false); setForm({ ...form, title: "", description: "", provider_name: "", doctor_name: "" });
    load();
  }

  async function del(id: string) {
    await supabase.from("health_records").delete().eq("id", id);
    toast.success("تم الحذف"); load();
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="px-4 pt-12 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/profile" className="w-10 h-10 rounded-full glass flex items-center justify-center"><ArrowRight size={18} /></Link>
          <h1 className="text-xl font-black">السجل الصحي</h1>
        </div>
        <button onClick={() => setOpen(true)} className="w-10 h-10 rounded-full gradient-primary text-primary-foreground flex items-center justify-center shadow-soft">
          <Plus size={18} />
        </button>
      </div>

      <div className="px-4 space-y-3">
        {records.length === 0 && (
          <div className="bg-card rounded-3xl p-10 text-center shadow-card">
            <FileText className="mx-auto text-muted-foreground mb-3" size={40} />
            <p className="font-bold">سجلك الصحي فارغ</p>
            <p className="text-xs text-muted-foreground mt-1">أضف وصفاتك وتقاريرك للوصول إليها بسهولة</p>
          </div>
        )}
        {records.map((r) => {
          const t = types[r.record_type] ?? types.other;
          const Icon = t.icon;
          return (
            <div key={r.id} className="bg-card rounded-3xl p-4 shadow-card border border-border/40">
              <div className="flex items-start gap-3">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${t.color}`}><Icon size={18} /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm flex-1 line-clamp-1">{r.title}</h4>
                    <span className="text-[10px] font-bold text-muted-foreground">{r.record_date}</span>
                  </div>
                  <p className="text-xs text-primary font-bold mt-0.5">{t.label}</p>
                  {r.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{r.description}</p>}
                  {(r.provider_name || r.doctor_name) && (
                    <p className="text-[11px] text-muted-foreground mt-1">{[r.doctor_name, r.provider_name].filter(Boolean).join(" · ")}</p>
                  )}
                </div>
                <button onClick={() => del(r.id)} className="w-8 h-8 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end" onClick={() => setOpen(false)}>
          <div className="bg-card w-full rounded-t-3xl p-5 space-y-3 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-black text-lg">إضافة سجل صحي</h3>
              <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"><X size={16} /></button>
            </div>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="العنوان (مثلاً: تحليل دم)" className="w-full bg-muted rounded-2xl px-4 py-3 text-sm font-medium outline-none" />
            <select value={form.record_type} onChange={(e) => setForm({ ...form, record_type: e.target.value })}
              className="w-full bg-muted rounded-2xl px-4 py-3 text-sm font-bold outline-none">
              {Object.entries(types).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            <input type="date" value={form.record_date} onChange={(e) => setForm({ ...form, record_date: e.target.value })}
              className="w-full bg-muted rounded-2xl px-4 py-3 text-sm font-medium outline-none" />
            <input value={form.doctor_name} onChange={(e) => setForm({ ...form, doctor_name: e.target.value })}
              placeholder="اسم الطبيب (اختياري)" className="w-full bg-muted rounded-2xl px-4 py-3 text-sm font-medium outline-none" />
            <input value={form.provider_name} onChange={(e) => setForm({ ...form, provider_name: e.target.value })}
              placeholder="اسم المركز (اختياري)" className="w-full bg-muted rounded-2xl px-4 py-3 text-sm font-medium outline-none" />
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="ملاحظات / تفاصيل" rows={3} className="w-full bg-muted rounded-2xl px-4 py-3 text-sm font-medium outline-none resize-none" />
            <button onClick={add} className="w-full gradient-primary text-primary-foreground py-3.5 rounded-2xl font-bold text-sm">حفظ</button>
          </div>
        </div>
      )}
      <BottomNav />
    </div>
  );
}
