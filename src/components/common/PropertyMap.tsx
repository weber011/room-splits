"use client";

import { PropertyLocationCoordinates, NearbyLandmark } from "@/types/map.types";
import {
  getMaskedLocationCoordinates,
  getGoogleMapsDirectionsUrl,
  DEFAULT_NEARBY_LANDMARKS,
} from "@/lib/maps.utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Navigation,
  Lock,
  Building,
  GraduationCap,
  Train,
  Hospital,
  ShoppingBag,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";

export interface PropertyMapProps {
  location: PropertyLocationCoordinates;
  title: string;
  isExactLocationVisible: boolean;
  nearbyLandmarks?: NearbyLandmark[];
  className?: string;
}

export function PropertyMap({
  location,
  title,
  isExactLocationVisible,
  nearbyLandmarks = DEFAULT_NEARBY_LANDMARKS,
  className,
}: PropertyMapProps) {
  const masked = getMaskedLocationCoordinates(location, isExactLocationVisible);
  const directionsUrl = getGoogleMapsDirectionsUrl(
    location.latitude,
    location.longitude,
    location.formatted_address
  );

  const getLandmarkIcon = (type: string) => {
    switch (type) {
      case "METRO":
        return <Train className="h-4 w-4 text-emerald-400" />;
      case "COLLEGE":
        return <GraduationCap className="h-4 w-4 text-blue-400" />;
      case "TECH_PARK":
        return <Building className="h-4 w-4 text-teal-400" />;
      case "HOSPITAL":
        return <Hospital className="h-4 w-4 text-rose-400" />;
      case "MALL":
        return <ShoppingBag className="h-4 w-4 text-amber-400" />;
      default:
        return <MapPin className="h-4 w-4 text-emerald-400" />;
    }
  };

  return (
    <Card className={`border-slate-800 bg-slate-900/90 p-5 space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <MapPin className="h-5 w-5 text-emerald-400" />
            Location & Geographic Surroundings
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">{masked.displayAddress}</p>
        </div>

        {isExactLocationVisible ? (
          <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-xs gap-1 self-start sm:self-auto">
            <ShieldCheck className="h-3.5 w-3.5" />
            Exact Address Unlocked
          </Badge>
        ) : (
          <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/30 text-xs gap-1 self-start sm:self-auto">
            <Lock className="h-3.5 w-3.5" />
            Approximate Area
          </Badge>
        )}
      </div>

      {/* Privacy Warning Banner if Restricted */}
      {!isExactLocationVisible && (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-3">
          <Lock className="h-5 w-5 text-amber-400 shrink-0" />
          <div>
            <strong className="block font-bold text-amber-200">Restricted Location Privacy</strong>
            <span>Exact building pin & street number are revealed once your Visit Pass is confirmed.</span>
          </div>
        </div>
      )}

      {/* Map Interactive Canvas */}
      <div className="relative h-64 w-full rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 flex flex-col items-center justify-center text-center p-4">
        {/* Dynamic Styled Vector Map Background simulation */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />

        <div className="relative z-10 space-y-3 max-w-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 mx-auto shadow-xl">
            <MapPin className="h-6 w-6 animate-bounce" />
          </div>

          <div>
            <h4 className="font-bold text-white text-sm">{title}</h4>
            <span className="text-xs text-slate-400 block mt-0.5">
              Lat: {masked.latitude} &bull; Lng: {masked.longitude}
            </span>
            <span className="text-[11px] text-emerald-400 font-mono block mt-1">
              {location.city}, {location.state} {location.pincode}
            </span>
          </div>

          {isExactLocationVisible && (
            <a href={directionsUrl} target="_blank" rel="noreferrer">
              <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs gap-1.5 mt-2">
                <Navigation className="h-3.5 w-3.5" />
                <span>Get Directions on Google Maps</span>
                <ExternalLink className="h-3 w-3" />
              </Button>
            </a>
          )}
        </div>
      </div>

      {/* Nearby Distance Matrix Chips */}
      <div className="space-y-2 pt-2 border-t border-slate-800">
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Nearby Colleges, IT Parks & Transit
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {nearbyLandmarks.map((lm) => (
            <div
              key={lm.id}
              className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  {getLandmarkIcon(lm.type)}
                </div>
                <div>
                  <h5 className="font-bold text-white text-xs leading-snug">{lm.name}</h5>
                  {lm.travelTimeMinutes && (
                    <span className="text-[10px] text-slate-400">{lm.travelTimeMinutes} mins drive</span>
                  )}
                </div>
              </div>

              <Badge variant="outline" className="text-emerald-400 border-emerald-500/30 text-[11px] font-mono shrink-0">
                {lm.distanceKm} km
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
