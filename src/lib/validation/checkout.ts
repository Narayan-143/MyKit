import { z } from "zod";
import { PAYMENT_METHODS } from "@/lib/constants/order";

// Indian mobile number regex: 10 digits starting with 6, 7, 8, or 9
const INDIAN_MOBILE_REGEX = /^[6-9]\d{9}$/;

export const checkoutFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must not exceed 50 characters"),
  mobile: z
    .string()
    .trim()
    .regex(INDIAN_MOBILE_REGEX, "Please enter a valid 10-digit Indian mobile number"),
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address"),
  address: z
    .string()
    .trim()
    .min(10, "Please enter a complete delivery address (at least 10 characters)")
    .max(200, "Address is too long"),
  paymentMethod: z.enum(PAYMENT_METHODS, {
    errorMap: () => ({ message: "Please select a payment method" }),
  }),
});

export type CheckoutFormData = z.infer<typeof checkoutFormSchema>;
