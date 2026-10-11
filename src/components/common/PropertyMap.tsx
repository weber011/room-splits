"use client";

import React, { useState, useEffect, useRef } from "react";
import { PropertyLocationCoordinates, NearbyLandmark } from "@/types/map.types";
import { DEFAULT_NEARBY_LANDMARKS } from "@/lib/maps.utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PLATFORM_SETTINGS } from "@/config/business-rules.config";
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
  AlertTriangle,
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
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapsStatus, setMapsStatus] = useState<"loading" | "ready" | "unavailable">("loading");

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const isKeyConfigured = Boolean(apiKey && apiKey !== "your-google-maps-api-key" && apiKey.trim().length > 5);

  // Load Google Maps API Script cleanly
  useEffect(() => {
    if (!isKeyConfigured) {
      setMapsStatus("unavailable");
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window as any).google?.maps) {
      setMapsStatus("ready");
      return;
    }

    const scriptId = "google-maps-sdk-script";
    const existingScript = document.getElementById(scriptId);

    if (existingScript) {
      existingScript.addEventListener("load", () => setMapsStatus("ready"));
      existingScript.addEventListener("error", () => setMapsStatus("unavailable"));
      return;
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
    script.async = true;
    script.defer = true;
    script.onload = () => setMapsStatus("ready");
    script.onerror = () => setMapsStatus("unavailable");
    document.head.appendChild(script);
  }, [apiKey, isKeyConfigured]);

  // Render Google Map instance when SDK ready
  useEffect(() => {
    if (mapsStatus !== "ready" || !mapRef.current) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const google = (window as any).google;
    if (!google?.maps) return;

    if (isExactLocationVisible && location.latitude && location.longitude) {
      // UNLOCKED STATE: Render Exact Marker
      const center = { lat: location.latitude, lng: location.longitude };
      const map = new google.maps.Map(mapRef.current, {
        center,
        zoom: 15,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });

      new google.maps.Marker({
        position: center,
        map,
        title,
      });
    } else {
      // LOCKED STATE: Render Safe Approximate Locality View (e.g. Ranchi center or city default)
      const approxCenter = { lat: 23.3441, lng: 85.3096 }; // Default Ranchi approximate center
      const map = new google.maps.Map(mapRef.current, {
        center: approxCenter,
        zoom: 12,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });

      // Draw an approximate locality circle without exact coordinates
      new google.maps.Circle({
        strokeColor: "#f59e0b",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: "#f59e0b",
        fillOpacity: 0.15,
        map,
        center: approxCenter,
        radius: 1200, // 1.2km approximate circle
      });
    }
  }, [mapsStatus, isExactLocationVisible, location.latitude, location.longitude, title]);

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

  // Safe Google Maps Search / Directions URLs generated ONLY if authorized with valid coordinates
  const openInGoogleMapsUrl =
    isExactLocationVisible && location.latitude && location.longitude
      ? `https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`
      : undefined;

  const directionsUrl =
    isExactLocationVisible && location.latitude && location.longitude
      ? `https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}`
      : undefined;

  return (
    <Card className={`border-slate-800 bg-slate-900/90 p-5 space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <MapPin className="h-5 w-5 text-emerald-400" />
            <span>{isExactLocationVisible ? "Exact Location & Directions" : "📍 Approximate Location"}</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {isExactLocationVisible
              ? location.formatted_address || `${location.city}, ${location.state}`
              : `Locality: ${location.city || "Ranchi"}, ${location.state || "Jharkhand"}`}
          </p>
        </div>

        {isExactLocationVisible ? (
          <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-xs gap-1 self-start sm:self-auto">
            <ShieldCheck className="h-3.5 w-3.5" />
            Exact Address Unlocked
          </Badge>
        ) : (
          <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/30 text-xs gap-1 self-start sm:self-auto">
            <Lock className="h-3.5 w-3.5" />
            Exact Location Hidden
          </Badge>
        )}
      </div>

      {/* Privacy Warning Banner if Restricted */}
      {!isExactLocationVisible && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs space-y-1">
          <div className="flex items-center gap-2 font-bold text-amber-200 text-sm">
            <Lock className="h-4 w-4 text-amber-400 shrink-0" />
            <span>🔒 Exact location hidden</span>
          </div>
          <p className="text-xs text-amber-300/90">
            Unlock this property for <strong>{PLATFORM_SETTINGS.UNLOCK_PRICE_LABEL}</strong> to see the exact building address, GPS coordinates, owner phone, and visit instructions. Note: {PLATFORM_SETTINGS.VISIT_PASS_LABEL} is a property unlock pass, not a room booking.
          </p>
        </div>
      )}

      {/* Map Interactive Canvas or Graceful Fallback */}
      <div className="relative h-64 w-full rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 flex flex-col items-center justify-center text-center p-4">
        {mapsStatus === "ready" ? (
          <div ref={mapRef} className="h-full w-full" />
        ) : (
          /* Graceful Fallback UI when API key missing or Maps unavailable */
          <div className="relative z-10 space-y-3 max-w-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 mx-auto shadow-xl">
              <AlertTriangle className="h-6 w-6" />
            </div>

            <div>
              <h4 className="font-bold text-white text-sm">Map temporarily unavailable.</h4>
              <p className="text-xs text-slate-400 mt-1">
                {isExactLocationVisible
                  ? location.formatted_address || `${location.city}, ${location.state} ${location.pincode}`
                  : `Approximate Locality: ${location.city || "Ranchi"}, ${location.state || "Jharkhand"}`}
              </p>
            </div>
          </div>
        )}

        {/* Map Action Overlay for Unlocked State */}
        {isExactLocationVisible && (openInGoogleMapsUrl || directionsUrl) && (
          <div className="absolute bottom-3 right-3 z-20 flex flex-wrap gap-2">
            {openInGoogleMapsUrl && (
              <a href={openInGoogleMapsUrl} target="_blank" rel="noreferrer">
                <Button size="sm" className="bg-slate-900/90 hover:bg-slate-800 text-emerald-400 border border-emerald-500/30 font-bold text-xs gap-1.5 shadow-lg">
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>Open in Google Maps</span>
                </Button>
              </a>
            )}
            {directionsUrl && (
              <a href={directionsUrl} target="_blank" rel="noreferrer">
                <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs gap-1.5 shadow-lg">
                  <Navigation className="h-3.5 w-3.5" />
                  <span>Get Directions</span>
                </Button>
              </a>
            )}
          </div>
        )}
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
