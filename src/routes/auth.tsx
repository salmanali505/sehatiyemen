import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, User, Phone, ArrowRight, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { SehatiLogo } from "@/components/SehatiLogo";
import { lovable } from "@/integrations/lovable";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "تسجيل الدخول | صحتي" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { signIn, signUp, user } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [name, setName] = useState(""); const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (user) navigate({ to: "/" }); }, [user, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try {
      if (mode === "signin") {
        const { error } = await signIn(email, password);
        if (error) { toast.error(error.message); return; }
        toast.success("تم تسجيل الدخول بنجاح");
        navigate({ to: "/" });
      } else {
        if (!name || !phone) { toast.error("يرجى تعبئة جميع الحقول"); return; }
        const { error } = await signUp(email, password, name, phone);
        if (error) { toast.error(error.message); return; }
        toast.success("تم إنشاء الحساب بنجاح");
        navigate({ to: "/" });
      }
    } finally { setLoading(false); }
  };

  const onGoogle = async () => {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (r.error) toast.error("فشل تسجيل الدخول بجوجل");
  };

  return (
    <div className="min-h-screen gradient-hero relative overflow-hidden flex flex-col">
      <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-primary-glow/30 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-accent/20 blur-3xl" />

      <div className="relative z-10 px-6 pt-12 pb-4">
        <Link to="/" className="inline-flex items-center gap-1 text-white/80 text-sm font-bold">
          <ArrowRight size={16} /> العودة
        </Link>
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pb-10">
        <SehatiLogo size={64} />
        <h1 className="mt-4 text-3xl font-black text-white" style={{ fontFamily: "Tajawal" }}>صحتي</h1>
        <p className="text-white/80 text-sm mt-1">{mode === "signin" ? "أهلاً بعودتك" : "أنشئ حسابك الآن"}</p>

        <motion.form
          initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          onSubmit={onSubmit}
          className="mt-8 w-full max-w-sm bg-card rounded-3xl p-6 shadow-float space-y-3"
        >
          <div className="flex bg-muted rounded-2xl p-1">
            {(["signin", "signup"] as const).map((m) => (
              <button key={m} type="button" onClick={() => setMode(m)}
                className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${mode === m ? "bg-card shadow-soft text-primary" : "text-muted-foreground"}`}>
                {m === "signin" ? "دخول" : "حساب جديد"}
              </button>
            ))}
          </div>

          {mode === "signup" && (
            <>
              <Field icon={User} placeholder="الاسم الكامل" value={name} onChange={setName} />
              <Field icon={Phone} placeholder="رقم الهاتف" value={phone} onChange={setPhone} type="tel" />
            </>
          )}
          <Field icon={Mail} placeholder="البريد الإلكتروني" value={email} onChange={setEmail} type="email" />
          <Field icon={Lock} placeholder="كلمة المرور" value={password} onChange={setPassword} type="password" />

          <button type="submit" disabled={loading}
            className="w-full gradient-primary text-primary-foreground font-black py-3.5 rounded-2xl shadow-glow flex items-center justify-center gap-2 disabled:opacity-50">
            {loading ? "جاري المعالجة..." : (mode === "signin" ? "تسجيل الدخول" : "إنشاء الحساب")}
            <ArrowLeft size={16} />
          </button>

          <div className="flex items-center gap-3 my-2">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">أو</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <button type="button" onClick={onGoogle}
            className="w-full bg-white border border-border text-foreground font-bold py-3 rounded-2xl flex items-center justify-center gap-2 hover:bg-muted">
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            متابعة باستخدام جوجل
          </button>
        </motion.form>
      </div>
    </div>
  );
}

function Field({ icon: Icon, ...p }: { icon: React.ElementType; placeholder: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div className="flex items-center gap-2 bg-muted rounded-2xl px-4 py-3">
      <Icon size={18} className="text-muted-foreground" />
      <input
        type={p.type ?? "text"} placeholder={p.placeholder} value={p.value} onChange={(e) => p.onChange(e.target.value)}
        className="flex-1 bg-transparent outline-none text-sm font-medium placeholder:text-muted-foreground"
        required
      />
    </div>
  );
}
