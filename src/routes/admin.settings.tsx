import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Settings2, Save } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({ meta: [{ title: "إعدادات النظام | الإدارة" }] }),
  component: SettingsAdmin,
});

type Settings = {
  app_name: string; app_tagline: string; support_email: string; support_phone: string;
  logo_url: string; primary_color: string;
  otp_enabled: boolean; email_enabled: boolean; sms_enabled: boolean;
  ai_enabled: boolean; maps_enabled: boolean; cloud_storage: string;
};
const DEFAULT: Settings = {
  app_name: "صحتي", app_tagline: "صحتك تبدأ من هنا", support_email: "", support_phone: "",
  logo_url: "", primary_color: "",
  otp_enabled: true, email_enabled: true, sms_enabled: false,
  ai_enabled: true, maps_enabled: true, cloud_storage: "supabase",
};

function SettingsAdmin() {
  const [s, setS] = useState<Settings>(DEFAULT);
  const [loading, setLoading] = useState(true);

  useEffect(() => { (async () => {
    const { data } = await supabase.from("system_settings").select("value").eq("key", "app").maybeSingle();
    if (data?.value) setS({ ...DEFAULT, ...(data.value as any) });
    setLoading(false);
  })(); }, []);

  async function save() {
    const { error } = await supabase.from("system_settings").upsert({ key: "app", value: s as any });
    if (error) return toast.error(error.message);
    toast.success("تم حفظ الإعدادات");
  }

  if (loading) return <AdminShell title="إعدادات النظام" icon={Settings2}><div className="p-8 text-center">...</div></AdminShell>;

  return (
    <AdminShell title="إعدادات النظام" subtitle="اسم التطبيق، الهوية البصرية، OTP، الذكاء الاصطناعي، الأمان" icon={Settings2}
      actions={<button onClick={save} className="rounded-2xl gradient-primary text-primary-foreground px-3 py-2 text-xs font-bold shadow-glow flex items-center gap-1"><Save size={14} /> حفظ</button>}>
      <Section title="هوية التطبيق">
        <Inp label="اسم التطبيق" v={s.app_name} on={(v) => setS({ ...s, app_name: v })} />
        <Inp label="الشعار النصي" v={s.app_tagline} on={(v) => setS({ ...s, app_tagline: v })} />
        <Inp label="رابط الشعار (logo)" v={s.logo_url} on={(v) => setS({ ...s, logo_url: v })} />
        <Inp label="اللون الأساسي" v={s.primary_color} on={(v) => setS({ ...s, primary_color: v })} />
      </Section>
      <Section title="التواصل">
        <Inp label="بريد الدعم" v={s.support_email} on={(v) => setS({ ...s, support_email: v })} />
        <Inp label="هاتف الدعم" v={s.support_phone} on={(v) => setS({ ...s, support_phone: v })} />
      </Section>
      <Section title="القنوات">
        <Tog label="تفعيل OTP" v={s.otp_enabled} on={(v) => setS({ ...s, otp_enabled: v })} />
        <Tog label="البريد الإلكتروني" v={s.email_enabled} on={(v) => setS({ ...s, email_enabled: v })} />
        <Tog label="الرسائل النصية SMS" v={s.sms_enabled} on={(v) => setS({ ...s, sms_enabled: v })} />
      </Section>
      <Section title="الخدمات الذكية">
        <Tog label="المساعد الذكي" v={s.ai_enabled} on={(v) => setS({ ...s, ai_enabled: v })} />
        <Tog label="الخرائط" v={s.maps_enabled} on={(v) => setS({ ...s, maps_enabled: v })} />
      </Section>
    </AdminShell>
  );
}

function Section({ title, children }: any) {
  return <div className="rounded-3xl border bg-card p-5 space-y-3">
    <h3 className="font-extrabold text-sm text-muted-foreground">{title}</h3>
    {children}
  </div>;
}
function Inp({ label, v, on }: { label: string; v: string; on: (v: string) => void }) {
  return <label className="block">
    <span className="text-xs font-bold text-muted-foreground">{label}</span>
    <input value={v} onChange={(e) => on(e.target.value)} className="w-full rounded-2xl border border-input bg-background px-3 py-2 text-sm mt-1" />
  </label>;
}
function Tog({ label, v, on }: { label: string; v: boolean; on: (v: boolean) => void }) {
  return <button onClick={() => on(!v)}
    className={`w-full rounded-2xl px-4 py-3 text-sm font-bold flex items-center justify-between ${v ? "gradient-primary text-primary-foreground shadow-glow" : "bg-muted text-muted-foreground"}`}>
    <span>{label}</span><span>{v ? "مفعّل" : "معطّل"}</span>
  </button>;
}
