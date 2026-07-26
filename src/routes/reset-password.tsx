import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, ArrowRight, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { SehatiLogo } from "@/components/SehatiLogo";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "تعيين كلمة مرور جديدة | صحتي" },
      { name: "description", content: "اختر كلمة مرور جديدة وآمنة لحسابك في تطبيق صحتي." },
      { property: "og:title", content: "تعيين كلمة مرور جديدة | صحتي" },
      { property: "og:description", content: "اختر كلمة مرور جديدة وآمنة لحسابك في تطبيق صحتي." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const { updatePassword } = useAuth();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) return toast.error("كلمة المرور يجب أن تكون 8 أحرف على الأقل");
    if (password !== confirm) return toast.error("كلمة المرور غير متطابقة");
    setLoading(true);
    const { error } = await updatePassword(password);
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("تم تحديث كلمة المرور بنجاح");
    navigate({ to: "/" });
  }

  return (
    <div className="min-h-screen gradient-hero relative overflow-hidden flex flex-col">
      <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-primary-glow/30 blur-3xl" />
      <div className="relative z-10 px-6 pt-12 pb-4">
        <Link to="/auth" className="inline-flex items-center gap-1 text-white/80 text-sm font-bold">
          <ArrowRight size={16} /> تسجيل الدخول
        </Link>
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pb-10">
        <SehatiLogo size={64} />
        <h1 className="mt-4 text-2xl font-black text-white" style={{ fontFamily: "Tajawal" }}>
          كلمة مرور جديدة
        </h1>

        <motion.form
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          onSubmit={onSubmit}
          className="mt-8 w-full max-w-sm bg-card rounded-3xl p-6 shadow-float space-y-3"
        >
          <div className="flex items-center gap-2 bg-muted rounded-2xl px-4 py-3">
            <Lock size={18} className="text-muted-foreground" />
            <input
              type="password"
              required
              placeholder="كلمة المرور الجديدة"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm font-medium placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex items-center gap-2 bg-muted rounded-2xl px-4 py-3">
            <Lock size={18} className="text-muted-foreground" />
            <input
              type="password"
              required
              placeholder="تأكيد كلمة المرور"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm font-medium placeholder:text-muted-foreground"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full gradient-primary text-primary-foreground font-black py-3.5 rounded-2xl shadow-glow flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? "جاري الحفظ..." : "حفظ كلمة المرور"}
            <ArrowLeft size={16} />
          </button>
        </motion.form>
      </div>
    </div>
  );
}
