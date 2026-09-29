"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { fetchAdminOrders } from "@/lib/api/admin";
import { Order } from "@/types/order";
import { ORDER_STATUSES, OrderStatus } from "@/lib/constants/order";
import { formatINR } from "@/lib/utils";
import AdminHeader from "@/components/admin/AdminHeader";
import StatusUpdater from "@/components/admin/StatusUpdater";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Search, ClipboardList, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function sync() {
      try {
        const data = await fetchAdminOrders({
          status: selectedStatus,
          search,
          page,
          limit: 10,
        });
        if (mounted) {
          setOrders(data.orders);
          setTotal(data.total);
          setTotalPages(data.totalPages);
          setLoading(false);
        }
      } catch (err) {
        console.error("Failed to load admin orders", err);
        if (mounted) setLoading(false);
      }
    }
    sync();
    const interval = setInterval(sync, 8000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [selectedStatus, search, page]);

  const handleManualRefresh = async () => {
    setRefreshing(true);
    try {
      const data = await fetchAdminOrders({
        status: selectedStatus,
        search,
        page,
        limit: 10,
      });
      setOrders(data.orders);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error("Failed to refresh admin orders", err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleStatusFilterChange = (status: string) => {
    setSelectedStatus(status);
    setPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50">
      <AdminHeader />

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6 flex-1">
        {/* Header & Refresh */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Order Fulfillment Queue
            </h1>
            <p className="text-xs text-slate-500">
              Manage incoming customer orders, review details, and transition statuses.
            </p>
          </div>

          <button
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition shadow-2xs cursor-pointer self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            <span>Sync Orders</span>
          </button>
        </div>

        {/* Filter Bar & Search */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <button
              onClick={() => handleStatusFilterChange("All")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                selectedStatus === "All"
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              All Orders
            </button>
            {ORDER_STATUSES.map((status: OrderStatus) => (
              <button
                key={status}
                onClick={() => handleStatusFilterChange(status)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  selectedStatus === status
                    ? "bg-orange-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute inset-y-0 left-3 my-auto pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder="Search order #, customer, phone..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>

        {/* Orders Table Container */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-2">
              <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin" />
              <p className="text-xs font-medium text-slate-500">Loading orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title="No orders found"
              description={
                search || selectedStatus !== "All"
                  ? "No orders match the selected status or search filter."
                  : "There are currently no customer orders in the system."
              }
              actionLabel="Clear Filters"
              onAction={() => {
                setSelectedStatus("All");
                setSearch("");
              }}
            />
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                    <tr>
                      <th className="p-4 pl-6">Order ID</th>
                      <th className="p-4">Customer Details</th>
                      <th className="p-4">Time</th>
                      <th className="p-4">Items</th>
                      <th className="p-4">Total</th>
                      <th className="p-4">Payment</th>
                      <th className="p-4">Current Status</th>
                      <th className="p-4">Quick Update</th>
                      <th className="p-4 pr-6 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {orders.map((order) => (
                      <tr key={order._id} className="hover:bg-slate-50/70 transition">
                        <td className="p-4 pl-6 font-bold text-slate-900">
                          {order.orderNumber}
                        </td>
                        <td className="p-4">
                          <p className="font-semibold text-slate-900">{order.customer.name}</p>
                          <p className="text-[11px] text-slate-400">{order.customer.mobile}</p>
                        </td>
                        <td className="p-4 text-slate-500 whitespace-nowrap">
                          {new Date(order.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="p-4">
                          <span className="font-medium text-slate-700">
                            {order.items.length} {order.items.length === 1 ? "dish" : "dishes"}
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
                        <td className="p-4">
                          <StatusUpdater
                            orderId={order._id}
                            currentStatus={order.orderStatus}
                            onStatusUpdated={() => handleManualRefresh()}
                          />
                        </td>
                        <td className="p-4 pr-6 text-right">
                          <Link
                            href={`/admin/orders/${order._id}`}
                            className="text-xs font-bold text-orange-600 hover:text-orange-700 px-3 py-1.5 rounded-lg hover:bg-orange-50 transition"
                          >
                            View →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards View */}
              <div className="lg:hidden divide-y divide-slate-100">
                {orders.map((order) => (
                  <div key={order._id} className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-sm">{order.orderNumber}</span>
                      <Badge status={order.orderStatus} />
                    </div>

                    <div className="text-xs text-slate-600">
                      <p className="font-semibold text-slate-800">{order.customer.name}</p>
                      <p className="text-slate-400">{order.customer.mobile}</p>
                      <p className="mt-1 font-bold text-slate-900">
                        {formatINR(order.total)} • {order.items.length} items
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <StatusUpdater
                        orderId={order._id}
                        currentStatus={order.orderStatus}
                        onStatusUpdated={() => handleManualRefresh()}
                      />

                      <Link
                        href={`/admin/orders/${order._id}`}
                        className="text-xs font-bold text-orange-600 hover:text-orange-700"
                      >
                        Details →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>
                    Showing {orders.length} of {total} orders
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition cursor-pointer"
                      aria-label="Previous page"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="font-bold text-slate-800">
                      Page {page} of {totalPages}
                    </span>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition cursor-pointer"
                      aria-label="Next page"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
