"use client";

import React, { useEffect, useState, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { OrderTrackingInfo } from "@/types/order";
import { fetchOrderTracking } from "@/lib/api/orders";
import { formatINR } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  CheckCircle2,
  Clock,
  ChefHat,
  PackageCheck,
  MapPin,
  CreditCard,
  Radio,
  ArrowLeft,
  UtensilsCrossed,
} from "lucide-react";

interface OrderTrackingPageProps {
  params: Promise<{ orderNumber: string }>;
}

export default function OrderTrackingPage({ params }: OrderTrackingPageProps) {
  const { orderNumber } = use(params);

  const [order, setOrder] = useState<OrderTrackingInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());

  // Initial fetch and 5-second polling synchronization
  useEffect(() => {
    let isMounted = true;

    async function loadOrder() {
      try {
        const data = await fetchOrderTracking(orderNumber);
        if (isMounted) {
          setOrder(data);
          setLastSyncTime(new Date());
          setError(null);
        }
      } catch (err: unknown) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Failed to load order");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadOrder();

    // Polling fallback every 5 seconds
    const intervalId = setInterval(loadOrder, 5000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [orderNumber]);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin" />
        <p className="text-sm font-semibold text-slate-600">Retrieving order details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="py-16 max-w-md mx-auto px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center mx-auto mb-4 text-rose-600">
          <UtensilsCrossed className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Order Not Found</h2>
        <p className="text-xs text-slate-500 mb-6 leading-relaxed">
          We could not find an order corresponding to {orderNumber}. Please check your order reference number or return to the menu.
        </p>
        <Link href="/menu">
          <Button variant="primary">Explore Menu</Button>
        </Link>
      </div>
    );
  }

  // Timeline steps
  const steps = [
    {
      key: "Pending",
      title: "Order Placed",
      desc: "Sent to restaurant line",
      icon: Clock,
    },
    {
      key: "Accepted",
      title: "Accepted",
      desc: "Confirmed by kitchen",
      icon: CheckCircle2,
    },
    {
      key: "Preparing",
      title: "Preparing",
      desc: "Fresh ingredients cooking",
      icon: ChefHat,
    },
    {
      key: "Completed",
      title: "Completed",
      desc: "Ready for pickup or delivered",
      icon: PackageCheck,
    },
  ];

  const statusIndexMap: Record<string, number> = {
    Pending: 0,
    Accepted: 1,
    Preparing: 2,
    Completed: 3,
  };

  const currentStepIndex = statusIndexMap[order.orderStatus] ?? 0;

  return (
    <div className="py-8 sm:py-12 flex-1">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <Link
              href="/menu"
              className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1.5 mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Order More Food</span>
            </Link>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Order #{order.orderNumber}
              </h1>
              <Badge status={order.orderStatus} />
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Placed on {new Date(order.createdAt).toLocaleDateString()} at{" "}
              {new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>

          {/* Real-time Indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold self-start sm:self-auto">
            <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            <span>Live Status Sync</span>
            <span className="text-[10px] text-emerald-600/70 font-normal">
              ({lastSyncTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })})
            </span>
          </div>
        </div>

        {/* Status Timeline Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-md">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-8">
            Live Order Progression
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isPast = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;

              return (
                <div key={step.key} className="flex md:flex-col items-center md:items-center text-left md:text-center gap-4 md:gap-3">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all ${
                      isCurrent
                        ? "bg-orange-600 text-white shadow-lg shadow-orange-600/30 scale-110 ring-4 ring-orange-100"
                        : isPast
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>

                  <div>
                    <h3
                      className={`text-sm font-bold ${
                        isCurrent
                          ? "text-orange-600"
                          : isPast
                          ? "text-emerald-800"
                          : "text-slate-400"
                      }`}
                    >
                      {step.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">{step.desc}</p>
                    {isCurrent && (
                      <span className="inline-block mt-1 text-[10px] font-bold text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full">
                        In Progress
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Details Grid: Items and Delivery Information */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Items Summary */}
          <div className="md:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-5">
            <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
              Ordered Items
            </h2>

            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.menuItemId} className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{item.name}</h4>
                      <p className="text-xs text-slate-500">
                        {item.quantity} × {formatINR(item.price)}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-black text-slate-900">
                    {formatINR(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Bill Summary */}
            <div className="pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900">{formatINR(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>GST (5%)</span>
                <span className="font-semibold text-slate-900">{formatINR(order.tax)}</span>
              </div>
              <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-200">
                <span>Total Paid</span>
                <span className="text-orange-600">{formatINR(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Delivery & Payment Info */}
          <div className="md:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
              <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-orange-600" />
                <span>Delivery Details</span>
              </h2>
              <div>
                <p className="text-xs font-bold text-slate-900">{order.customer.name}</p>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {order.customer.address}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
              <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-orange-600" />
                <span>Payment Summary</span>
              </h2>
              <div className="text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Method</span>
                  <span className="font-bold text-slate-800">{order.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment Status</span>
                  <span
                    className={`font-bold ${
                      order.paymentStatus === "Paid" ? "text-emerald-600" : "text-amber-600"
                    }`}
                  >
                    {order.paymentStatus}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
