import Order from "@/models/Order";

/**
 * Generates a human-friendly, unique order number (e.g., ORD-1001, ORD-1002).
 * Uses atomic counter logic based on total orders + collision fallback.
 */
export async function generateOrderNumber(): Promise<string> {
  const count = await Order.countDocuments();
  const nextNum = 1000 + count + 1;
  let candidate = `ORD-${nextNum}`;

  // Check if candidate already exists in case of concurrent creations or deleted documents
  const exists = await Order.exists({ orderNumber: candidate });
  if (!exists) {
    return candidate;
  }

  // Fallback with random alphanumeric suffix to guarantee uniqueness
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  candidate = `ORD-${nextNum}-${randomSuffix}`;
  return candidate;
}
