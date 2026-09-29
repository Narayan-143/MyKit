"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { fetchAdminStats } from "@/lib/api/admin";
import { AdminStats } from "@/types/api";
import { Order } from "@/types/order";
import { formatINR } from "@/lib/utils";
import AdminHeader from "@/components/admin/AdminHeader";
import StatsCard from "@/components/admin/StatsCard";
import { StatsCardSkeleton } from "@/components/ui/LoadingSkeleton";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  ChefHat,
  PackageCheck,
  IndianRupee,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function loadStats() {
      try {
        const data = await fetchAdminStats();
        if (mounted) {
          setStats(data.stats);
          setRecentOrders(data.recentOrders);
          setLoading(false);
        }
      } catch (err) {
        console.error("Failed to load admin stats", err);
        if (mounted) setLoading(false);
      }
    }
    loadStats();
    const interval = setInterval(loadStats, 10000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleManualRefresh = async () => {
    setRefreshing(true);
    try {
      const data = await fetchAdminStats();
      setStats(data.stats);
      setRecentOrders(data.recentOrders);
    } catch (err) {
      console.error("Failed to refresh admin stats", err);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50">
      <AdminHeader />

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8 flex-1">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Restaurant Kitchen Overview
            </h1>
            <p className="text-xs text-slate-500">
              Real-time live operational metrics and order progression.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleManualRefresh}
              disabled={refreshing}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition shadow-2xs cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
              <span>Refresh Metrics</span>
            </button>

            <Link href="/admin/orders">
              <Button variant="primary" size="sm">
                <span>View All Orders</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        </div>

        {/* 6 Stats Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {loading || !stats ? (
            Array.from({ length: 6 }).map((_, i) => <StatsCardSkeleton key={i} />)
          ) : (
            <>
              <StatsCard
                title="Total Orders"
                value={stats.totalOrders}
                icon={ShoppingBag}
                variant="default"
              />
              <StatsCard
                title="Pending"
                value={stats.pendingOrders}
                subtitle="Awaiting Kitchen"
                icon={Clock}
                variant="warning"
              />
              <StatsCard
                title="Accepted"
                value={stats.acceptedOrders}
                subtitle="Confirmed Line"
                icon={CheckCircle2}
                variant="info"
              />
              <StatsCard
                title="Preparing"
                value={stats.preparingOrders}
                subtitle="In Cooking"
                icon={ChefHat}
                variant="purple"
              />
              <StatsCard
                title="Completed"
                value={stats.completedOrders}
                subtitle="Delivered / Ready"
                icon={PackageCheck}
                variant="success"
              />
              <StatsCard
                title="Revenue"
                value={formatINR(stats.totalRevenue)}
                subtitle="Paid Orders"
                icon={IndianRupee}
                variant="orange"
              />
            </>
          )}
        </div>

        {/* Recent Orders Section */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Recent Customer Orders</h2>
              <p className="text-xs text-slate-400">Latest active incoming food orders</p>
            </div>
            <Link
              href="/admin/orders"
              className="text-xs font-bold text-orange-600 hover:text-orange-700"
            >
              See all orders →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                <tr>
                  <th className="p-4 pl-6">Order Number</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Items</th>
                  <th className="p-4">Total</th>
                  <th className="p-4">Payment</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 pr-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">
                      No recent orders recorded yet.
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-slate-50/80 transition">
                      <td className="p-4 pl-6 font-bold text-slate-900">
                        {order.orderNumber}
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-slate-800">{order.customer.name}</div>
                        <div className="text-[11px] text-slate-400">{order.customer.mobile}</div>
                      </td>
                      <td className="p-4">
                        <span className="text-slate-600 font-medium">
                          {order.items.length} {order.items.length === 1 ? "item" : "items"}
                        </span>
                      </td>
                      <td className="p-4 font-black text-slate-900">
                        {formatINR(order.total)}
                      </td>
                      <td className="p-4">
                        <span
                          className={`font-semibold ${
                            order.paymentStatus === "Paid" ? "text-emerald-600" : "text-amber-600"
                          }`}
                        >
                          {order.paymentMethod}
                        </span>
                      </td>
                      <td className="p-4">
                        <Badge status={order.orderStatus} />
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <Link
                          href={`/admin/orders/${order._id}`}
                          className="text-xs font-bold text-orange-600 hover:text-orange-700 px-3 py-1.5 rounded-lg hover:bg-orange-50 transition"
                        >
                          Details →
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
