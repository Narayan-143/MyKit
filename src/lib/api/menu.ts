import { ApiResponse } from "@/types/api";
import { MenuItem, MenuQueryParams, MenuResponse } from "@/types/menu";

export async function fetchMenuItems(params?: MenuQueryParams): Promise<MenuResponse> {
  const query = new URLSearchParams();
  if (params?.search) query.set("search", params.search);
  if (params?.category && params.category !== "All") query.set("category", params.category);
  if (params?.page) query.set("page", params.page.toString());
  if (params?.limit) query.set("limit", params.limit.toString());
  if (params?.featured !== undefined) query.set("featured", params.featured.toString());

  const url = `/api/menu?${query.toString()}`;
  const res = await fetch(url, { cache: "no-store" });
  const data: ApiResponse<MenuResponse> = await res.json();

  if (!res.ok || !data.success || !data.data) {
    throw new Error(data.error?.message || "Failed to load menu items");
  }

  return data.data;
}

export async function fetchMenuItemById(id: string): Promise<MenuItem> {
  const res = await fetch(`/api/menu/${id}`, { cache: "no-store" });
  const data: ApiResponse<MenuItem> = await res.json();

  if (!res.ok || !data.success || !data.data) {
    throw new Error(data.error?.message || "Failed to load menu item");
  }

  return data.data;
}
