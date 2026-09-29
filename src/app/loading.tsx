import React from "react";
import { MenuCardSkeleton } from "@/components/ui/LoadingSkeleton";

export default function Loading() {
  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-in fade-in">
      <div className="h-44 w-full rounded-3xl bg-slate-200/80 animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <MenuCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
