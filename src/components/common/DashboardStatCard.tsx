import * as React from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

export interface DashboardStatCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon: React.ElementType;
  description?: string;
  className?: string;
}

export function DashboardStatCard({
  title,
  value,
  change,
  isPositive = true,
  icon: Icon,
  description,
  className,
}: DashboardStatCardProps) {
  return (
    <Card className={cn("border-slate-800 bg-slate-900/90 p-5 space-y-3", className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          {title}
        </span>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div>
        <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {value}
        </h3>
        {change && (
          <div className="flex items-center gap-1 mt-1 text-xs">
            {isPositive ? (
              <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5 text-rose-400" />
            )}
            <span className={isPositive ? "text-emerald-400 font-semibold" : "text-rose-400 font-semibold"}>
              {change}
            </span>
            <span className="text-slate-400">{description || "vs last month"}</span>
          </div>
        )}
      </div>
    </Card>
  );
}
