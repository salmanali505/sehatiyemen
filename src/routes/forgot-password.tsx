import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, ArrowRight, ArrowLeft, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { SehatiLogo } from "@/components/SehatiLogo";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "استعادة كلمة المرور | صحتي" },
      { name: "description", content: "استعد الوصول إلى حسابك في صحتي عبر رابط إعادة تعيين كلمة المرور المرسل إلى بريدك." },
      { property: "og:title", content: "استعادة كلمة المرور | صحتي" },
      { property: "og:description", content: "استعد الوصول إلى حسابك في صحتي عبر رابط إعادة تعيين كلمة المرور." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await requestPasswordReset(email);
    setLoading(false);
    if (error) return toast.error(error.message);
    setSent(true);
    toast.success("تم إرسال رابط الاستعادة إلى بريدك");
  }

  return (
    <div className="min-h-screen gradient-hero relative overflow-hidden flex flex-col">
      <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-primary-glow/30 blur-3xl" />
      <div className="relative z-10 px-6 pt-12 pb-4">
        <Link to="/auth" className="inline-flex items-center gap-1 text-white/80 text-sm font-bold">
          <ArrowRight size={16} /> العودة لتسجيل الدخول
        </Link>
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pb-10">
        <SehatiLogo size={64} />
        <h1 className="mt-4 text-2xl font-black text-white" style={{ fontFamily: "Tajawal" }}>
          استعادة كلمة المرور
        </h1>

        <motion.form
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          onSubmit={onSubmit}
          className="mt-8 w-full max-w-sm bg-card rounded-3xl p-6 shadow-float space-y-4"
        >
          {sent ? (
            <div className="text-center space-y-3">
              <div className="mx-auto w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center shadow-glow">
                <KeyRound className="text-primary-foreground" />
              </div>
              <p className="text-sm font-bold">تحقق من بريدك الإلكتروني</p>
              <p className="text-xs text-muted-foreground">
                أرسلنا رابطاً إلى <span className="font-bold">{email}</span> لإعادة تعيين كلمة المرور.
              </p>
              <button
                type="button"
                onClick={() => navigate({ to: "/auth" })}
                className="w-full gradient-primary text-primary-foreground font-black py-3 rounded-2xl shadow-glow"
              >
                العودة لتسجيل الدخول
              </button>
            </div>
          ) : (
            <>
              <p className="text-xs text-muted-foreground">
                أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور.
              </p>
              <div className="flex items-center gap-2 bg-muted rounded-2xl px-4 py-3">
                <Mail size={18} className="text-muted-foreground" />
                <input
                  type="email"
                  required
                  placeholder="البريد الإلكتروني"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-sm font-medium placeholder:text-muted-foreground"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full gradient-primary text-primary-foreground font-black py-3.5 rounded-2xl shadow-glow flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? "جاري الإرسال..." : "إرسال رابط الاستعادة"}
                <ArrowLeft size={16} />
              </button>
            </>
          )}
        </motion.form>
      </div>
    </div>
  );
}
