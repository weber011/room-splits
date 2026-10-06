import * as React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export interface RatingDisplayProps {
  rating: number;
  reviewCount?: number;
  size?: "sm" | "md";
  className?: string;
}

export function RatingDisplay({
  rating,
  reviewCount,
  size = "sm",
  className,
}: RatingDisplayProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-lg bg-slate-900/90 border border-slate-800 px-2 py-0.5 text-xs font-semibold text-amber-400",
        size === "md" && "px-2.5 py-1 text-sm",
        className
      )}
    >
      <Star className={cn("fill-amber-400 text-amber-400", size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4")} />
      <span>{rating.toFixed(1)}</span>
      {reviewCount !== undefined && (
        <span className="text-slate-400 font-normal">({reviewCount})</span>
      )}
    </div>
  );
}
