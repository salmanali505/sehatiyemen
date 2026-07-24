import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ToggleLeft, Plus, Trash2, Loader2 } from "lucide-react";
import AdminShell, { EmptyState } from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { useAllFlags } from "@/lib/settings/useFeatureFlag";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/flags")({
  head: () => ({ meta: [{ title: "الميزات (Feature Flags) | الإدارة" }] }),
  component: FlagsAdmin,
});

const AUDIENCES = [
  { k: "all", t: "الجميع" },
  { k: "admin", t: "الإدارة" },
  { k: "providers", t: "المزوّدون" },
  { k: "patients", t: "المرضى" },
];

function FlagsAdmin() {
  const flags = useAllFlags();
  const [busy, setBusy] = useState<string | null>(null);
  const [newKey, setNewKey] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newAud, setNewAud] = useState("all");

  async function toggle(key: string, enabled: boolean) {
    setBusy(key);
    const { error } = await supabase.from("feature_flags").update({ enabled }).eq("key", key);
    setBusy(null);
    if (error) toast.error(error.message);
    else toast.success(enabled ? "تم التفعيل" : "تم التعطيل");
  }
  async function setAudience(key: string, audience: string) {
    const { error } = await supabase.from("feature_flags").update({ audience }).eq("key", key);
    if (error) toast.error(error.message);
  }
  async function remove(key: string) {
    if (!confirm(`حذف الميزة "${key}"؟`)) return;
    const { error } = await supabase.from("feature_flags").delete().eq("key", key);
    if (error) toast.error(error.message);
    else toast.success("تم الحذف");
  }
  async function create() {
    if (!newKey.trim()) return toast.error("اكتب مفتاح الميزة");
    const { error } = await supabase.from("feature_flags").insert({
      key: newKey.trim(),
      description: newDesc.trim() || null,
      audience: newAud,
      enabled: false,
    });
    if (error) toast.error(error.message);
    else {
      toast.success("تمت إضافة الميزة");
      setNewKey("");
      setNewDesc("");
    }
  }

  return (
    <AdminShell
      title="الميزات (Feature Flags)"
      subtitle="تحكم مركزي بتفعيل/تعطيل ميزات المنصة بشكل فوري"
      icon={ToggleLeft}
    >
      <div className="rounded-3xl border bg-card p-4 space-y-3">
        <h3 className="font-extrabold text-sm">إضافة ميزة جديدة</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <input
            placeholder="مفتاح (مثال: payments_online)"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            className="rounded-2xl border border-input bg-background px-3 py-2 text-sm"
          />
          <input
            placeholder="وصف مختصر"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            className="rounded-2xl border border-input bg-background px-3 py-2 text-sm md:col-span-2"
          />
          <select
            value={newAud}
            onChange={(e) => setNewAud(e.target.value)}
            className="rounded-2xl border border-input bg-background px-3 py-2 text-sm"
          >
            {AUDIENCES.map((a) => (
              <option key={a.k} value={a.k}>{a.t}</option>
            ))}
          </select>
        </div>
        <button
          onClick={create}
          className="rounded-2xl gradient-primary text-primary-foreground px-3 py-2 text-xs font-bold shadow-glow flex items-center gap-1"
        >
          <Plus size={14} /> إضافة
        </button>
      </div>

      {flags.length === 0 ? (
        <EmptyState icon={ToggleLeft} title="لا توجد ميزات بعد" hint="أضف أول ميزة من الأعلى" />
      ) : (
        <div className="rounded-3xl border bg-card divide-y">
          {flags
            .sort((a, b) => a.key.localeCompare(b.key))
            .map((f: any) => (
              <div key={f.key} className="p-4 flex flex-wrap items-center gap-3">
                <div className="flex-1 min-w-[200px]">
                  <div className="font-extrabold text-sm">{f.key}</div>
                  {f.description && (
                    <div className="text-xs text-muted-foreground">{f.description}</div>
                  )}
                </div>
                <select
                  value={f.audience}
                  onChange={(e) => setAudience(f.key, e.target.value)}
                  className="rounded-2xl border border-input bg-background px-2 py-1.5 text-xs"
                >
                  {AUDIENCES.map((a) => (
                    <option key={a.k} value={a.k}>{a.t}</option>
                  ))}
                </select>
                <button
                  onClick={() => toggle(f.key, !f.enabled)}
                  disabled={busy === f.key}
                  className={`rounded-2xl px-3 py-1.5 text-xs font-bold min-w-[90px] ${
                    f.enabled
                      ? "gradient-primary text-primary-foreground shadow-glow"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {busy === f.key ? (
                    <Loader2 size={14} className="animate-spin inline" />
                  ) : f.enabled ? (
                    "مفعّل"
                  ) : (
                    "معطّل"
                  )}
                </button>
                <button
                  onClick={() => remove(f.key)}
                  className="rounded-2xl bg-destructive/10 text-destructive px-2 py-1.5 text-xs"
                  aria-label="حذف"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
        </div>
      )}
    </AdminShell>
  );
}
