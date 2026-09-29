import { describe, it, expect } from "vitest";
import { isValidStatusTransition, ORDER_STATUSES, TAX_RATE } from "@/lib/constants/order";

describe("Order Business Rules and Status Transitions", () => {
  it("should have all 4 required order statuses defined in sequence", () => {
    expect(ORDER_STATUSES).toEqual(["Pending", "Accepted", "Preparing", "Completed"]);
  });

  it("should allow valid forward status transitions", () => {
    expect(isValidStatusTransition("Pending", "Accepted")).toBe(true);
    expect(isValidStatusTransition("Accepted", "Preparing")).toBe(true);
    expect(isValidStatusTransition("Preparing", "Completed")).toBe(true);
    expect(isValidStatusTransition("Pending", "Completed")).toBe(true);
    expect(isValidStatusTransition("Preparing", "Preparing")).toBe(true);
  });

  it("should reject backward status transitions", () => {
    expect(isValidStatusTransition("Completed", "Pending")).toBe(false);
    expect(isValidStatusTransition("Preparing", "Accepted")).toBe(false);
    expect(isValidStatusTransition("Accepted", "Pending")).toBe(false);
  });

  it("should verify tax rate constant is 5%", () => {
    expect(TAX_RATE).toBe(0.05);
  });
});
