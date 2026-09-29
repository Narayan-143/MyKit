import { z } from "zod";
import { ORDER_STATUSES, PAYMENT_METHODS, PAYMENT_STATUSES } from "@/lib/constants/order";

const INDIAN_MOBILE_REGEX = /^[6-9]\d{9}$/;

export const createOrderSchema = z.object({
  customer: z.object({
    name: z.string().trim().min(2).max(50),
    mobile: z.string().trim().regex(INDIAN_MOBILE_REGEX),
    email: z.string().trim().email(),
    address: z.string().trim().min(10).max(200),
  }),
  items: z
    .array(
      z.object({
        menuItemId: z.string().min(1, "Menu item ID is required"),
        quantity: z.number().int().min(1, "Quantity must be at least 1").max(50),
      })
    )
    .min(1, "Order must contain at least one item"),
  paymentMethod: z.enum(PAYMENT_METHODS),
});

export type CreateOrderDto = z.infer<typeof createOrderSchema>;

export const updateOrderStatusSchema = z.object({
  orderStatus: z.enum(ORDER_STATUSES),
  paymentStatus: z.enum(PAYMENT_STATUSES).optional(),
});

export type UpdateOrderStatusDto = z.infer<typeof updateOrderStatusSchema>;
