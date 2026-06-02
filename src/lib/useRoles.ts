import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";

export type AppRole = "admin" | "provider" | "patient";

export function useRoles() {
  const { user, loading: authLoading } = useAuth();
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!user) { setRoles([]); setLoading(false); return; }
      setLoading(true);
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
      if (!cancelled) {
        setRoles(((data ?? []) as { role: AppRole }[]).map((r) => r.role));
        setLoading(false);
      }
    }
    if (!authLoading) load();
    return () => { cancelled = true; };
  }, [user, authLoading]);

  return {
    roles,
    loading: loading || authLoading,
    isAdmin: roles.includes("admin"),
    isProvider: roles.includes("provider"),
  };
}
