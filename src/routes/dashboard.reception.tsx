import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Users, Plus, Copy, Trash2, Loader2, ShieldOff, Phone, Calendar, Home, Settings, QrCode } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useRoles } from "@/lib/useRoles";
import { supabase } from "@/integrations/supabase/client";
import { generateSecureToken, buildAccessUrl } from "@/lib/tokens";
import { toast } from "sonner";
import DashHero from "@/components/dashboard/DashHero";
import { DashQuickActions } from "@/components/dashboard/DashQuickAction";
import DashBottomNav from "@/components/dashboard/DashBottomNav";


export const Route = createFileRoute("/dashboard/reception")({
  head: () => ({ meta: [{ title: "إدارة الاستقبال | صحتي" }] }),
  component: ReceptionMgmt,
});

type Prov = { id: string; name: string };
type Rec = {
  id: string; provider_id: string; full_name: string; employee_name: string | null;
  phone: string | null; active: boolean; permissions: any;
};
type Tok = { id: string; token: string; active: boolean; reception_user_id: string | null };

function ReceptionMgmt() {
  const { user, loading: aL } = useAuth();
  const { isProvider, isAdmin, loading: rL } = useRoles();
  const nav = useNavigate();
  const [providers, setProviders] = useState<Prov[]>([]);
  const [selectedProv, setSelectedProv] = useState<string>("");
  const [recs, setRecs] = useState<Rec[]>([]);
  const [tokens, setTokens] = useState<Tok[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ full_name: "", employee_name: "", phone: "" });

  useEffect(() => { if (!aL && !user) nav({ to: "/auth" }); }, [aL, user, nav]);
  useEffect(() => {
    if (!user || (!isProvider && !isAdmin)) return;
    (async () => {
      const q = isAdmin
        ? supabase.from("providers").select("id, name").order("name")
        : supabase.from("providers").select("id, name").eq("owner_user_id", user.id);
      const { data } = await q;
      const ps = (data ?? []) as Prov[];
      setProviders(ps);
      if (ps[0]) setSelectedProv(ps[0].id);
      setLoading(false);
    })();
  }, [user, isProvider, isAdmin]);

  useEffect(() => { if (selectedProv) loadRecs(); }, [selectedProv]);

  async function loadRecs() {
    const [{ data: r }, { data: t }] = await Promise.all([
      supabase.from("reception_users").select("*").eq("provider_id", selectedProv).order("created_at", { ascending: false }),
      supabase.from("access_tokens").select("id, token, active, reception_user_id").eq("kind", "reception").eq("provider_id", selectedProv),
    ]);
    setRecs((r ?? []) as Rec[]);
    setTokens((t ?? []) as Tok[]);
  }

  async function create() {
    if (!form.full_name.trim() || !selectedProv) return toast.error("الاسم مطلوب");
    const { data: rec, error } = await supabase.from("reception_users").insert({
      provider_id: selectedProv, full_name: form.full_name.trim(),
      employee_name: form.employee_name || null, phone: form.phone || null,
    }).select().single();
    if (error || !rec) return toast.error(error?.message ?? "خطأ");
    // auto-generate token
    const token = generateSecureToken(32);
    await supabase.from("access_tokens").insert({
      token, kind: "reception", provider_id: selectedProv, reception_user_id: rec.id,
      label: form.full_name, created_by: user?.id,
    });
    setForm({ full_name: "", employee_name: "", phone: "" });
    toast.success("تم إنشاء الحساب والرابط");
    loadRecs();
  }

  async function toggleRec(id: string, active: boolean) {
    await supabase.from("reception_users").update({ active }).eq("id", id);
    loadRecs();
  }
  async function delRec(id: string) {
    if (!confirm("حذف الحساب؟")) return;
    await supabase.from("reception_users").delete().eq("id", id);
    loadRecs();
  }
  function copyLink(token: string) {
    navigator.clipboard.writeText(buildAccessUrl("reception", token));
    toast.success("تم نسخ الرابط");
  }

  if (aL || rL || loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;
  if (!isProvider && !isAdmin) { nav({ to: "/" }); return null; }

  const selectedName = providers.find((p) => p.id === selectedProv)?.name || "الاستقبال";

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/40 to-background pb-32" dir="rtl">
      <DashHero
        title="لوحة موظف الاستقبال"
        subtitle={`${selectedName} • ${recs.filter((r) => r.active).length} حساب نشط`}
        greeting="مرحباً بعودتك،"
        avatarFallback="R"
        back="/dashboard"
      />

      <main className="mx-auto max-w-3xl px-4 py-6 -mt-12 relative z-10 space-y-4">
        <DashQuickActions items={[
          { onClick: () => document.getElementById("new-rec")?.scrollIntoView({ behavior: "smooth" }), icon: Plus, label: "حساب جديد", hue: "primary" },
          { to: "/bookings", icon: Calendar, label: "حجوزات اليوم", hue: "success" },
          { to: "/dashboard", icon: ArrowRight, label: "لوحة المزود", hue: "accent" },
        ]} />

        {providers.length > 1 && (
          <select value={selectedProv} onChange={(e) => setSelectedProv(e.target.value)} className="w-full rounded-2xl border border-input bg-background px-3 py-2.5 text-sm">
            {providers.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        )}

        <div id="new-rec" className="rounded-3xl border bg-card p-4 space-y-3 shadow-sm">
          <h2 className="font-bold flex items-center gap-2"><Plus size={16} /> موظف استقبال جديد</h2>
          <input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder="اسم الحساب (مثال: استقبال صباحي)" className="w-full rounded-2xl border border-input bg-background px-3 py-2.5 text-sm" />
          <input value={form.employee_name} onChange={(e) => setForm({ ...form, employee_name: e.target.value })} placeholder="اسم الموظف" className="w-full rounded-2xl border border-input bg-background px-3 py-2.5 text-sm" />
          <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="رقم الهاتف" dir="ltr" className="w-full rounded-2xl border border-input bg-background px-3 py-2.5 text-sm" />
          <button onClick={create} className="w-full gradient-primary text-primary-foreground rounded-2xl px-4 py-2.5 text-sm font-bold shadow-glow">إنشاء حساب + رابط دخول</button>
        </div>

        <div className="rounded-3xl border bg-card overflow-hidden">
          <div className="p-4 border-b font-bold">الحسابات ({recs.length})</div>
          {recs.length === 0 ? (
            <div className="p-12 text-center text-sm text-muted-foreground">لا توجد حسابات استقبال بعد.</div>
          ) : (
            <div className="divide-y">
              {recs.map((r) => {
                const tok = tokens.find((t) => t.reception_user_id === r.id);
                return (
                  <motion.div key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary/15 to-accent/15 flex items-center justify-center font-extrabold text-primary">{r.full_name.charAt(0)}</div>
                      <div className="flex-1 min-w-[150px]">
                        <h3 className="font-bold text-sm">{r.full_name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {r.employee_name && <>{r.employee_name} • </>}
                          {r.phone && <a href={`tel:${r.phone}`} className="text-primary inline-flex items-center gap-1"><Phone size={10} />{r.phone}</a>}
                        </p>
                      </div>
                      {!r.active && <span className="text-[10px] font-bold bg-muted text-muted-foreground rounded-full px-2 py-0.5">معطّل</span>}
                    </div>
                    {tok && (
                      <div className="flex items-center gap-2 bg-muted/40 rounded-xl p-2">
                        <code className="flex-1 text-[10px] break-all" dir="ltr">{buildAccessUrl("reception", tok.token)}</code>
                        <button onClick={() => copyLink(tok.token)} className="p-1.5 rounded-lg bg-card border hover:bg-muted"><Copy size={12} /></button>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <button onClick={() => toggleRec(r.id, !r.active)} className="text-[11px] font-bold rounded-xl bg-muted px-3 py-1.5 flex items-center gap-1"><ShieldOff size={12} /> {r.active ? "تعطيل" : "تفعيل"}</button>
                      <button onClick={() => delRec(r.id)} className="text-[11px] font-bold rounded-xl bg-destructive/10 text-destructive px-3 py-1.5 flex items-center gap-1"><Trash2 size={12} /> حذف</button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
