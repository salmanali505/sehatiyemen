import { supabase } from "@/integrations/supabase/client";

/**
 * Offline snapshot of essential data (cities, specialties, ads, offers, settings).
 * Warmed at first launch so the app can render meaningful content with no network.
 */
const KEY = "sehati:offline-snapshot:v1";

export type OfflineSnapshot = {
  at: number;
  cities: any[];
  specialties: any[];
  offers: any[];
  ads: any[];
  settings: Record<string, any> | null;
};

export function readSnapshot(): OfflineSnapshot | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as OfflineSnapshot) : null;
  } catch {
    return null;
  }
}

function write(snap: OfflineSnapshot) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(snap));
  } catch {
    /* quota — ignore */
  }
}

let warming = false;

/** Fetch + persist essential data. Safe to call repeatedly; no-ops while offline. */
export async function warmOfflineCache() {
  if (typeof window === "undefined" || warming) return;
  if (!navigator.onLine) return;
  warming = true;
  try {
    const nowIso = new Date().toISOString();
    const [cities, specialties, offers, ads, settings] = await Promise.all([
      supabase.from("cities").select("*").eq("active", true).order("sort_order"),
      supabase
        .from("specialties")
        .select("id,name_ar,icon,kind,active,sort_order")
        .eq("active", true)
        .order("sort_order"),
      supabase
        .from("offers")
        .select("id,title,description,discount_percent,discount_amount")
        .eq("active", true)
        .eq("approved", true)
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("ads")
        .select("title,subtitle,image_url,link_url,priority")
        .eq("placement", "home_banner")
        .eq("active", true)
        .order("priority", { ascending: false })
        .limit(6),
      supabase.from("system_settings").select("value").eq("key", "app").maybeSingle(),
    ]);

    write({
      at: Date.parse(nowIso),
      cities: cities.data ?? [],
      specialties: specialties.data ?? [],
      offers: (offers.data as any[]) ?? [],
      ads: (ads.data as any[]) ?? [],
      settings: (settings.data?.value as any) ?? null,
    });
  } catch {
    /* best effort */
  } finally {
    warming = false;
  }
}
