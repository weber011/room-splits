"use client";

import { useState } from "react";
import { LocationSearchResult } from "@/types/map.types";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Check } from "lucide-react";

const POPULAR_LOCATION_SUGGESTIONS: LocationSearchResult[] = [
  {
    placeId: "loc-1",
    description: "Indiranagar, Bengaluru, Karnataka",
    locality: "Indiranagar",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560038",
    latitude: 12.9784,
    longitude: 77.6408,
  },
  {
    placeId: "loc-2",
    description: "Koramangala, Bengaluru, Karnataka",
    locality: "Koramangala",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560095",
    latitude: 12.9352,
    longitude: 77.6245,
  },
  {
    placeId: "loc-3",
    description: "HSR Layout, Bengaluru, Karnataka",
    locality: "HSR Layout",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560102",
    latitude: 12.9121,
    longitude: 77.6446,
  },
  {
    placeId: "loc-4",
    description: "Whitefield, Bengaluru, Karnataka",
    locality: "Whitefield",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560066",
    latitude: 12.9698,
    longitude: 77.7499,
  },
  {
    placeId: "loc-5",
    description: "Electronic City, Bengaluru, Karnataka",
    locality: "Electronic City",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560100",
    latitude: 12.8399,
    longitude: 77.677,
  },
];

export interface LocationSearchProps {
  value?: string;
  onSelectLocation: (loc: LocationSearchResult) => void;
  placeholder?: string;
  className?: string;
}

export function LocationSearch({
  value = "",
  onSelectLocation,
  placeholder = "Search locality or city in Bengaluru...",
  className,
}: LocationSearchProps) {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);

  const filteredSuggestions = POPULAR_LOCATION_SUGGESTIONS.filter((s) =>
    s.description.toLowerCase().includes(query.toLowerCase()) ||
    s.locality.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
        <Input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="pl-10 bg-slate-950 border-slate-800 text-white text-xs"
        />
      </div>

      {open && filteredSuggestions.length > 0 && (
        <div className="absolute left-0 right-0 mt-1.5 z-50 rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden text-xs text-slate-100 divide-y divide-slate-800/60">
          {filteredSuggestions.map((s) => (
            <div
              key={s.placeId}
              onClick={() => {
                setQuery(s.locality);
                setOpen(false);
                onSelectLocation(s);
              }}
              className="p-3 flex items-center justify-between hover:bg-slate-800/50 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <MapPin className="h-4 w-4 text-emerald-400 shrink-0" />
                <div>
                  <strong className="font-bold text-white text-xs block">{s.locality}</strong>
                  <span className="text-[11px] text-slate-400">{s.city}, {s.state} {s.pincode}</span>
                </div>
              </div>
              {query.toLowerCase() === s.locality.toLowerCase() && (
                <Check className="h-4 w-4 text-emerald-400" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
