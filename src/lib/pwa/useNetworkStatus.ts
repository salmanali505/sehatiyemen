import { useEffect, useState } from "react";

export type NetworkStatus = {
  online: boolean;
  /** Effective connection type when the browser exposes it (4g, 3g, 2g, slow-2g). */
  effectiveType?: string;
  /** True when online but the connection is very slow / save-data is on. */
  degraded: boolean;
};

function snapshot(): NetworkStatus {
  if (typeof navigator === "undefined") return { online: true, degraded: false };
  const conn = (navigator as any).connection;
  const effectiveType: string | undefined = conn?.effectiveType;
  const degraded =
    !!conn && (conn.saveData === true || effectiveType === "2g" || effectiveType === "slow-2g");
  return { online: navigator.onLine, effectiveType, degraded };
}

export function useNetworkStatus(): NetworkStatus {
  const [state, setState] = useState<NetworkStatus>({ online: true, degraded: false });

  useEffect(() => {
    const update = () => setState(snapshot());
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    const conn = (navigator as any).connection;
    conn?.addEventListener?.("change", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
      conn?.removeEventListener?.("change", update);
    };
  }, []);

  return state;
}
