import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Subscribe to postgres_changes on a table. Callback fires for any row change.
 * Handles subscription lifecycle safely inside useEffect.
 */
export function useRealtimeTable(
  table: string,
  onChange: () => void,
  filter?: { column: string; value: string | number },
) {
  useEffect(() => {
    const chan = supabase
      .channel(`rt:${table}:${filter?.value ?? "all"}:${Math.random().toString(36).slice(2, 7)}`)
      .on(
        "postgres_changes" as any,
        {
          event: "*",
          schema: "public",
          table,
          ...(filter ? { filter: `${filter.column}=eq.${filter.value}` } : {}),
        },
        () => onChange(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(chan);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table, filter?.column, filter?.value]);
}
