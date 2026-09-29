import { ApiResponse } from "@/types/api";
import { CreateOrderInput, Order, OrderTrackingInfo } from "@/types/order";

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  const res = await fetch("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const data: ApiResponse<Order> = await res.json();

  if (!res.ok || !data.success || !data.data) {
    throw new Error(data.error?.message || "Failed to create order");
  }

  return data.data;
}

export async function fetchOrderTracking(orderNumber: string): Promise<OrderTrackingInfo> {
  const res = await fetch(`/api/orders/${orderNumber}`, { cache: "no-store" });
  const data: ApiResponse<OrderTrackingInfo> = await res.json();

  if (!res.ok || !data.success || !data.data) {
    throw new Error(data.error?.message || "Order not found");
  }

  return data.data;
}
