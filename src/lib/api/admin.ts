import { ApiResponse, AdminStats } from "@/types/api";
import { Order } from "@/types/order";
import { OrderStatus, PaymentStatus } from "@/lib/constants/order";

export async function loginAdmin(email: string, password: string): Promise<void> {
  const res = await fetch("/api/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data: ApiResponse = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error?.message || "Invalid credentials");
  }
}

export async function logoutAdmin(): Promise<void> {
  await fetch("/api/admin/logout", { method: "POST" });
}

export async function fetchAdminOrders(params?: {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<{ orders: Order[]; total: number; page: number; totalPages: number }> {
  const query = new URLSearchParams();
  if (params?.status && params.status !== "All") query.set("status", params.status);
  if (params?.search) query.set("search", params.search);
  if (params?.page) query.set("page", params.page.toString());
  if (params?.limit) query.set("limit", params.limit.toString());

  const res = await fetch(`/api/admin/orders?${query.toString()}`, { cache: "no-store" });
  const data: ApiResponse<{ orders: Order[]; total: number; page: number; totalPages: number }> =
    await res.json();

  if (!res.ok || !data.success || !data.data) {
    throw new Error(data.error?.message || "Failed to load orders");
  }

  return data.data;
}

export async function fetchAdminOrderById(id: string): Promise<Order> {
  const res = await fetch(`/api/admin/orders/${id}`, { cache: "no-store" });
  const data: ApiResponse<Order> = await res.json();

  if (!res.ok || !data.success || !data.data) {
    throw new Error(data.error?.message || "Order not found");
  }

  return data.data;
}

export async function updateOrderStatus(
  id: string,
  orderStatus: OrderStatus,
  paymentStatus?: PaymentStatus
): Promise<Order> {
  const res = await fetch(`/api/admin/orders/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderStatus, paymentStatus }),
  });

  const data: ApiResponse<Order> = await res.json();
  if (!res.ok || !data.success || !data.data) {
    throw new Error(data.error?.message || "Failed to update order status");
  }

  return data.data;
}

export async function fetchAdminStats(): Promise<{
  stats: AdminStats;
  recentOrders: Order[];
}> {
  const res = await fetch("/api/admin/stats", { cache: "no-store" });
  const data: ApiResponse<{ stats: AdminStats; recentOrders: Order[] }> = await res.json();

  if (!res.ok || !data.success || !data.data) {
    throw new Error(data.error?.message || "Failed to fetch admin stats");
  }

  return data.data;
}
