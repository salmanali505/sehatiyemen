import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Camera, Loader2, Save, ShieldCheck, User as UserIcon, BadgeCheck, Clock, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { BottomNav } from "@/components/BottomNav";
import { toast } from "sonner";

export const Route = createFileRoute("/profile/edit")({
  head: () => ({ meta: [{ title: "تعديل الملف الشخصي | صحتي" }] }),
  component: ProfileEditPage,
});

type Profile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  age: number | null;
  city: string | null;
  avatar_url: string | null;
  gender: string | null;
};

type VerifRow = {
  id: string;
  status: string;
  full_name: string;
  id_number: string | null;
  note: string | null;
  admin_note: string | null;
  created_at: string;
};

// Downscale an image file to a compact JPEG data URL (avatar-friendly).
async function fileToAvatarDataUrl(file: File, max = 512, quality = 0.82): Promise<string> {
  const dataUrl = await new Promise<string>((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result));
    r.onerror = () => rej(r.error);
    r.readAsDataURL(file);
  });
  const img = await new Promise<HTMLImageElement>((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = () => rej(new Error("Invalid image"));
    i.src = dataUrl;
  });
  const scale = Math.min(1, max / Math.max(img.width, img.height));
  const w = Math.round(img.width * scale);
  const h = Math.round(img.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, w, h);
  return canvas.toDataURL("image/jpeg", quality);
}

function ProfileEditPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [verif, setVerif] = useState<VerifRow | null>(null);
  const [verifOpen, setVerifOpen] = useState(false);
  const [vForm, setVForm] = useState({ full_name: "", id_number: "", note: "" });
  const [vSubmitting, setVSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) { navigate({ to: "/auth" }); return; }
    if (user) { load(); loadVerif(); }
  }, [user, loading]);

  async function load() {
    if (!user) return;
    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
    if (data) {
      setProfile(data as Profile);
    } else {
      const seed: Profile = {
        id: user.id,
        full_name: (user.user_metadata as any)?.full_name ?? "",
        phone: (user.user_metadata as any)?.phone ?? "",
        age: null, city: "", avatar_url: null, gender: null,
      };
      await supabase.from("profiles").insert({ id: user.id, full_name: seed.full_name });
      setProfile(seed);
    }
  }

  async function loadVerif() {
    if (!user) return;
    const { data } = await supabase
      .from("verification_requests" as any)
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    setVerif((data ?? null) as VerifRow | null);
  }

  async function onPickAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !user || !profile) return;
    if (!file.type.startsWith("image/")) return toast.error("اختر ملف صورة");
    setUploading(true);
    try {
      const dataUrl = await fileToAvatarDataUrl(file);
      const { error } = await supabase.from("profiles").update({ avatar_url: dataUrl }).eq("id", user.id);
      if (error) throw error;
      setProfile({ ...profile, avatar_url: dataUrl });
      toast.success("تم تحديث الصورة");
    } catch (err: any) {
      toast.error(err?.message ?? "تعذر تحديث الصورة");
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    if (!user || !profile) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      full_name: profile.full_name,
      phone: profile.phone,
      age: profile.age,
      city: profile.city,
      gender: profile.gender as any,
    }).eq("id", user.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("تم حفظ التغييرات");
  }

  async function submitVerification() {
    if (!user) return;
    if (!vForm.full_name.trim()) return toast.error("أدخل الاسم الكامل كما في الهوية");
    setVSubmitting(true);
    const { error } = await supabase.from("verification_requests" as any).insert({
      user_id: user.id,
      full_name: vForm.full_name.trim(),
      id_number: vForm.id_number.trim() || null,
      note: vForm.note.trim() || null,
    });
    setVSubmitting(false);
    if (error) return toast.error(error.message);
    toast.success("تم إرسال طلب التوثيق، سنراجعه قريباً");
    setVerifOpen(false);
    setVForm({ full_name: "", id_number: "", note: "" });
    loadVerif();
  }

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-primary" />
      </div>
    );
  }

  const initial = (profile.full_name || user?.email || "?").trim().charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-background pb-36" dir="rtl">
      <div className="gradient-hero pt-12 pb-16 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-60 h-60 bg-accent/20 rounded-full blur-3xl" />
        <div className="relative flex items-center justify-between mb-4">
          <Link to="/profile" className="w-10 h-10 rounded-full glass flex items-center justify-center text-white">
            <ArrowRight size={18} />
          </Link>
          <h1 className="text-white font-black text-lg">تعديل الملف الشخصي</h1>
          <div className="w-10" />
        </div>

        <div className="relative flex flex-col items-center">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="relative w-28 h-28 rounded-full bg-white/20 backdrop-blur border-4 border-white/50 shadow-glow overflow-hidden">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-4xl font-black">{initial}</div>
            )}
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute bottom-1 left-1 w-9 h-9 rounded-full bg-primary text-primary-foreground shadow-glow flex items-center justify-center border-2 border-white"
              disabled={uploading}
            >
              {uploading ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPickAvatar} />
          </motion.div>
          <p className="text-white/90 text-xs mt-2">اضغط على أيقونة الكاميرا لتغيير الصورة</p>
        </div>
      </div>

      <div className="px-4 -mt-8 relative z-10 space-y-4">
        {/* Verification card */}
        <div className="bg-card rounded-3xl p-5 shadow-card border border-border/40">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 rounded-2xl gradient-primary text-primary-foreground flex items-center justify-center shadow-glow">
              <ShieldCheck size={20} />
            </div>
            <div className="flex-1">
              <h3 className="font-black text-sm">توثيق الحساب</h3>
              <p className="text-[11px] text-muted-foreground">احصل على شارة التوثيق الزرقاء</p>
            </div>
            <VerifBadge status={verif?.status} />
          </div>
          {verif ? (
            <div className="rounded-2xl bg-muted/50 p-3 text-xs space-y-1">
              <p><span className="font-bold">الاسم:</span> {verif.full_name}</p>
              {verif.id_number && <p><span className="font-bold">رقم الهوية:</span> {verif.id_number}</p>}
              {verif.admin_note && <p className="text-destructive"><span className="font-bold">ملاحظة الإدارة:</span> {verif.admin_note}</p>}
              <p className="text-muted-foreground">أُرسل في {new Date(verif.created_at).toLocaleDateString("ar")}</p>
              {verif.status === "rejected" && (
                <button onClick={() => setVerifOpen(true)} className="mt-2 text-primary font-bold">إعادة الإرسال</button>
              )}
            </div>
          ) : (
            <button onClick={() => setVerifOpen(true)}
              className="w-full mt-1 gradient-primary text-primary-foreground py-3 rounded-2xl font-bold text-sm shadow-glow">
              طلب التوثيق الآن
            </button>
          )}
        </div>

        {/* Basic info */}
        <div className="bg-card rounded-3xl p-5 shadow-card border border-border/40 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <UserIcon size={16} className="text-primary" />
            <h3 className="font-black text-sm">المعلومات الأساسية</h3>
          </div>
          <Field label="الاسم الكامل">
            <input value={profile.full_name ?? ""} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
              placeholder="اكتب اسمك الكامل" className="w-full bg-muted rounded-2xl px-4 py-3 text-sm outline-none" />
          </Field>
          <Field label="رقم الهاتف">
            <input value={profile.phone ?? ""} onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              placeholder="+9677xxxxxxxx" dir="ltr" className="w-full bg-muted rounded-2xl px-4 py-3 text-sm outline-none text-right" />
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="العمر">
              <input type="number" value={profile.age ?? ""} onChange={(e) => setProfile({ ...profile, age: e.target.value ? Number(e.target.value) : null })}
                placeholder="—" className="w-full bg-muted rounded-2xl px-4 py-3 text-sm outline-none" />
            </Field>
            <Field label="الجنس">
              <select value={profile.gender ?? ""} onChange={(e) => setProfile({ ...profile, gender: e.target.value || null })}
                className="w-full bg-muted rounded-2xl px-4 py-3 text-sm font-bold outline-none">
                <option value="">—</option>
                <option value="male">ذكر</option>
                <option value="female">أنثى</option>
              </select>
            </Field>
          </div>
          <Field label="المدينة">
            <input value={profile.city ?? ""} onChange={(e) => setProfile({ ...profile, city: e.target.value })}
              placeholder="مثال: صنعاء" className="w-full bg-muted rounded-2xl px-4 py-3 text-sm outline-none" />
          </Field>
          <Field label="البريد الإلكتروني">
            <input value={user?.email ?? ""} disabled dir="ltr"
              className="w-full bg-muted/50 rounded-2xl px-4 py-3 text-sm outline-none text-muted-foreground text-right" />
          </Field>

          <button onClick={save} disabled={saving}
            className="w-full gradient-primary text-primary-foreground py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-glow disabled:opacity-60">
            {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} حفظ التغييرات
          </button>
        </div>
      </div>

      {verifOpen && (
        <div className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm flex items-end" onClick={() => setVerifOpen(false)}>
          <div className="bg-card w-full rounded-t-3xl p-5 pb-8 space-y-3 max-h-[92vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-black text-lg">طلب توثيق الحساب</h3>
              <button onClick={() => setVerifOpen(false)} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <XCircle size={16} />
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              أدخل بياناتك كما تظهر في وثيقة الهوية الرسمية. سيراجع فريقنا الطلب خلال 24-48 ساعة.
            </p>
            <input value={vForm.full_name} onChange={(e) => setVForm({ ...vForm, full_name: e.target.value })}
              placeholder="الاسم الرباعي كما في الهوية" className="w-full bg-muted rounded-2xl px-4 py-3 text-sm outline-none" />
            <input value={vForm.id_number} onChange={(e) => setVForm({ ...vForm, id_number: e.target.value })}
              placeholder="رقم الهوية / جواز السفر" dir="ltr" className="w-full bg-muted rounded-2xl px-4 py-3 text-sm outline-none text-right" />
            <textarea value={vForm.note} onChange={(e) => setVForm({ ...vForm, note: e.target.value })}
              rows={3} placeholder="ملاحظات إضافية (اختياري)"
              className="w-full bg-muted rounded-2xl px-4 py-3 text-sm outline-none resize-none" />
            <button onClick={submitVerification} disabled={vSubmitting}
              className="w-full gradient-primary text-primary-foreground py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-glow disabled:opacity-60">
              {vSubmitting ? <Loader2 className="animate-spin" size={16} /> : <ShieldCheck size={16} />} إرسال الطلب
            </button>
          </div>
        </div>
      )}

      {!verifOpen && <BottomNav />}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[11px] font-bold text-muted-foreground">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function VerifBadge({ status }: { status?: string }) {
  if (status === "approved")
    return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-success/15 text-success text-[10px] font-black"><BadgeCheck size={12} /> موثّق</span>;
  if (status === "pending")
    return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-warning/15 text-warning text-[10px] font-black"><Clock size={12} /> قيد المراجعة</span>;
  if (status === "rejected")
    return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-destructive/15 text-destructive text-[10px] font-black"><XCircle size={12} /> مرفوض</span>;
  return null;
}
