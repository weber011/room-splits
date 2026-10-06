import * as React from "react";
import { cn } from "@/lib/utils";
import { Wifi, Utensils, Zap, Shield, Dumbbell, Sparkles, Wind, Bath } from "lucide-react";

export interface AmenityBadgeProps {
  name: string;
  showIcon?: boolean;
  className?: string;
}

const amenityIconMap: Record<string, React.ElementType> = {
  "High-Speed Wi-Fi": Wifi,
  "Wi-Fi": Wifi,
  "3x Daily Meals": Utensils,
  "Homely Food": Utensils,
  "AC Rooms": Wind,
  "Air Conditioning": Wind,
  "Power Backup": Zap,
  "Gym Access": Dumbbell,
  "Gym & Fitness Zone": Dumbbell,
  "24/7 Security & CCTV": Shield,
  "Attached Bath": Bath,
  "Attached Bathroom": Bath,
};

export function AmenityBadge({ name, showIcon = true, className }: AmenityBadgeProps) {
  const Icon = amenityIconMap[name] || Sparkles;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/80 px-2.5 py-1 text-xs text-slate-300 font-medium",
        className
      )}
    >
      {showIcon && <Icon className="h-3.5 w-3.5 text-emerald-400" />}
      <span>{name}</span>
    </span>
  );
}
