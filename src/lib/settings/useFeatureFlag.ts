import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Flag = { key: string; enabled: boolean; audience: string };

const cache = new Map<string, Flag>();
const subs = new Set<() => void>();
let loaded = false;
let loading: Promise<void> | null = null;

async function loadAll() {
  if (loaded) return;
  if (loading) return loading;
  loading = supabase
    .from("feature_flags")
    .select("key, enabled, audience")
    .then(({ data }) => {
      (data ?? []).forEach((f: any) => cache.set(f.key, f));
      loaded = true;
      subs.forEach((fn) => fn());
    })
    .then(() => undefined);
  return loading;
}

let channelStarted = false;
function ensureRealtime() {
  if (channelStarted) return;
  channelStarted = true;
  supabase
    .channel("feature_flags")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "feature_flags" },
      (payload: any) => {
        const row = (payload.new ?? payload.old) as Flag | undefined;
        if (!row) return;
        if (payload.eventType === "DELETE") cache.delete(row.key);
        else cache.set(row.key, row);
        subs.forEach((fn) => fn());
      },
    )
    .subscribe();
}

export function useFeatureFlag(key: string, fallback = false) {
  const [, force] = useState(0);
  useEffect(() => {
    ensureRealtime();
    loadAll();
    const fn = () => force((n) => n + 1);
    subs.add(fn);
    return () => {
      subs.delete(fn);
    };
  }, []);
  const flag = cache.get(key);
  return flag ? !!flag.enabled : fallback;
}

export function useAllFlags() {
  const [, force] = useState(0);
  useEffect(() => {
    ensureRealtime();
    loadAll().then(() => force((n) => n + 1));
    const fn = () => force((n) => n + 1);
    subs.add(fn);
    return () => {
      subs.delete(fn);
    };
  }, []);
  return Array.from(cache.values());
}
