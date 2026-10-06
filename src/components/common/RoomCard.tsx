import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PriceDisplay } from "./PriceDisplay";
import { BedDouble, Bath } from "lucide-react";
import { RoomOption } from "@/types";

export interface RoomCardProps {
  room: RoomOption;
  onSelectRoom?: (roomId: string) => void;
  className?: string;
}

export function RoomCard({ room, onSelectRoom, className }: RoomCardProps) {
  const isAvailable = room.availableBeds > 0;

  return (
    <Card className={`border-slate-800 bg-slate-900/90 p-5 space-y-4 hover:border-slate-700 transition-all ${className}`}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <Badge variant={isAvailable ? "default" : "outline"} className="capitalize">
            {room.sharingType.replace("_", " ")} Sharing
          </Badge>
          <h4 className="font-bold text-white text-base capitalize pt-1">
            {room.sharingType.replace("_", " ")} Room
          </h4>
        </div>
        <PriceDisplay amount={room.monthlyRent} period="mo" size="sm" />
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 py-1">
        <div className="flex items-center gap-1.5">
          <BedDouble className="h-4 w-4 text-emerald-400" />
          <span>{room.availableBeds} of {room.totalBeds} Beds Left</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Bath className="h-4 w-4 text-emerald-400" />
          <span>{room.hasAttachedBathroom ? "Attached Bath" : "Shared Bath"}</span>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
        <span className="text-slate-400">
          Deposit: <strong className="text-slate-200">₹{room.securityDeposit.toLocaleString("en-IN")}</strong>
        </span>
        <Button
          size="sm"
          disabled={!isAvailable}
          onClick={() => onSelectRoom?.(room.id)}
          className="gap-1"
        >
          {isAvailable ? "Select Room" : "Fully Occupied"}
        </Button>
      </div>
    </Card>
  );
}
