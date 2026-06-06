import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BrainCircuit, MessageSquare, Loader2, Save } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/ai")({
  head: () => ({ meta: [{ title: "الذكاء الاصطناعي | الإدارة" }] }),
  component: AiAdmin,
});

const MODELS = [
  "google/gemini-2.5-flash",
  "google/gemini-2.5-flash-lite",
  "google/gemini-2.5-pro",
  "openai/gpt-5-mini",
  "openai/gpt-5",
];

function AiAdmin() {
  const [stats, setStats] = useState({ chats: 0, users: 0, msgs: 0 });
  const [recent, setRecent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cfg, setCfg] = useState<{ model: string; system: string; enabled: boolean }>({ model: "google/gemini-2.5-flash", system: "أنت مساعد صحي ذكي.", enabled: true });
  const [saving, setSaving] = useState(false);

  useEffect(() => { (async () => {
    setLoading(true);
    const [{ data: convs }, { data: setting }] = await Promise.all([
      supabase.from("ai_conversations").select("id, user_id, title, messages, updated_at").order("updated_at", { ascending: false }).limit(50),
      supabase.from("system_settings").select("value").eq("key", "ai_config").maybeSingle(),
    ]);
    const list = convs ?? [];
    const users = new Set(list.map((c: any) => c.user_id));
    const msgs = list.reduce((a: number, c: any) => a + (Array.isArray(c.messages) ? c.messages.length : 0), 0);
    setStats({ chats: list.length, users: users.size, msgs });
    setRecent(list.slice(0, 10));
    if (setting?.value) setCfg({ ...cfg, ...(setting.value as any) });
    setLoading(false);
  })(); }, []);

  async function save() {
    setSaving(true);
    const { error } = await supabase.from("system_settings").upsert({ key: "ai_config", value: cfg as any });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("تم حفظ إعدادات الذكاء الاصطناعي");
  }

  return (
    <AdminShell title="مركز الذكاء الاصطناعي" subtitle="إعداد المساعد، النماذج، والتعليمات" icon={BrainCircuit}>
      <div className="grid grid-cols-3 gap-3">
        <Box label="محادثات" v={stats.chats} />
        <Box label="مستخدمون" v={stats.users} />
        <Box label="رسائل" v={stats.msgs} />
      </div>

      <div className="rounded-3xl border bg-card p-5 space-y-3">
        <h3 className="font-extrabold">إعدادات المساعد</h3>
        <div className="flex items-center gap-3">
          <label className="text-sm font-bold flex-1">تفعيل المساعد</label>
          <button onClick={() => setCfg({ ...cfg, enabled: !cfg.enabled })}
            className={`rounded-full px-3 py-1 text-xs font-bold ${cfg.enabled ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
            {cfg.enabled ? "مفعّل" : "موقوف"}
          </button>
        </div>
        <div>
          <label className="text-xs text-muted-foreground">النموذج الافتراضي</label>
          <select value={cfg.model} onChange={(e) => setCfg({ ...cfg, model: e.target.value })} dir="ltr"
            className="w-full mt-1 rounded-2xl border border-input bg-background px-3 py-2 text-sm">
            {MODELS.map((m) => <option key={m}>{m}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground">تعليمات النظام (System Prompt)</label>
          <textarea value={cfg.system} onChange={(e) => setCfg({ ...cfg, system: e.target.value })} rows={4}
            className="w-full mt-1 rounded-2xl border border-input bg-background px-3 py-2 text-sm" />
        </div>
        <button onClick={save} disabled={saving} className="rounded-2xl gradient-primary text-primary-foreground px-5 py-2.5 font-bold shadow-glow inline-flex items-center gap-2 disabled:opacity-50">
          {saving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />} حفظ
        </button>
      </div>

      <div className="rounded-3xl border bg-card overflow-hidden">
        <div className="p-4 border-b flex items-center gap-2"><MessageSquare size={16} className="text-primary" /><h3 className="font-extrabold flex-1">آخر المحادثات</h3>
          <Link to="/assistant" className="text-xs text-primary font-bold">فتح المساعد</Link>
        </div>
        {loading ? <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>
          : recent.length === 0 ? <p className="p-6 text-center text-xs text-muted-foreground">لا توجد محادثات بعد</p>
          : <div className="divide-y">
              {recent.map((c) => (
                <div key={c.id} className="p-3 text-sm flex items-center gap-3">
                  <div className="flex-1 min-w-0"><p className="font-bold truncate">{c.title}</p>
                    <p className="text-[10px] text-muted-foreground">{Array.isArray(c.messages) ? c.messages.length : 0} رسالة • {new Date(c.updated_at).toLocaleString("ar")}</p></div>
                </div>
              ))}
            </div>}
      </div>
    </AdminShell>
  );
}
function Box({ label, v }: { label: string; v: number }) {
  return <div className="rounded-3xl border bg-card p-4 text-center"><p className="text-2xl font-extrabold">{v.toLocaleString()}</p><p className="text-[10px] text-muted-foreground mt-1">{label}</p></div>;
}
