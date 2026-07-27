import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, User, Phone, ArrowRight, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { SehatiLogo } from "@/components/SehatiLogo";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "تسجيل الدخول | صحتي" }] }),
  component: AuthPage,
});


function AuthPage() {
  const navigate = useNavigate();
  const { signIn, signUp, user } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [accountType, setAccountType] = useState<AccountType>("patient");
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
        if (password.length < 6) { toast.error("كلمة المرور يجب أن تكون 6 أحرف على الأقل"); return; }
        if (password !== confirmPassword) { toast.error("كلمة المرور غير متطابقة"); return; }
        const { error, needsVerification } = await signUp(email, password, name, phone, accountType);
        if (error) { toast.error(error.message); return; }
        if (needsVerification) {
          toast.success("تم إرسال رمز التحقق إلى بريدك الإلكتروني");
          navigate({ to: "/verify-email", search: { email } });
        } else {
          toast.success("تم إنشاء الحساب بنجاح");
          navigate({ to: "/" });
        }
      }
    } finally { setLoading(false); }
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
          {mode === "signup" && (
            <Field icon={Lock} placeholder="تأكيد كلمة المرور" value={confirmPassword} onChange={setConfirmPassword} type="password" />
          )}

          {mode === "signin" && (
            <div className="text-end">
              <Link to="/forgot-password" className="text-xs font-bold text-primary">
                نسيت كلمة المرور؟
              </Link>
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full gradient-primary text-primary-foreground font-black py-3.5 rounded-2xl shadow-glow flex items-center justify-center gap-2 disabled:opacity-50">
            {loading ? "جاري المعالجة..." : (mode === "signin" ? "تسجيل الدخول" : "إنشاء الحساب")}
            <ArrowLeft size={16} />
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
