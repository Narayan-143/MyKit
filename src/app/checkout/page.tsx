"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { checkoutFormSchema, CheckoutFormData } from "@/lib/validation/checkout";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  selectCartItems,
  selectSubtotal,
  selectTax,
  selectGrandTotal,
  clearCart,
} from "@/store/cartSlice";
import { createOrder } from "@/lib/api/orders";
import { formatINR } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/toast-context";
import {
  CreditCard,
  Banknote,
  Smartphone,
  ShieldCheck,
  ShoppingBag,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";
import { PAYMENT_METHODS, PaymentMethod } from "@/lib/constants/order";

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const toast = useToast();

  const items = useAppSelector(selectCartItems);
  const subtotal = useAppSelector(selectSubtotal);
  const tax = useAppSelector(selectTax);
  const total = useAppSelector(selectGrandTotal);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      name: "",
      mobile: "",
      email: "",
      address: "",
      paymentMethod: "Demo UPI",
    },
  });

  const selectedPaymentMethod = watch("paymentMethod");

  const onSubmit = async (formData: CheckoutFormData) => {
    if (items.length === 0) {
      toast.error("Your cart is empty. Please add items before placing an order.");
      return;
    }

    try {
      setIsSubmitting(true);
      setServerError(null);

      const orderPayload = {
        customer: {
          name: formData.name,
          mobile: formData.mobile,
          email: formData.email,
          address: formData.address,
        },
        items: items.map((i) => ({
          menuItemId: i.menuItemId,
          quantity: i.quantity,
        })),
        paymentMethod: formData.paymentMethod as PaymentMethod,
      };

      const createdOrder = await createOrder(orderPayload);

      // Clear Redux & LocalStorage cart
      dispatch(clearCart());
      toast.success("Order placed successfully!");

      // Redirect to Order Tracking Page
      router.push(`/order/${createdOrder.orderNumber}`);
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to place order. Please check your details.";
      setServerError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="py-16 max-w-xl mx-auto px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center mx-auto mb-4 text-orange-600">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Your Cart is Empty</h2>
        <p className="text-sm text-slate-500 mb-6">
          You need at least one dish in your cart to proceed with checkout.
        </p>
        <Link href="/menu">
          <Button variant="primary">Browse Menu</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="py-8 sm:py-12 flex-1">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumb Header */}
        <div>
          <Link
            href="/cart"
            className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1.5 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Cart</span>
          </Link>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Checkout &amp; Delivery Details
          </h1>
          <p className="text-xs text-slate-500">
            Provide your address and contact details to finalize your order.
          </p>
        </div>

        {serverError && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-3 text-sm">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Form Fields Column */}
            <div className="lg:col-span-7 space-y-6">
              {/* Customer Contact Information */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-5">
                <h2 className="text-lg font-bold text-slate-900 pb-2 border-b border-slate-100">
                  1. Contact Information
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="customer-name" className="block text-xs font-bold text-slate-700 mb-1.5">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="customer-name"
                      type="text"
                      placeholder="e.g. Aarav Sharma"
                      {...register("name")}
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 transition ${
                        errors.name
                          ? "border-rose-300 focus:ring-rose-500 bg-rose-50/20"
                          : "border-slate-200 focus:ring-orange-500"
                      }`}
                    />
                    {errors.name && (
                      <p className="text-xs text-rose-600 mt-1 font-medium">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="customer-mobile" className="block text-xs font-bold text-slate-700 mb-1.5">
                      Mobile Number (India) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-xs font-bold text-slate-400">
                        +91
                      </span>
                      <input
                        id="customer-mobile"
                        type="tel"
                        maxLength={10}
                        placeholder="9876543210"
                        {...register("mobile")}
                        className={`w-full pl-12 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 transition ${
                          errors.mobile
                            ? "border-rose-300 focus:ring-rose-500 bg-rose-50/20"
                            : "border-slate-200 focus:ring-orange-500"
                        }`}
                      />
                    </div>
                    {errors.mobile && (
                      <p className="text-xs text-rose-600 mt-1 font-medium">{errors.mobile.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="customer-email" className="block text-xs font-bold text-slate-700 mb-1.5">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="customer-email"
                    type="email"
                    placeholder="aarav@example.com"
                    {...register("email")}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 transition ${
                      errors.email
                        ? "border-rose-300 focus:ring-rose-500 bg-rose-50/20"
                        : "border-slate-200 focus:ring-orange-500"
                    }`}
                  />
                  {errors.email && (
                    <p className="text-xs text-rose-600 mt-1 font-medium">{errors.email.message}</p>
                  )}
                </div>
              </div>

              {/* Delivery Address */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
                <h2 className="text-lg font-bold text-slate-900 pb-2 border-b border-slate-100">
                  2. Delivery Address
                </h2>
                <div>
                  <label htmlFor="customer-address" className="block text-xs font-bold text-slate-700 mb-1.5">
                    Complete Street Address &amp; Landmarks <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    id="customer-address"
                    rows={3}
                    placeholder="Flat / House No., Building Name, Street, Area, Landmark, Bengaluru - 560038"
                    {...register("address")}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 transition resize-none ${
                      errors.address
                        ? "border-rose-300 focus:ring-rose-500 bg-rose-50/20"
                        : "border-slate-200 focus:ring-orange-500"
                    }`}
                  />
                  {errors.address && (
                    <p className="text-xs text-rose-600 mt-1 font-medium">{errors.address.message}</p>
                  )}
                </div>
              </div>

              {/* Demo Payment Selector */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h2 className="text-lg font-bold text-slate-900">3. Payment Method</h2>
                  <span className="text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                    Demo Simulation Mode
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {PAYMENT_METHODS.map((method) => {
                    const isSelected = selectedPaymentMethod === method;
                    return (
                      <div
                        key={method}
                        onClick={() => setValue("paymentMethod", method, { shouldValidate: true })}
                        className={`cursor-pointer p-4 rounded-2xl border text-left transition flex flex-col justify-between gap-3 ${
                          isSelected
                            ? "border-orange-600 bg-orange-50/50 ring-2 ring-orange-500/20"
                            : "border-slate-200 hover:border-slate-300 bg-white"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className={`p-2 rounded-xl ${isSelected ? "bg-orange-600 text-white" : "bg-slate-100 text-slate-600"}`}>
                            {method === "Demo UPI" && <Smartphone className="w-5 h-5" />}
                            {method === "Demo Card" && <CreditCard className="w-5 h-5" />}
                            {method === "Cash on Delivery" && <Banknote className="w-5 h-5" />}
                          </div>
                          <input
                            type="radio"
                            name="paymentMethodRadio"
                            checked={isSelected}
                            onChange={() => setValue("paymentMethod", method)}
                            className="text-orange-600 focus:ring-orange-500"
                            aria-label={method}
                          />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">{method}</p>
                          <p className="text-[10px] text-slate-500">
                            {method === "Cash on Delivery" ? "Pay upon delivery" : "Instant demo approval"}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {errors.paymentMethod && (
                  <p className="text-xs text-rose-600 font-medium">{errors.paymentMethod.message}</p>
                )}
              </div>
            </div>

            {/* Sticky Order Summary Column */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-md space-y-6 sticky top-28">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-lg font-black text-slate-900">Order Summary</h3>
                  <span className="text-xs text-slate-500 font-semibold">
                    {items.length} {items.length === 1 ? "item" : "items"}
                  </span>
                </div>

                {/* Items Mini-List */}
                <div className="space-y-3 max-h-52 overflow-y-auto pr-1">
                  {items.map((i) => (
                    <div key={i.menuItemId} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 truncate pr-2">
                        <span className="w-5 h-5 rounded-md bg-orange-100 text-orange-700 font-bold flex items-center justify-center shrink-0 text-[10px]">
                          {i.quantity}x
                        </span>
                        <span className="font-semibold text-slate-800 truncate">{i.name}</span>
                      </div>
                      <span className="font-bold text-slate-900 shrink-0">
                        {formatINR(i.price * i.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Bill Breakdown */}
                <div className="pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-semibold text-slate-900">{formatINR(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GST (5%)</span>
                    <span className="font-semibold text-slate-900">{formatINR(tax)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery</span>
                    <span className="font-semibold text-emerald-600 uppercase">Free</span>
                  </div>
                  <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline text-slate-900">
                    <div>
                      <span className="text-base font-black block">Total Amount</span>
                      <span className="text-[10px] text-slate-400">All taxes included</span>
                    </div>
                    <span className="text-2xl font-black text-orange-600">
                      {formatINR(total)}
                    </span>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={isSubmitting}
                  className="w-full shadow-lg shadow-orange-600/25 py-4 text-base font-bold"
                >
                  Place Order • {formatINR(total)}
                </Button>

                <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Secure 256-bit encrypted checkout</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
