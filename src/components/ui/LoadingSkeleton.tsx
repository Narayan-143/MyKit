import React from "react";
import { cn } from "@/lib/utils";

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-slate-200/80", className)}
      {...props}
    />
  );
}

export function MenuCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm flex flex-col h-full">
      <Skeleton className="h-48 w-full rounded-none" />
      <div className="p-5 flex flex-col flex-1 gap-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-20 rounded-full" />
          <Skeleton className="h-4 w-12 rounded-full" />
        </div>
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-100">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-10 w-28 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function StatsCardSkeleton() {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-16" />
      </div>
      <Skeleton className="w-12 h-12 rounded-xl" />
    </div>
  );
}

export function OrderRowSkeleton() {
  return (
    <div className="p-4 bg-white border-b border-slate-100 flex items-center justify-between gap-4">
      <Skeleton className="h-5 w-24" />
      <Skeleton className="h-5 w-32" />
      <Skeleton className="h-5 w-20" />
      <Skeleton className="h-6 w-24 rounded-full" />
      <Skeleton className="h-8 w-20 rounded-lg" />
    </div>
  );
}
