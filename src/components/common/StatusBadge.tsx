import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type StatusType =
  | "pending"
  | "confirmed"
  | "active"
  | "completed"
  | "cancelled"
  | "resolved"
  | "open"
  | "in_progress"
  | "closed";

export interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  className?: string;
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const statusConfig: Record<StatusType, { variant: "default" | "secondary" | "outline" | "accent" | "warning"; defaultLabel: string }> = {
    pending: { variant: "warning", defaultLabel: "Pending Approval" },
    confirmed: { variant: "default", defaultLabel: "Confirmed" },
    active: { variant: "default", defaultLabel: "Active Stay" },
    completed: { variant: "secondary", defaultLabel: "Completed" },
    cancelled: { variant: "outline", defaultLabel: "Cancelled" },
    open: { variant: "warning", defaultLabel: "Open Ticket" },
    in_progress: { variant: "accent", defaultLabel: "In Progress" },
    resolved: { variant: "default", defaultLabel: "Resolved" },
    closed: { variant: "secondary", defaultLabel: "Closed" },
  };

  const config = statusConfig[status] || { variant: "secondary", defaultLabel: status };

  return (
    <Badge variant={config.variant} className={cn("capitalize", className)}>
      {label || config.defaultLabel}
    </Badge>
  );
}
