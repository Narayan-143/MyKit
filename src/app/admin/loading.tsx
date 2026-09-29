import React from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import { StatsCardSkeleton, OrderRowSkeleton } from "@/components/ui/LoadingSkeleton";

export default function AdminLoading() {
  return (
    <div className="flex-1 flex flex-col bg-slate-50">
      <AdminHeader />
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="h-8 w-64 bg-slate-200 rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <StatsCardSkeleton key={i} />
          ))}
        </div>
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 space-y-4">
          <div className="h-6 w-48 bg-slate-200 rounded animate-pulse" />
          {Array.from({ length: 4 }).map((_, i) => (
            <OrderRowSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
