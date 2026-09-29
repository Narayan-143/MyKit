import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: "default" | "warning" | "info" | "purple" | "success" | "orange";
}

export default function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = "default",
}: StatsCardProps) {
  const variantStyles = {
    default: "bg-slate-50 text-slate-700 border-slate-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    info: "bg-sky-50 text-sky-700 border-sky-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    orange: "bg-orange-50 text-orange-700 border-orange-200",
  };

  const iconStyles = {
    default: "bg-slate-200/80 text-slate-800",
    warning: "bg-amber-200/80 text-amber-800",
    info: "bg-sky-200/80 text-sky-800",
    purple: "bg-purple-200/80 text-purple-800",
    success: "bg-emerald-200/80 text-emerald-800",
    orange: "bg-orange-200/80 text-orange-800",
  };

  return (
    <div
      className={cn(
        "p-6 rounded-3xl border bg-white shadow-xs hover:shadow-md transition flex items-center justify-between gap-4",
        variantStyles[variant]
      )}
    >
      <div className="space-y-1">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
          {title}
        </p>
        <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          {value}
        </p>
        {subtitle && <p className="text-[11px] text-slate-400">{subtitle}</p>}
      </div>

      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0", iconStyles[variant])}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
}
