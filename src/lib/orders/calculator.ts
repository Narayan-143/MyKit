import MenuItem from "@/models/MenuItem";
import { TAX_RATE } from "@/lib/constants/order";
import { IOrderItem } from "@/models/Order";

export interface CalculatedOrderResult {
  subtotal: number;
  tax: number;
  total: number;
  verifiedItems: IOrderItem[];
}

/**
 * Calculates order totals server-side using trusted database prices.
 * Validates item existence, availability, and non-empty cart.
 */
export async function calculateOrderTotals(
  rawItems: { menuItemId: string; quantity: number }[]
): Promise<CalculatedOrderResult> {
  if (!rawItems || rawItems.length === 0) {
    throw new Error("Cart is empty");
  }

  const verifiedItems: IOrderItem[] = [];
  let subtotal = 0;

  for (const item of rawItems) {
    if (!item.quantity || item.quantity <= 0) {
      throw new Error(`Invalid quantity for item ${item.menuItemId}`);
    }

    const menuItem = await MenuItem.findById(item.menuItemId).lean();
    if (!menuItem) {
      throw new Error(`Menu item not found: ${item.menuItemId}`);
    }

    if (!menuItem.available) {
      throw new Error(`"${menuItem.name}" is currently unavailable`);
    }

    const itemTotal = menuItem.price * item.quantity;
    subtotal += itemTotal;

    verifiedItems.push({
      menuItemId: menuItem._id.toString(),
      name: menuItem.name,
      price: menuItem.price,
      quantity: item.quantity,
      image: menuItem.image,
    });
  }

  // Tax calculation (e.g. 5% GST rounded to nearest rupee)
  const tax = Math.round(subtotal * TAX_RATE);
  const total = subtotal + tax;

  return {
    subtotal,
    tax,
    total,
    verifiedItems,
  };
}
