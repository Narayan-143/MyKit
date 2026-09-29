"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  selectCartItems,
  selectSubtotal,
  selectTax,
  selectGrandTotal,
  increaseQuantity,
  decreaseQuantity,
  removeItem,
  clearCart,
} from "@/store/cartSlice";
import { formatINR } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectCartItems);
  const subtotal = useAppSelector(selectSubtotal);
  const tax = useAppSelector(selectTax);
  const total = useAppSelector(selectGrandTotal);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
          {/* Header */}
          <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-orange-600" />
              <h2 className="text-lg font-bold text-slate-900">Your Cart</h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
                {items.length} {items.length === 1 ? "item" : "items"}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition cursor-pointer"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Item List / Empty State */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center mb-4 text-orange-600">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-slate-800 mb-1">Your cart is empty</h3>
                <p className="text-xs text-slate-500 max-w-xs mb-6">
                  Looks like you haven&apos;t added any delicious meals yet. Explore our handcrafted menu!
                </p>
                <Link href="/menu" onClick={onClose}>
                  <Button variant="primary" size="sm">
                    Explore Menu
                  </Button>
                </Link>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.menuItemId}
                  className="flex items-center gap-3.5 p-3 rounded-2xl border border-slate-100 bg-white hover:border-slate-200 shadow-xs transition"
                >
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 truncate">{item.name}</h4>
                    <p className="text-xs text-slate-500">{formatINR(item.price)} each</p>

                    <div className="flex items-center justify-between mt-2">
                      {/* Quantity Controls */}
                      <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                        <button
                          onClick={() => dispatch(decreaseQuantity(item.menuItemId))}
                          className="px-2 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition cursor-pointer"
                          aria-label={`Decrease quantity of ${item.name}`}
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2.5 text-xs font-bold text-slate-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => dispatch(increaseQuantity(item.menuItemId))}
                          className="px-2 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition cursor-pointer"
                          aria-label={`Increase quantity of ${item.name}`}
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">
                          {formatINR(item.price * item.quantity)}
                        </span>
                        <button
                          onClick={() => dispatch(removeItem(item.menuItemId))}
                          className="text-slate-400 hover:text-rose-600 transition p-1"
                          aria-label={`Remove ${item.name} from cart`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Summary & Checkout Button */}
          {items.length > 0 && (
            <div className="p-5 border-t border-slate-200 bg-slate-50/70 space-y-3">
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900">{formatINR(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxes (5% GST)</span>
                  <span className="font-semibold text-slate-900">{formatINR(tax)}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-200">
                  <span>Grand Total</span>
                  <span className="text-orange-600">{formatINR(total)}</span>
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <Link href="/checkout" onClick={onClose} className="w-full">
                  <Button variant="primary" size="lg" className="w-full shadow-md shadow-orange-500/20">
                    Proceed to Checkout
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>

                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    onClick={() => dispatch(clearCart())}
                    className="text-slate-500 hover:text-rose-600 font-medium transition cursor-pointer"
                  >
                    Clear Cart
                  </button>
                  <Link
                    href="/cart"
                    onClick={onClose}
                    className="text-orange-600 hover:text-orange-700 font-medium transition"
                  >
                    View Full Cart Page
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
