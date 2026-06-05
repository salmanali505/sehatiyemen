import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Bell, Send } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/notifications")({
  head: () => ({ meta: [{ title: "الإشعارات | الإدارة" }] }),
  component: NotifAdmin,
});

function NotifAdmin() {
  const [audience, setAudience] = useState<"all" | "providers" | "patients">("all");
  const [form, setForm] = useState({ title: "", body: "", link: "" });
  const [busy, setBusy] = useState(false);

  async function send() {
    if (!form.title.trim()) return toast.error("العنوان مطلوب");
    setBusy(true);
    let users: { id: string }[] = [];
    if (audience === "providers") {
      const { data: r } = await supabase.from("user_roles").select("user_id").eq("role", "provider" as any);
      users = (r ?? []).map((x: any) => ({ id: x.user_id }));
    } else {
      const { data: p } = await supabase.from("profiles").select("id").limit(1000);
      users = p ?? [];
    }
    if (!users.length) { setBusy(false); return toast.error("لا يوجد مستلمون"); }
    const rows = users.map((u) => ({ user_id: u.id, title: form.title, body: form.body || null, link: form.link || null, kind: "broadcast" }));
    const { error } = await supabase.from("notifications").insert(rows);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success(`تم إرسال ${users.length} إشعاراً`);
    setForm({ title: "", body: "", link: "" });
  }

  return (
    <AdminShell title="مركز الإشعارات" subtitle="بث جماعي وإشعارات مجدولة" icon={Bell}>
      <div className="rounded-3xl border bg-card p-5 space-y-3">
        <h3 className="font-extrabold">إرسال إشعار جماعي</h3>
        <div className="flex gap-2">
          {[["all", "الجميع"], ["providers", "المنشآت"], ["patients", "المرضى"]].map(([k, t]) => (
            <button key={k} onClick={() => setAudience(k as any)}
              className={`rounded-2xl px-4 py-2 text-xs font-bold ${audience === k ? "gradient-primary text-primary-foreground shadow-glow" : "bg-muted text-muted-foreground"}`}>
              {t}
            </button>
          ))}
        </div>
        <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="العنوان"
          className="w-full rounded-2xl border border-input bg-background px-3 py-2 text-sm" />
        <textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} placeholder="الرسالة" rows={3}
          className="w-full rounded-2xl border border-input bg-background px-3 py-2 text-sm" />
        <input value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} placeholder="رابط (اختياري)" dir="ltr"
          className="w-full rounded-2xl border border-input bg-background px-3 py-2 text-sm" />
        <button onClick={send} disabled={busy}
          className="w-full rounded-2xl gradient-primary text-primary-foreground py-3 font-bold shadow-glow flex items-center justify-center gap-2 disabled:opacity-50">
          <Send size={16} /> {busy ? "جارٍ الإرسال..." : "إرسال"}
        </button>
      </div>
    </AdminShell>
  );
}
