import { describe, it, expect } from "vitest";
import { checkoutFormSchema } from "@/lib/validation/checkout";
import { createOrderSchema } from "@/lib/validation/order";

describe("Checkout and Order Validation Schemas", () => {
  const validCustomer = {
    name: "Aarav Sharma",
    mobile: "9876543210",
    email: "aarav.sharma@example.com",
    address: "Flat 402, Green Glen Layout, Bellandur, Bengaluru - 560103",
    paymentMethod: "Demo UPI" as const,
  };

  it("should validate a correct checkout form submission", () => {
    const result = checkoutFormSchema.safeParse(validCustomer);
    expect(result.success).toBe(true);
  });

  it("should reject an invalid Indian mobile number", () => {
    // Too short
    expect(
      checkoutFormSchema.safeParse({ ...validCustomer, mobile: "987654" }).success
    ).toBe(false);

    // Starts with invalid digit (e.g. 5)
    expect(
      checkoutFormSchema.safeParse({ ...validCustomer, mobile: "5876543210" }).success
    ).toBe(false);

    // Contains characters
    expect(
      checkoutFormSchema.safeParse({ ...validCustomer, mobile: "987654321a" }).success
    ).toBe(false);
  });

  it("should reject an invalid email address", () => {
    expect(
      checkoutFormSchema.safeParse({ ...validCustomer, email: "invalid-email" }).success
    ).toBe(false);
  });

  it("should reject an address that is too short", () => {
    expect(
      checkoutFormSchema.safeParse({ ...validCustomer, address: "Home" }).success
    ).toBe(false);
  });

  it("should validate createOrderSchema requiring at least one cart item", () => {
    const validOrder = {
      customer: {
        name: validCustomer.name,
        mobile: validCustomer.mobile,
        email: validCustomer.email,
        address: validCustomer.address,
      },
      items: [{ menuItemId: "item-123", quantity: 2 }],
      paymentMethod: "Cash on Delivery" as const,
    };

    expect(createOrderSchema.safeParse(validOrder).success).toBe(true);

    // Empty items array should fail
    const emptyOrder = { ...validOrder, items: [] };
    expect(createOrderSchema.safeParse(emptyOrder).success).toBe(false);

    // Invalid item quantity should fail
    const zeroQuantityOrder = {
      ...validOrder,
      items: [{ menuItemId: "item-123", quantity: 0 }],
    };
    expect(createOrderSchema.safeParse(zeroQuantityOrder).success).toBe(false);
  });
});
