import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { MailCheck, ArrowRight, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { useAuth } from "@/lib/auth-context";
import { SehatiLogo } from "@/components/SehatiLogo";

const searchSchema = z.object({ email: z.string().email().optional() });

export const Route = createFileRoute("/verify-email")({
  head: () => ({ meta: [{ title: "تحقق من بريدك | صحتي" }] }),
  validateSearch: searchSchema,
  component: VerifyEmailPage,
});

function VerifyEmailPage() {
  const navigate = useNavigate();
  const { email } = Route.useSearch();
  const { verifyEmailOtp, resendEmailOtp, user } = useAuth();
  const [code, setCode] = useState<string[]>(Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (!email) navigate({ to: "/auth" });
  }, [email, navigate]);

  useEffect(() => {
    if (user) navigate({ to: "/" });
  }, [user, navigate]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const handleChange = (idx: number, val: string) => {
    const v = val.replace(/\D/g, "").slice(-1);
    const next = [...code];
    next[idx] = v;
    setCode(next);
    if (v && idx < 5) inputRefs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[idx] && idx > 0) inputRefs.current[idx - 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    e.preventDefault();
    const next = Array(6).fill("");
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setCode(next);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const onVerify = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const token = code.join("");
    if (token.length !== 6 || !email) {
      toast.error("يرجى إدخال الرمز المكوّن من 6 أرقام");
      return;
    }
    setLoading(true);
    try {
      const { error } = await verifyEmailOtp(email, token);
      if (error) {
        const msg = error.message.toLowerCase();
        if (msg.includes("expired")) toast.error("انتهت صلاحية رمز التحقق، يرجى طلب رمز جديد");
        else toast.error("رمز التحقق غير صحيح، يرجى المحاولة مرة أخرى");
        return;
      }
      toast.success("تم التحقق من بريدك بنجاح");
      navigate({ to: "/" });
    } finally {
      setLoading(false);
    }
  };

  const onResend = async () => {
    if (!email || cooldown > 0) return;
    setResending(true);
    try {
      const { error } = await resendEmailOtp(email);
      if (error) { toast.error(error.message); return; }
      toast.success("تم إرسال رمز جديد إلى بريدك");
      setCode(Array(6).fill(""));
      setCooldown(60);
      inputRefs.current[0]?.focus();
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen gradient-hero relative overflow-hidden flex flex-col">
      <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-primary-glow/30 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-accent/20 blur-3xl" />

      <div className="relative z-10 px-6 pt-12 pb-4">
        <Link to="/auth" className="inline-flex items-center gap-1 text-white/80 text-sm font-bold">
          <ArrowRight size={16} /> العودة
        </Link>
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pb-10">
        <SehatiLogo size={64} />
        <h1 className="mt-4 text-2xl font-black text-white" style={{ fontFamily: "Tajawal" }}>تحقق من بريدك الإلكتروني</h1>

        <motion.form
          initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          onSubmit={onVerify}
          className="mt-8 w-full max-w-sm bg-card rounded-3xl p-6 shadow-float space-y-5"
        >
          <div className="flex flex-col items-center text-center gap-2">
            <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center shadow-glow">
              <MailCheck className="text-primary-foreground" size={26} />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              تم إرسال رمز تحقق مكوّن من 6 أرقام إلى
              <br />
              <span className="font-bold text-foreground">{email}</span>
            </p>
          </div>

          <div dir="ltr" className="flex items-center justify-center gap-2">
            {code.map((c, i) => (
              <input
                key={i}
                ref={(el) => { inputRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={c}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onPaste={handlePaste}
                className="w-11 h-14 text-center text-xl font-black rounded-2xl bg-muted border-2 border-transparent focus:border-primary focus:bg-card outline-none transition"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full gradient-primary text-primary-foreground font-black py-3.5 rounded-2xl shadow-glow flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? "جاري التحقق..." : "تأكيد الرمز"}
            <ArrowLeft size={16} />
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={onResend}
              disabled={resending || cooldown > 0}
              className="text-sm font-bold text-primary disabled:text-muted-foreground disabled:cursor-not-allowed"
            >
              {cooldown > 0 ? `إعادة الإرسال بعد ${cooldown}s` : resending ? "جاري الإرسال..." : "إعادة إرسال الرمز"}
            </button>
          </div>
        </motion.form>
      </div>
    </div>
  );
}
