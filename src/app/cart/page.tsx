"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, Minus, Trash2, ShoppingBag, ArrowRight, ArrowLeft } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  selectCartItems,
  selectSubtotal,
  selectTax,
  selectGrandTotal,
  selectIsCartHydrated,
  increaseQuantity,
  decreaseQuantity,
  removeItem,
  clearCart,
} from "@/store/cartSlice";
import { formatINR } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

export default function CartPage() {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectCartItems);
  const subtotal = useAppSelector(selectSubtotal);
  const tax = useAppSelector(selectTax);
  const total = useAppSelector(selectGrandTotal);
  const isHydrated = useAppSelector(selectIsCartHydrated);

  if (!isHydrated) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600" />
      </div>
    );
  }

  return (
    <div className="py-8 sm:py-12 flex-1">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link
                href="/menu"
                className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Continue Ordering</span>
              </Link>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Review Your Cart
            </h1>
          </div>

          {items.length > 0 && (
            <button
              onClick={() => dispatch(clearCart())}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 px-3 py-1.5 rounded-lg hover:bg-rose-50 transition cursor-pointer self-start sm:self-auto"
            >
              Clear Entire Cart
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title="Your shopping cart is empty"
            description="You haven't selected any culinary masterpieces yet. Browse our full menu to build your custom feast."
            actionLabel="Explore Menu"
            actionHref="/menu"
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Items Column */}
            <div className="lg:col-span-8 space-y-4">
              {items.map((item) => (
                <div
                  key={item.menuItemId}
                  className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:border-slate-300 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-slate-100 shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold text-orange-600 uppercase tracking-wider">
                        {item.category}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 line-clamp-1">
                        {item.name}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        {formatINR(item.price)} each
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    {/* Quantity Controls */}
                    <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                      <button
                        onClick={() => dispatch(decreaseQuantity(item.menuItemId))}
                        className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition cursor-pointer"
                        aria-label={`Decrease quantity of ${item.name}`}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-4 text-sm font-bold text-slate-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => dispatch(increaseQuantity(item.menuItemId))}
                        className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition cursor-pointer"
                        aria-label={`Increase quantity of ${item.name}`}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Line Item Total */}
                    <div className="text-right min-w-[80px]">
                      <span className="text-base font-black text-slate-900 block">
                        {formatINR(item.price * item.quantity)}
                      </span>
                    </div>

                    {/* Delete Item */}
                    <button
                      onClick={() => dispatch(removeItem(item.menuItemId))}
                      className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition cursor-pointer"
                      aria-label={`Remove ${item.name} from cart`}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary Column */}
            <div className="lg:col-span-4">
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-md space-y-6 sticky top-28">
                <h3 className="text-lg font-black text-slate-900 pb-3 border-b border-slate-100">
                  Bill Summary
                </h3>

                <div className="space-y-3 text-sm text-slate-600">
                  <div className="flex justify-between">
                    <span>Items Subtotal</span>
                    <span className="font-semibold text-slate-900">{formatINR(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GST (5%)</span>
                    <span className="font-semibold text-slate-900">{formatINR(tax)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Restaurant Delivery Fee</span>
                    <span className="font-semibold text-emerald-600 uppercase text-xs">
                      Free Promo
                    </span>
                  </div>

                  <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
                    <div>
                      <span className="text-base font-black text-slate-900 block">Grand Total</span>
                      <span className="text-[11px] text-slate-400">Inclusive of all taxes</span>
                    </div>
                    <span className="text-2xl font-black text-orange-600">
                      {formatINR(total)}
                    </span>
                  </div>
                </div>

                <Link href="/checkout" className="block w-full">
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full shadow-lg shadow-orange-600/25"
                  >
                    Proceed to Checkout
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>

                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200/80 text-xs text-amber-800 space-y-1">
                  <p className="font-bold">⚡ Freshly Prepared & Sealed</p>
                  <p className="text-[11px] text-amber-700">
                    Orders are immediately transmitted to our kitchen line upon confirmation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
