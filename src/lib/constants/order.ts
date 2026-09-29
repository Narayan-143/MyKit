export const ORDER_STATUSES = [
  "Pending",
  "Accepted",
  "Preparing",
  "Completed",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const PAYMENT_METHODS = [
  "Cash on Delivery",
  "Demo Card",
  "Demo UPI",
] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const PAYMENT_STATUSES = [
  "Pending",
  "Paid",
  "Failed",
] as const;

export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const MENU_CATEGORIES = [
  "All",
  "Pizza",
  "Burgers",
  "Pasta",
  "Starters",
  "Indian",
  "Beverages",
  "Desserts",
] as const;

export type MenuCategory = (typeof MENU_CATEGORIES)[number];

export const TAX_RATE = 0.05; // 5% GST for restaurant orders

export function isValidStatusTransition(
  current: OrderStatus,
  next: OrderStatus
): boolean {
  const statusOrder: Record<OrderStatus, number> = {
    Pending: 0,
    Accepted: 1,
    Preparing: 2,
    Completed: 3,
  };

  // Allow forward progression or staying the same
  return statusOrder[next] >= statusOrder[current];
}
