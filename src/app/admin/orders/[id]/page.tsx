"use client";

import React, { useEffect, useState, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { Order } from "@/types/order";
import { fetchAdminOrderById } from "@/lib/api/admin";
import { formatINR } from "@/lib/utils";
import AdminHeader from "@/components/admin/AdminHeader";
import StatusUpdater from "@/components/admin/StatusUpdater";
import { Badge } from "@/components/ui/Badge";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Mail,
  Phone,
  CreditCard,
  UtensilsCrossed,
} from "lucide-react";

interface AdminOrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function AdminOrderDetailPage({ params }: AdminOrderDetailPageProps) {
  const { id } = use(params);

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadOrder() {
      try {
        const data = await fetchAdminOrderById(id);
        setOrder(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load order");
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col bg-slate-50">
        <AdminHeader />
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex-1 flex flex-col bg-slate-50">
        <AdminHeader />
        <div className="py-16 max-w-md mx-auto px-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center mx-auto mb-4 text-rose-600">
            <UtensilsCrossed className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Order Not Found</h2>
          <p className="text-xs text-slate-500 mb-6">
            We were unable to locate an order matching ID &quot;{id}&quot;.
          </p>
          <Link
            href="/admin/orders"
            className="text-xs font-bold text-orange-600 hover:text-orange-700"
          >
            ← Return to Orders List
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-50">
      <AdminHeader />

      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8 flex-1">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <Link
              href="/admin/orders"
              className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1.5 mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Orders Queue</span>
            </Link>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Order #{order.orderNumber}
              </h1>
              <Badge status={order.orderStatus} />
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-400 mt-1">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(order.createdAt).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          </div>

          {/* Status Change Control */}
          <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs self-start sm:self-auto">
            <span className="text-xs font-bold text-slate-600">Update Status:</span>
            <StatusUpdater
              orderId={order._id}
              currentStatus={order.orderStatus}
              onStatusUpdated={(s) => setOrder({ ...order, orderStatus: s })}
            />
          </div>
        </div>

        {/* Content Columns */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Ordered Dishes List */}
          <div className="md:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-5">
            <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
              Kitchen Items List ({order.items.length})
            </h2>

            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.menuItemId} className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 shrink-0">
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
                      <p className="text-xs text-slate-500 font-medium">
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

            {/* Price Calculations */}
            <div className="pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900">{formatINR(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Taxes (5% GST)</span>
                <span className="font-semibold text-slate-900">{formatINR(order.tax)}</span>
              </div>
              <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-200">
                <span>Grand Total</span>
                <span className="text-orange-600">{formatINR(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Customer & Payment Info */}
          <div className="md:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
              <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
                Customer Information
              </h2>
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 block">Name</span>
                  <span className="font-bold text-slate-900 text-sm">{order.customer.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                  <span className="font-semibold text-slate-800">{order.customer.mobile}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                  <span className="font-semibold text-slate-800">{order.customer.email}</span>
                </div>
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-slate-400 block mb-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                    Delivery Destination
                  </span>
                  <p className="text-slate-700 leading-relaxed font-medium">
                    {order.customer.address}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
              <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-orange-600" />
                <span>Payment Status</span>
              </h2>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Method</span>
                  <span className="font-bold text-slate-800">{order.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Transaction Status</span>
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
