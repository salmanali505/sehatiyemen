import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Users, ArrowRight, Plus, Trash2, X } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { BottomNav } from "@/components/BottomNav";
import { toast } from "sonner";

export const Route = createFileRoute("/family")({
  head: () => ({ meta: [{ title: "أفراد العائلة | صحتي" }] }),
  component: FamilyPage,
});

type Member = { id: string; full_name: string; relation: string; gender: string | null; age: number | null; phone: string | null };
const relations: Record<string, string> = { father: "أب", mother: "أم", spouse: "زوج/ة", child: "ابن/ة", sibling: "أخ/أخت", other: "آخر" };

function FamilyPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [members, setMembers] = useState<Member[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ full_name: "", relation: "child", gender: "male", age: "", phone: "" });

  useEffect(() => {
    if (!loading && !user) { navigate({ to: "/auth" }); return; }
    if (user) load();
  }, [user, loading]);

  async function load() {
    const { data } = await supabase.from("family_members").select("*").order("created_at");
    setMembers((data ?? []) as Member[]);
  }

  async function add() {
    if (!form.full_name.trim() || !user) return;
    const { error } = await supabase.from("family_members").insert({
      user_id: user.id, full_name: form.full_name, relation: form.relation as any,
      gender: form.gender as any, age: form.age ? Number(form.age) : null, phone: form.phone || null,
    });
    if (error) return toast.error(error.message);
    toast.success("تمت الإضافة");
    setForm({ full_name: "", relation: "child", gender: "male", age: "", phone: "" });
    setOpen(false); load();
  }

  async function del(id: string) {
    await supabase.from("family_members").delete().eq("id", id);
    toast.success("تم الحذف"); load();
  }

  return (
    <div className="min-h-screen bg-background pb-36">
      <div className="px-4 pt-12 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/profile" className="w-10 h-10 rounded-full glass flex items-center justify-center"><ArrowRight size={18} /></Link>
          <h1 className="text-xl font-black">أفراد العائلة</h1>
        </div>
        <button onClick={() => setOpen(true)} className="w-10 h-10 rounded-full gradient-primary text-primary-foreground flex items-center justify-center shadow-soft">
          <Plus size={18} />
        </button>
      </div>

      <div className="px-4 space-y-3">
        {members.length === 0 && (
          <div className="bg-card rounded-3xl p-10 text-center shadow-card">
            <Users className="mx-auto text-muted-foreground mb-3" size={40} />
            <p className="font-bold">لم تتم إضافة أفراد بعد</p>
            <p className="text-xs text-muted-foreground mt-1">أضف أفراد عائلتك لحجز المواعيد لهم بسهولة</p>
          </div>
        )}
        {members.map((m) => (
          <div key={m.id} className="bg-card rounded-3xl p-4 shadow-card border border-border/40 flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl gradient-primary text-primary-foreground font-black flex items-center justify-center">
              {m.full_name.charAt(0)}
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-sm">{m.full_name}</h4>
              <p className="text-xs text-muted-foreground">{relations[m.relation]} {m.age ? `· ${m.age} سنة` : ""}</p>
            </div>
            <button onClick={() => del(m.id)} className="w-10 h-10 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      {open && (
        <div className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm flex items-end" onClick={() => setOpen(false)}>
          <div className="bg-card w-full rounded-t-3xl p-5 pb-8 space-y-3 max-h-[92vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-black text-lg">إضافة فرد عائلة</h3>
              <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"><X size={16} /></button>
            </div>
            <input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              placeholder="الاسم الكامل" className="w-full bg-muted rounded-2xl px-4 py-3 text-sm font-medium outline-none" />
            <div className="grid grid-cols-2 gap-2">
              <select value={form.relation} onChange={(e) => setForm({ ...form, relation: e.target.value })}
                className="bg-muted rounded-2xl px-4 py-3 text-sm font-bold outline-none">
                {Object.entries(relations).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}
                className="bg-muted rounded-2xl px-4 py-3 text-sm font-bold outline-none">
                <option value="male">ذكر</option><option value="female">أنثى</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })}
                placeholder="العمر" type="number" className="bg-muted rounded-2xl px-4 py-3 text-sm font-medium outline-none" />
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="الهاتف (اختياري)" className="bg-muted rounded-2xl px-4 py-3 text-sm font-medium outline-none" />
            </div>
            <button onClick={add} className="w-full gradient-primary text-primary-foreground py-3.5 rounded-2xl font-bold text-sm">حفظ</button>
          </div>
        </div>
      )}
      {!open && <BottomNav />}
    </div>
  );
}
