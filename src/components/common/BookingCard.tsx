import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "./StatusBadge";
import { PriceDisplay } from "./PriceDisplay";
import { Calendar, Home, FileText } from "lucide-react";
import { Booking } from "@/types";

export interface BookingCardProps {
  booking: Booking;
  propertyName?: string;
  onViewAgreement?: (bookingId: string) => void;
  className?: string;
}

export function BookingCard({
  booking,
  propertyName,
  onViewAgreement,
  className,
}: BookingCardProps) {
  const title = propertyName || booking.property?.title || "UrbanNest Co-Living";
  const sharing = booking.room?.sharingType || "Single";
  const statusStr = booking.bookingStatus === "CONFIRMED" || booking.bookingStatus === "COMPLETED" ? "confirmed" : "pending";

  return (
    <Card className={`border-slate-800 bg-slate-900/90 p-5 space-y-4 ${className}`}>
      <div className="flex items-start justify-between">
        <div>
          <span className="text-[10px] text-slate-400 font-mono">Code: #{booking.bookingCode || booking.id.slice(0, 8)}</span>
          <h4 className="font-bold text-white text-base leading-tight mt-0.5">
            {title}
          </h4>
        </div>
        <StatusBadge status={statusStr} />
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs text-slate-300 py-2 border-y border-slate-800">
        <div>
          <span className="text-slate-400 block">Move-in Date</span>
          <span className="font-semibold text-white flex items-center gap-1 mt-0.5">
            <Calendar className="h-3.5 w-3.5 text-emerald-400" />
            {booking.moveInDate}
          </span>
        </div>
        <div>
          <span className="text-slate-400 block">Sharing Type</span>
          <span className="font-semibold text-white flex items-center gap-1 mt-0.5 capitalize">
            <Home className="h-3.5 w-3.5 text-emerald-400" />
            {sharing}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <PriceDisplay amount={booking.monthlyRent} label="Monthly Rent" size="sm" />
        {onViewAgreement && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onViewAgreement(booking.id)}
            className="gap-1.5"
          >
            <FileText className="h-3.5 w-3.5 text-emerald-400" />
            Agreement
          </Button>
        )}
      </div>
    </Card>
  );
}
