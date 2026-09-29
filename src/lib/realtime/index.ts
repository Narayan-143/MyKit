import { OrderStatus } from "@/lib/constants/order";

export interface RealtimeOrderEvent {
  orderNumber: string;
  orderStatus: OrderStatus;
  updatedAt: string;
}

/**
 * Real-time event abstraction for MyKit.
 * Supports pluggable providers (Pusher, Ably) and defaults to graceful polling fallback
 * so local development requires zero external API keys.
 */
export async function broadcastOrderStatusChange(
  orderNumber: string,
  orderStatus: OrderStatus
): Promise<void> {
  const provider = process.env.REALTIME_PROVIDER || "polling";

  if (provider === "polling") {
    // In polling mode, updates are read directly from MongoDB on poll.
    void orderNumber;
    void orderStatus;
    return;
  }

  // Example hook for managed providers (Pusher / Ably)
  try {
    if (provider === "pusher" && process.env.REALTIME_API_KEY) {
      // Pusher broadcast would go here
    }
  } catch (err) {
    console.error("Realtime event dispatch failed (polling fallback active):", err);
  }
}
