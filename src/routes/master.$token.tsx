import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, ShieldAlert } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { useRoles } from "@/lib/useRoles";

export const Route = createFileRoute("/master/$token")({
  head: () => ({ meta: [{ title: "Master Access" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: MasterGate,
});

function MasterGate() {
  const { token } = Route.useParams();
  const nav = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useRoles();
  const [state, setState] = useState<"checking" | "invalid" | "needs_login" | "ok">("checking");

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("access_tokens")
        .select("id, kind, active, expires_at")
        .eq("token", token)
        .eq("kind", "admin")
        .maybeSingle();
      if (error || !data || !data.active || (data.expires_at && new Date(data.expires_at) < new Date())) {
        setState("invalid"); return;
      }
      // bump usage
      await supabase.from("access_tokens").update({ last_used_at: new Date().toISOString(), uses_count: (1 as any) }).eq("id", data.id);
      if (authLoading || roleLoading) return;
      if (!user) { setState("needs_login"); return; }
      if (!isAdmin) { setState("invalid"); return; }
      setState("ok");
      nav({ to: "/admin", replace: true });
    })();
  }, [token, user, authLoading, isAdmin, roleLoading, nav]);

  if (state === "needs_login") {
    if (typeof window !== "undefined") sessionStorage.setItem("sehati.afterLogin", window.location.pathname);
    nav({ to: "/auth" });
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background" dir="rtl">
      {state === "invalid" ? (
        <div className="text-center px-6">
          <ShieldAlert className="mx-auto text-destructive mb-3" size={48} />
          <h1 className="font-extrabold text-2xl">رابط غير صالح</h1>
          <p className="text-sm text-muted-foreground mt-2">انتهت صلاحية الرابط أو تم تعطيله.</p>
        </div>
      ) : (
        <div className="text-center">
          <Loader2 className="mx-auto animate-spin text-primary mb-3" size={32} />
          <p className="text-sm text-muted-foreground">جارٍ التحقق...</p>
        </div>
      )}
    </div>
  );
}
