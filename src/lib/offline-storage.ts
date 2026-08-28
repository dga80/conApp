import { CreateTransactionInput } from "@/types";

const OFFLINE_QUEUE_KEY = "homebudget_offline_queue_2026";

export function getOfflineQueue(): (CreateTransactionInput & { localId: string; timestamp: number })[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(OFFLINE_QUEUE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Error reading offline queue", e);
    return [];
  }
}

export function addToOfflineQueue(input: CreateTransactionInput) {
  if (typeof window === "undefined") return;
  try {
    const queue = getOfflineQueue();
    const item = {
      ...input,
      localId: `offline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };
    queue.push(item);
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
    return item;
  } catch (e) {
    console.error("Error adding to offline queue", e);
  }
}

export function clearOfflineQueue() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(OFFLINE_QUEUE_KEY);
  } catch (e) {
    console.error("Error clearing offline queue", e);
  }
}

export async function syncOfflineQueue(): Promise<{ synced: number; failed: number }> {
  if (typeof window === "undefined" || !navigator.onLine) {
    return { synced: 0, failed: 0 };
  }

  const queue = getOfflineQueue();
  if (queue.length === 0) return { synced: 0, failed: 0 };

  let synced = 0;
  let failed = 0;
  const remaining = [];

  for (const item of queue) {
    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });

      if (response.ok) {
        synced++;
      } else {
        failed++;
        remaining.push(item);
      }
    } catch (e) {
      failed++;
      remaining.push(item);
    }
  }

  if (remaining.length === 0) {
    clearOfflineQueue();
  } else {
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(remaining));
  }

  return { synced, failed };
}
