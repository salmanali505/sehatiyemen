import { motion } from "framer-motion";
import logo from "@/assets/sehati-logo.png";

export function SplashScreen() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      transition={{ duration: 0.6 }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center gradient-hero overflow-hidden"
    >
      {/* Soft glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-primary-glow/30 blur-3xl animate-float-soft" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-accent/20 blur-3xl animate-float-soft" style={{ animationDelay: "1s" }} />

      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 flex flex-col items-center gap-6"
      >
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-white/20 blur-2xl animate-heartbeat" />
          <img src={logo} alt="صحتي" className="relative w-32 h-32 object-contain drop-shadow-2xl animate-heartbeat" />
        </div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-center"
        >
          <h1 className="text-6xl font-black text-white" style={{ fontFamily: "Tajawal" }}>صحتي</h1>
          <p className="mt-2 text-sm font-semibold tracking-[0.4em] text-white/80">SEHATI</p>
        </motion.div>

        {/* EKG line */}
        <motion.svg
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          width="240" height="40" viewBox="0 0 240 40" fill="none"
        >
          <path
            d="M0 20 L60 20 L70 5 L80 35 L90 10 L100 30 L110 20 L240 20"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="animate-ekg"
          />
        </motion.svg>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-white/70 text-sm font-medium"
        >
          حجز مواعيدك الطبية بسهولة
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
