import React from "react";
import { cn } from "@/lib/utils";
import { OrderStatus } from "@/lib/constants/order";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "outline" | "success" | "warning";
  status?: OrderStatus;
}

export function Badge({ className, variant = "default", status, children, ...props }: BadgeProps) {
  if (status) {
    const statusStyles: Record<OrderStatus, string> = {
      Pending: "bg-amber-100 text-amber-800 border-amber-300",
      Accepted: "bg-sky-100 text-sky-800 border-sky-300",
      Preparing: "bg-purple-100 text-purple-800 border-purple-300",
      Completed: "bg-emerald-100 text-emerald-800 border-emerald-300",
    };

    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border",
          statusStyles[status] || "bg-slate-100 text-slate-800 border-slate-300",
          className
        )}
        {...props}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
        {status}
      </span>
    );
  }

  const variants = {
    default: "bg-orange-100 text-orange-800 border-orange-200",
    outline: "border border-slate-300 text-slate-700 bg-white",
    success: "bg-emerald-100 text-emerald-800 border-emerald-200",
    warning: "bg-amber-100 text-amber-800 border-amber-200",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
