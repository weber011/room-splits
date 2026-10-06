"use client";

import { MapPin } from "lucide-react";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface LocationSelectorProps {
  selectedCity: string;
  onCityChange: (city: string) => void;
  className?: string;
}

const INDIAN_CITIES = [
  { value: "Bengaluru", label: "Bengaluru (Tech Capital)" },
  { value: "Delhi NCR", label: "Delhi NCR (Gurugram & Noida)" },
  { value: "Hyderabad", label: "Hyderabad (Cyberabad)" },
  { value: "Pune", label: "Pune (Hinjewadi & Viman Nagar)" },
  { value: "Mumbai", label: "Mumbai (Suburbs & Navi Mumbai)" },
  { value: "Chennai", label: "Chennai (OMR Tech Corridor)" },
];

export function LocationSelector({
  selectedCity,
  onCityChange,
  className,
}: LocationSelectorProps) {
  return (
    <div className={cn("relative w-full max-w-xs", className)}>
      <Select
        value={selectedCity}
        onChange={(e) => onCityChange(e.target.value)}
        options={INDIAN_CITIES}
        className="pl-9 font-semibold text-slate-100"
      />
      <MapPin className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-400" />
    </div>
  );
}
