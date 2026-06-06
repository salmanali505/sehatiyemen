import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { DatabaseBackup, Download, Loader2 } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/backup")({
  head: () => ({ meta: [{ title: "النسخ الاحتياطي | الإدارة" }] }),
  component: BackupAdmin,
});

const TABLES = ["providers", "bookings", "profiles", "user_roles", "cities", "specialties", "packages", "subscriptions", "payments", "ads", "offers", "content_posts", "reviews", "favorites", "family_members", "health_records", "notifications", "support_tickets", "audit_logs", "system_settings", "home_sections", "access_tokens", "reception_users"] as const;

function BackupAdmin() {
  const [busy, setBusy] = useState<string | null>(null);

  async function exportAll() {
    setBusy("all");
    const out: Record<string, any[]> = {};
    for (const t of TABLES) {
      const { data, error } = await supabase.from(t as any).select("*").limit(10000);
      if (error) { toast.error(`${t}: ${error.message}`); continue; }
      out[t] = data ?? [];
    }
    download(`sehati-backup-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(out, null, 2));
    await supabase.from("system_settings").upsert({ key: "last_backup_at", value: { at: new Date().toISOString() } as any });
    setBusy(null); toast.success("تم تنزيل نسخة كاملة");
  }
  async function exportOne(t: string) {
    setBusy(t);
    const { data, error } = await supabase.from(t as any).select("*").limit(10000);
    setBusy(null);
    if (error) return toast.error(error.message);
    download(`${t}-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(data ?? [], null, 2));
    toast.success(`تم تنزيل ${t}`);
  }
  function download(name: string, content: string) {
    const blob = new Blob([content], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = name; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <AdminShell title="مركز النسخ الاحتياطي" subtitle="تصدير البيانات يدوياً بصيغة JSON" icon={DatabaseBackup}>
      <div className="rounded-3xl border bg-card p-5 space-y-3">
        <h3 className="font-extrabold">نسخة كاملة</h3>
        <p className="text-xs text-muted-foreground">يقوم بتنزيل جميع الجداول العامة في ملف واحد ويسجّل تاريخ آخر نسخة احتياطية.</p>
        <button onClick={exportAll} disabled={busy === "all"} className="rounded-2xl gradient-primary text-primary-foreground px-5 py-3 font-bold shadow-glow inline-flex items-center gap-2 disabled:opacity-50">
          {busy === "all" ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />} تنزيل نسخة كاملة
        </button>
      </div>
      <div className="rounded-3xl border bg-card overflow-hidden divide-y">
        {TABLES.map((t) => (
          <div key={t} className="p-3 flex items-center gap-3 text-sm">
            <span className="flex-1 font-bold" dir="ltr">{t}</span>
            <button onClick={() => exportOne(t)} disabled={busy === t} className="rounded-xl border px-3 py-1.5 text-xs font-bold flex items-center gap-1 hover:bg-muted disabled:opacity-50">
              {busy === t ? <Loader2 className="animate-spin" size={12} /> : <Download size={12} />} تنزيل
            </button>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
