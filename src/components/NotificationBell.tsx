import { Bell } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";

export function NotificationBell() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!user) { setUnread(0); return; }
    let cancel = false;
    const load = async () => {
      const { count } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("read", false);
      if (!cancel) setUnread(count ?? 0);
    };
    load();
    const channel = supabase
      .channel(`notif-${user.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` }, load)
      .subscribe();
    return () => { cancel = true; supabase.removeChannel(channel); };
  }, [user]);

  return (
    <button
      type="button"
      onClick={() => navigate({ to: "/notifications" })}
      aria-label="الإشعارات"
      className="relative w-10 h-10 rounded-full glass flex items-center justify-center shadow-card"
    >
      <Bell size={18} className="text-primary" />
      {unread > 0 && (
        <motion.span
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          className="absolute -top-1 -left-1 min-w-[18px] h-[18px] px-1 bg-destructive text-destructive-foreground text-[10px] font-extrabold rounded-full flex items-center justify-center border-2 border-background pointer-events-none"
        >
          {unread > 99 ? "99+" : unread}
        </motion.span>
      )}
    </button>
  );
}
