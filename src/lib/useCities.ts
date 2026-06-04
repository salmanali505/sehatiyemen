import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type City = {
  id: string;
  name_ar: string;
  name_en: string;
  sort_order: number;
  active: boolean;
};

const STORAGE_KEY = "sehati.city";

export function useCities() {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancel = false;
    (async () => {
      const { data } = await supabase
        .from("cities")
        .select("*")
        .eq("active", true)
        .order("sort_order", { ascending: true });
      if (!cancel) {
        setCities((data ?? []) as City[]);
        setLoading(false);
      }
    })();
    return () => { cancel = true; };
  }, []);

  return { cities, loading };
}

export function useSelectedCity() {
  const [city, setCityState] = useState<string>("صنعاء");

  // Read from localStorage only after mount → keeps SSR/client markup identical.
  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (stored && stored !== city) setCityState(stored);
    const handler = (e: Event) => {
      const ce = e as CustomEvent<string>;
      if (ce.detail) setCityState(ce.detail);
    };
    window.addEventListener("sehati:city-changed", handler);
    return () => window.removeEventListener("sehati:city-changed", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setCity = useCallback((c: string) => {
    setCityState(c);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, c);
      window.dispatchEvent(new CustomEvent("sehati:city-changed", { detail: c }));
    }
  }, []);

  return { city, setCity };
}
