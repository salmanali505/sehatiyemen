import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, ShieldAlert } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/portal/provider/$token")({
  head: () => ({ meta: [{ title: "Provider Portal" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: ProviderGate,
});

function ProviderGate() {
  const { token } = Route.useParams();
  const nav = useNavigate();
  const [state, setState] = useState<"checking" | "invalid" | "ok">("checking");

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("access_tokens")
        .select("id, kind, active, expires_at, provider_id")
        .eq("token", token)
        .eq("kind", "provider")
        .maybeSingle();
      if (!data || !data.active || (data.expires_at && new Date(data.expires_at) < new Date())) {
        setState("invalid"); return;
      }
      sessionStorage.setItem("sehati.providerToken", token);
      if (data.provider_id) sessionStorage.setItem("sehati.providerId", data.provider_id);
      await supabase.from("access_tokens").update({ last_used_at: new Date().toISOString() }).eq("id", data.id);
      setState("ok");
      nav({ to: "/dashboard", replace: true });
    })();
  }, [token, nav]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background" dir="rtl">
      {state === "invalid" ? (
        <div className="text-center px-6">
          <ShieldAlert className="mx-auto text-destructive mb-3" size={48} />
          <h1 className="font-extrabold text-2xl">رابط منتهي الصلاحية</h1>
          <p className="text-sm text-muted-foreground mt-2">تواصل مع إدارة صحتي للحصول على رابط جديد.</p>
        </div>
      ) : (
        <div className="text-center">
          <Loader2 className="mx-auto animate-spin text-primary mb-3" size={32} />
          <p className="text-sm text-muted-foreground">جارٍ فتح لوحة المزوّد...</p>
        </div>
      )}
    </div>
  );
}
