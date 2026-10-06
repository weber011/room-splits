import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { SearchX } from "lucide-react";

export interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ElementType;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  title = "No results found",
  description = "We couldn't find anything matching your criteria. Try adjusting your filters.",
  icon: Icon = SearchX,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-3xl border border-slate-800 bg-slate-900/40 backdrop-blur-md",
        className
      )}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800/80 text-slate-400 mb-4 border border-slate-700/50">
        <Icon className="h-8 w-8" />
      </div>
      <h3 className="text-lg font-bold text-white mb-1.5">{title}</h3>
      <p className="text-sm text-slate-400 max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction} size="sm">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
