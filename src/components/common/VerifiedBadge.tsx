import * as React from "react";
import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export interface VerifiedBadgeProps {
  type?: "property" | "owner" | "resident";
  className?: string;
}

export function VerifiedBadge({ type = "property", className }: VerifiedBadgeProps) {
  const labelMap = {
    property: "Verified PG",
    owner: "Verified Owner",
    resident: "KYC Verified Resident",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-xs font-semibold text-emerald-400 shadow-sm backdrop-blur-md",
        className
      )}
    >
      <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
      <span>{labelMap[type]}</span>
    </span>
  );
}
