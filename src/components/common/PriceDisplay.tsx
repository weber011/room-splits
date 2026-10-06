import * as React from "react";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

export interface PriceDisplayProps {
  amount: number;
  period?: string;
  originalAmount?: number;
  label?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function PriceDisplay({
  amount,
  period = "mo",
  originalAmount,
  label = "Starts from",
  size = "md",
  className,
}: PriceDisplayProps) {
  const sizeClasses = {
    sm: "text-base font-bold",
    md: "text-xl font-extrabold",
    lg: "text-3xl font-extrabold",
  };

  return (
    <div className={cn("flex flex-col", className)}>
      {label && <span className="text-[11px] font-medium text-slate-400">{label}</span>}
      <div className="flex items-baseline gap-1.5">
        <span className={cn(sizeClasses[size], "text-emerald-400 font-sans tracking-tight")}>
          {formatCurrency(amount)}
        </span>
        {period && <span className="text-xs text-slate-400 font-normal">/{period}</span>}
        {originalAmount && (
          <span className="text-xs text-slate-500 line-through ml-1">
            {formatCurrency(originalAmount)}
          </span>
        )}
      </div>
    </div>
  );
}
