import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

// Simple in-memory cache + subscribers for a `system_settings` key.
type Bag = Record<string, any>;
const cache = new Map<string, Bag>();
const subs = new Map<string, Set<(v: Bag) => void>>();

function notify(key: string, v: Bag) {
  cache.set(key, v);
  subs.get(key)?.forEach((fn) => fn(v));
}

async function fetchKey(key: string): Promise<Bag> {
  const { data } = await supabase
    .from("system_settings")
    .select("value")
    .eq("key", key)
    .maybeSingle();
  return (data?.value as Bag) ?? {};
}

/**
 * Read a settings bag from `system_settings` and stay in sync via realtime.
 * All screens using the same key will re-render when it changes anywhere.
 */
export function useSettings<T extends Bag = Bag>(key: string, defaults?: T) {
  const [value, setValue] = useState<T>({ ...(defaults ?? {}), ...(cache.get(key) ?? {}) } as T);
  const [loading, setLoading] = useState(!cache.has(key));

  useEffect(() => {
    let mounted = true;
    if (!cache.has(key)) {
      fetchKey(key).then((v) => {
        if (!mounted) return;
        const merged = { ...(defaults ?? {}), ...v } as T;
        notify(key, merged);
        setValue(merged);
        setLoading(false);
      });
    }

    const list = subs.get(key) ?? new Set();
    const listener = (v: Bag) => setValue({ ...(defaults ?? {}), ...v } as T);
    list.add(listener);
    subs.set(key, list);

    const channel = supabase
      .channel(`system_settings:${key}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "system_settings", filter: `key=eq.${key}` },
        (payload: any) => {
          const v = (payload.new?.value ?? {}) as Bag;
          notify(key, { ...(defaults ?? {}), ...v });
        },
      )
      .subscribe();

    return () => {
      mounted = false;
      list.delete(listener);
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const save = useCallback(
    async (patch: Partial<T>) => {
      const merged = { ...(cache.get(key) ?? {}), ...patch };
      const { error } = await supabase.from("system_settings").upsert({ key, value: merged });
      if (!error) notify(key, merged);
      return { error };
    },
    [key],
  );

  return { value, loading, save };
}
