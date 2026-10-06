import * as React from "react";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "./StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Wrench, Clock } from "lucide-react";
import { ComplaintTicket } from "@/types";

export interface ComplaintCardProps {
  ticket: ComplaintTicket;
  className?: string;
}

export function ComplaintCard({ ticket, className }: ComplaintCardProps) {
  const priorityColors: Record<string, string> = {
    LOW: "text-slate-400 border-slate-700",
    MEDIUM: "text-amber-400 border-amber-500/30",
    HIGH: "text-rose-400 border-rose-500/30",
    URGENT: "text-rose-500 border-rose-500 bg-rose-500/10",
    low: "text-slate-400 border-slate-700",
    medium: "text-amber-400 border-amber-500/30",
    high: "text-rose-400 border-rose-500/30",
    urgent: "text-rose-500 border-rose-500 bg-rose-500/10",
  };

  return (
    <Card className={`border-slate-800 bg-slate-900/90 p-5 space-y-3 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400 font-mono">{ticket.ticketNumber || `TICKET #${ticket.id.slice(0, 6)}`}</span>
            <Badge variant="outline" className={`text-[10px] uppercase ${priorityColors[ticket.priority] || "text-slate-400"}`}>
              {ticket.priority} priority
            </Badge>
          </div>
          <h4 className="font-bold text-white text-base leading-snug">
            {ticket.title}
          </h4>
        </div>
        <StatusBadge status={ticket.status.toLowerCase() as "open" | "in_progress" | "resolved" | "closed"} />
      </div>

      <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
        {ticket.description}
      </p>

      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
        <span className="uppercase flex items-center gap-1 font-semibold text-emerald-400">
          <Wrench className="h-3 w-3 text-emerald-400" />
          {ticket.category.replace("_", " ")}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3 text-slate-500" />
          {ticket.created_at ? new Date(ticket.created_at).toLocaleDateString("en-IN") : "Recently"}
        </span>
      </div>
    </Card>
  );
}
