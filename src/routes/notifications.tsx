import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Bell, ArrowRight, Calendar, Sparkles, Heart, AlertCircle, Loader2, CheckCheck, Trash2 } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/notifications")({
  head: () => ({ meta: [{ title: "الإشعارات | صحتي" }] }),
  component: NotifPage,
});

type Notif = {
  id: string; title: string; body: string | null; kind: string;
  link: string | null; read: boolean; created_at: string;
};

const ICONS: Record<string, { icon: any; color: string }> = {
  booking: { icon: Calendar, color: "bg-primary/15 text-primary" },
  promo: { icon: Sparkles, color: "bg-warning/15 text-warning" },
  alert: { icon: AlertCircle, color: "bg-destructive/15 text-destructive" },
  system: { icon: Bell, color: "bg-secondary/15 text-secondary" },
};

function relativeTime(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "الآن";
  if (diff < 3600) return `منذ ${Math.floor(diff / 60)} د`;
  if (diff < 86400) return `منذ ${Math.floor(diff / 3600)} س`;
  return `منذ ${Math.floor(diff / 86400)} يوم`;
}

function NotifPage() {
  const { user, loading: authLoading } = useAuth();
  const nav = useNavigate();
  const [items, setItems] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (!authLoading && !user) nav({ to: "/auth" }); }, [authLoading, user, nav]);

  useEffect(() => {
    if (!user) return;
    let cancel = false;
    const load = async () => {
      const { data } = await supabase.from("notifications").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(100);
      if (!cancel) { setItems((data ?? []) as Notif[]); setLoading(false); }
    };
    load();
    const ch = supabase.channel(`np-${user.id}`).on("postgres_changes", { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` }, load).subscribe();
    return () => { cancel = true; supabase.removeChannel(ch); };
  }, [user]);

  async function markAllRead() {
    if (!user) return;
    await supabase.from("notifications").update({ read: true }).eq("user_id", user.id).eq("read", false);
    toast.success("تم تعليم الكل كمقروء");
  }
  async function clearAll() {
    if (!user) return;
    await supabase.from("notifications").delete().eq("user_id", user.id);
    toast.success("تم مسح الإشعارات");
  }
  async function markOne(id: string) {
    await supabase.from("notifications").update({ read: true }).eq("id", id);
  }

  return (
    <div className="min-h-screen bg-background pb-32" dir="rtl">
      <div className="px-4 pt-12 pb-4">
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-3">
            <Link to="/" className="w-10 h-10 rounded-full glass flex items-center justify-center"><ArrowRight size={18} /></Link>
            <h1 className="text-xl font-black">الإشعارات</h1>
          </div>
          {items.length > 0 && (
            <div className="flex items-center gap-1">
              <button onClick={markAllRead} className="p-2 rounded-full hover:bg-muted" title="تعليم الكل كمقروء"><CheckCheck size={18} /></button>
              <button onClick={clearAll} className="p-2 rounded-full hover:bg-muted text-destructive" title="مسح الكل"><Trash2 size={18} /></button>
            </div>
          )}
        </div>
      </div>
      <div className="px-4 space-y-2">
        {loading ? (
          <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground">
            <Bell size={32} className="mx-auto mb-2 opacity-40" />
            لا توجد إشعارات بعد
          </div>
        ) : items.map((n) => {
          const meta = ICONS[n.kind] ?? ICONS.system;
          const Icon = meta.icon;
          return (
            <div
              key={n.id}
              onClick={() => { if (!n.read) markOne(n.id); if (n.link) nav({ to: n.link as any }); }}
              className={`bg-card rounded-2xl p-4 shadow-card flex gap-3 border cursor-pointer transition ${n.read ? "border-border/40 opacity-70" : "border-primary/30"}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${meta.color}`}><Icon size={18} /></div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-sm flex items-center gap-2">
                  {n.title}
                  {!n.read && <span className="w-2 h-2 rounded-full bg-primary" />}
                </h4>
                {n.body && <p className="text-xs text-muted-foreground mt-0.5">{n.body}</p>}
                <p className="text-[10px] text-muted-foreground mt-1">{relativeTime(n.created_at)}</p>
              </div>
            </div>
          );
        })}
      </div>
      <BottomNav />
    </div>
  );
}
