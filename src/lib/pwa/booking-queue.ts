import { supabase } from "@/integrations/supabase/client";

/**
 * Offline queue for booking submissions.
 * Bookings created without a connection are stored locally and flushed
 * automatically once the browser reports the network is back.
 */
const KEY = "sehati:booking-queue:v1";

export type QueuedBooking = {
  localId: string;
  payload: Record<string, any>;
  createdAt: number;
  attempts: number;
  lastError?: string;
};

type Listener = (items: QueuedBooking[]) => void;
const listeners = new Set<Listener>();

function read(): QueuedBooking[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(KEY) ?? "[]") as QueuedBooking[];
  } catch {
    return [];
  }
}

function write(items: QueuedBooking[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    /* ignore */
  }
  listeners.forEach((fn) => fn(items));
}

export function getQueuedBookings() {
  return read();
}

export function subscribeQueue(fn: Listener) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function enqueueBooking(payload: Record<string, any>): QueuedBooking {
  const item: QueuedBooking = {
    localId: `local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    payload,
    createdAt: Date.now(),
    attempts: 0,
  };
  write([...read(), item]);
  return item;
}

export function removeQueued(localId: string) {
  write(read().filter((i) => i.localId !== localId));
}

let flushing = false;

/** Try to send every queued booking. Returns how many succeeded. */
export async function flushBookingQueue(): Promise<number> {
  if (typeof window === "undefined" || flushing) return 0;
  if (!navigator.onLine) return 0;
  const items = read();
  if (items.length === 0) return 0;

  flushing = true;
  let sent = 0;
  const remaining: QueuedBooking[] = [];

  try {
    for (const item of items) {
      const { error } = await supabase.from("bookings").insert(item.payload as any);
      if (error) {
        remaining.push({ ...item, attempts: item.attempts + 1, lastError: error.message });
      } else {
        sent += 1;
      }
    }
    write(remaining);
  } finally {
    flushing = false;
  }
  return sent;
}
