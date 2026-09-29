"use client";

import React, { useState } from "react";
import { ORDER_STATUSES, OrderStatus, isValidStatusTransition } from "@/lib/constants/order";
import { updateOrderStatus } from "@/lib/api/admin";
import { useToast } from "@/components/ui/toast-context";
import { Loader2 } from "lucide-react";

interface StatusUpdaterProps {
  orderId: string;
  currentStatus: OrderStatus;
  onStatusUpdated?: (newStatus: OrderStatus) => void;
}

export default function StatusUpdater({
  orderId,
  currentStatus,
  onStatusUpdated,
}: StatusUpdaterProps) {
  const [status, setStatus] = useState<OrderStatus>(currentStatus);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleStatusChange = async (newStatus: OrderStatus) => {
    if (newStatus === status) return;

    if (!isValidStatusTransition(status, newStatus)) {
      toast.error(`Cannot revert status from "${status}" to "${newStatus}"`);
      return;
    }

    try {
      setLoading(true);
      await updateOrderStatus(orderId, newStatus);
      setStatus(newStatus);
      toast.success(`Order status updated to ${newStatus}`);
      if (onStatusUpdated) onStatusUpdated(newStatus);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-orange-600" />
      ) : (
        <select
          value={status}
          onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
          className="text-xs font-bold rounded-xl border border-slate-300 bg-white px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-2xs cursor-pointer text-slate-800"
          aria-label="Change order status"
        >
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
