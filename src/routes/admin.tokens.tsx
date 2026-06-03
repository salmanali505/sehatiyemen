import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, Key, Plus, Copy, Loader2, ShieldOff, RefreshCw, Trash2, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { useRoles } from "@/lib/useRoles";
import { supabase } from "@/integrations/supabase/client";
import { generateSecureToken, buildAccessUrl } from "@/lib/tokens";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/tokens")({
  head: () => ({ meta: [{ title: "روابط الوصول | صحتي" }] }),
  component: TokensPage,
});

type Tok = {
  id: string; token: string; kind: "admin" | "provider" | "reception";
  label: string | null; active: boolean; expires_at: string | null;
  last_used_at: string | null; uses_count: number; created_at: string;
  provider_id: string | null; reception_user_id: string | null;
};

function TokensPage() {
  const { user, loading: aL } = useAuth();
  const { isAdmin, loading: rL } = useRoles();
  const nav = useNavigate();
  const [items, setItems] = useState<Tok[]>([]);
  const [providers, setProviders] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [newKind, setNewKind] = useState<"admin" | "provider" | "reception">("admin");
  const [newLabel, setNewLabel] = useState("");
  const [newProvider, setNewProvider] = useState("");
  const [justCreated, setJustCreated] = useState<{ url: string; token: string } | null>(null);

  useEffect(() => { if (!aL && !user) nav({ to: "/auth" }); }, [aL, user, nav]);
  useEffect(() => { if (isAdmin) { load(); loadProviders(); } }, [isAdmin]);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("access_tokens").select("*").order("created_at", { ascending: false }).limit(200);
    setItems((data ?? []) as Tok[]); setLoading(false);
  }
  async function loadProviders() {
    const { data } = await supabase.from("providers").select("id, name").order("name");
    setProviders((data ?? []) as any);
  }

  async function createToken() {
    if (newKind !== "admin" && !newProvider) return toast.error("اختر المزوّد");
    const token = generateSecureToken(32);
    const payload: any = { token, kind: newKind, label: newLabel || null, created_by: user?.id };
    if (newKind !== "admin") payload.provider_id = newProvider;
    const { error } = await supabase.from("access_tokens").insert(payload);
    if (error) return toast.error(error.message);
    const url = buildAccessUrl(newKind, token);
    setJustCreated({ url, token });
    setNewLabel(""); setNewProvider("");
    load();
  }

  async function toggle(id: string, active: boolean) {
    await supabase.from("access_tokens").update({ active }).eq("id", id);
    setItems((x) => x.map((t) => (t.id === id ? { ...t, active } : t)));
    toast.success(active ? "تم التفعيل" : "تم التعطيل");
  }
  async function regen(t: Tok) {
    const token = generateSecureToken(32);
    await supabase.from("access_tokens").update({ token, uses_count: 0 }).eq("id", t.id);
    toast.success("تم تجديد الرابط"); load();
  }
  async function del(id: string) {
    if (!confirm("حذف الرابط نهائياً؟")) return;
    await supabase.from("access_tokens").delete().eq("id", id); load();
  }
  function copy(text: string) { navigator.clipboard.writeText(text); toast.success("تم النسخ"); }

  if (aL || rL) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;
  if (!isAdmin) { nav({ to: "/" }); return null; }

  return (
    <div className="min-h-screen bg-background pb-12" dir="rtl">
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-background/85 border-b">
        <div className="mx-auto max-w-4xl px-4 py-4 flex items-center gap-3">
          <Link to="/admin" className="rounded-xl p-2 hover:bg-muted"><ArrowRight size={20} /></Link>
          <div className="flex-1"><h1 className="font-extrabold text-lg">روابط الوصول الخاصة</h1><p className="text-xs text-muted-foreground">إدارة الروابط السرّية للمشرف والمزوّدين وموظفي الاستقبال</p></div>
          <button onClick={() => setShowNew(!showNew)} className="rounded-2xl gradient-primary text-primary-foreground px-4 py-2 text-xs font-bold flex items-center gap-1 shadow-glow"><Plus size={14} /> جديد</button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6 space-y-4">
        {showNew && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border bg-card p-4 space-y-3">
            <h2 className="font-bold flex items-center gap-2"><Key size={16} /> إنشاء رابط جديد</h2>
            <div className="grid grid-cols-3 gap-2">
              {(["admin", "provider", "reception"] as const).map((k) => (
                <button key={k} onClick={() => setNewKind(k)} className={`rounded-2xl px-3 py-2 text-xs font-bold ${newKind === k ? "gradient-primary text-primary-foreground shadow-glow" : "bg-muted text-muted-foreground"}`}>
                  {k === "admin" ? "مشرف" : k === "provider" ? "مزوّد" : "استقبال"}
                </button>
              ))}
            </div>
            <input value={newLabel} onChange={(e) => setNewLabel(e.target.value)} placeholder="تسمية (اختياري)" className="w-full rounded-2xl border border-input bg-background px-3 py-2.5 text-sm" />
            {newKind !== "admin" && (
              <select value={newProvider} onChange={(e) => setNewProvider(e.target.value)} className="w-full rounded-2xl border border-input bg-background px-3 py-2.5 text-sm">
                <option value="">اختر المزوّد...</option>
                {providers.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            )}
            <button onClick={createToken} className="w-full gradient-primary text-primary-foreground rounded-2xl px-4 py-2.5 text-sm font-bold shadow-glow">توليد رابط مشفّر</button>
          </motion.div>
        )}

        {justCreated && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-3xl border-2 border-primary/30 bg-primary/5 p-4">
            <h3 className="font-extrabold text-sm flex items-center gap-2 text-primary"><CheckCircle2 size={16} /> تم إنشاء الرابط — انسخه واحفظه الآن</h3>
            <div className="mt-3 flex items-center gap-2 bg-card rounded-2xl border p-2">
              <code className="flex-1 text-[11px] break-all" dir="ltr">{justCreated.url}</code>
              <button onClick={() => copy(justCreated.url)} className="p-2 rounded-xl bg-primary text-primary-foreground"><Copy size={14} /></button>
            </div>
            <button onClick={() => setJustCreated(null)} className="mt-2 text-xs text-muted-foreground">إغلاق</button>
          </motion.div>
        )}

        <div className="rounded-3xl border bg-card overflow-hidden">
          <div className="p-4 border-b font-bold">الروابط ({items.length})</div>
          {loading ? <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-primary" /></div> : items.length === 0 ? (
            <div className="p-12 text-center text-sm text-muted-foreground">لا توجد روابط بعد.</div>
          ) : (
            <div className="divide-y">
              {items.map((t) => {
                const url = buildAccessUrl(t.kind, t.token);
                const kindLabel = t.kind === "admin" ? "مشرف عام" : t.kind === "provider" ? "مزوّد" : "استقبال";
                const kindColor = t.kind === "admin" ? "bg-destructive/10 text-destructive" : t.kind === "provider" ? "bg-primary/10 text-primary" : "bg-success/10 text-success";
                return (
                  <div key={t.id} className="p-4 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] font-bold rounded-full px-2 py-0.5 ${kindColor}`}>{kindLabel}</span>
                      {t.label && <span className="text-xs font-bold">{t.label}</span>}
                      {!t.active && <span className="text-[10px] font-bold bg-muted text-muted-foreground rounded-full px-2 py-0.5">معطّل</span>}
                      <span className="text-[10px] text-muted-foreground mr-auto">استخدامات: {t.uses_count}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-muted/40 rounded-xl p-2">
                      <code className="flex-1 text-[10px] break-all" dir="ltr">{url}</code>
                      <button onClick={() => copy(url)} className="p-1.5 rounded-lg bg-card border hover:bg-muted"><Copy size={12} /></button>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => toggle(t.id, !t.active)} className="text-[11px] font-bold rounded-xl bg-muted px-3 py-1.5 flex items-center gap-1"><ShieldOff size={12} /> {t.active ? "تعطيل" : "تفعيل"}</button>
                      <button onClick={() => regen(t)} className="text-[11px] font-bold rounded-xl bg-warning/10 text-warning px-3 py-1.5 flex items-center gap-1"><RefreshCw size={12} /> تجديد</button>
                      <button onClick={() => del(t.id)} className="text-[11px] font-bold rounded-xl bg-destructive/10 text-destructive px-3 py-1.5 flex items-center gap-1"><Trash2 size={12} /> حذف</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
