"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Search, AlertTriangle, ShieldCheck, Compass, Loader2 } from "lucide-react";
import { isLocationInSupportedRegion } from "@/config/business-rules.config";

export interface LocationPickerProps {
  address: string;
  locality: string;
  city: string;
  state: string;
  country?: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
  onChange: (location: {
    address: string;
    locality: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
    latitude?: number;
    longitude?: number;
  }) => void;
  disabled?: boolean;
}

// Default Ranchi center fallback
const DEFAULT_RANCHI_LAT = 23.3441;
const DEFAULT_RANCHI_LNG = 85.3096;

export function LocationPicker({
  address,
  locality,
  city,
  state,
  country = "India",
  pincode,
  latitude,
  longitude,
  onChange,
  disabled = false,
}: LocationPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const googleMapInstanceRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markerInstanceRef = useRef<any>(null);

  const [mapsStatus, setMapsStatus] = useState<"loading" | "ready" | "unavailable">("loading");
  const [searchQuery, setSearchQuery] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const isKeyConfigured = Boolean(apiKey && apiKey !== "your-google-maps-api-key" && apiKey.trim().length > 5);

  // Validate location against Jharkhand rules
  const validateLocation = useCallback((currentState: string, currentCountry: string, currentCity: string) => {
    const check = isLocationInSupportedRegion({
      state: currentState,
      country: currentCountry,
      city: currentCity,
    });

    if (!check.valid) {
      setValidationError(check.reason || "RoomSplits currently supports properties only in Jharkhand.");
    } else {
      setValidationError(null);
    }
  }, []);

  useEffect(() => {
    validateLocation(state, country, city);
  }, [state, country, city, validateLocation]);

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
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setMapsStatus("ready");
    script.onerror = () => setMapsStatus("unavailable");
    document.head.appendChild(script);
  }, [apiKey, isKeyConfigured]);

  // Initialize Map canvas once SDK is ready
  useEffect(() => {
    if (mapsStatus !== "ready" || !mapRef.current) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const google = (window as any).google;
    if (!google?.maps) return;

    const currentLat = latitude || DEFAULT_RANCHI_LAT;
    const currentLng = longitude || DEFAULT_RANCHI_LNG;

    const mapOptions = {
      center: { lat: currentLat, lng: currentLng },
      zoom: 14,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      styles: [
        { elementType: "geometry", stylers: [{ color: "#0f172a" }] },
        { elementType: "labels.text.stroke", stylers: [{ color: "#0f172a" }] },
        { elementType: "labels.text.fill", stylers: [{ color: "#94a3b8" }] },
        { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#cbd5e1" }] },
        { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#64748b" }] },
        { featureType: "road", elementType: "geometry", stylers: [{ color: "#1e293b" }] },
        { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#334155" }] },
        { featureType: "water", elementType: "geometry", stylers: [{ color: "#0284c7" }] },
      ],
    };

    const map = new google.maps.Map(mapRef.current, mapOptions);
    googleMapInstanceRef.current = map;

    const marker = new google.maps.Marker({
      position: { lat: currentLat, lng: currentLng },
      map,
      draggable: !disabled,
      title: "Property Location",
    });
    markerInstanceRef.current = marker;

    // Drag marker event handler
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    marker.addListener("dragend", (e: any) => {
      const newLat = e.latLng.lat();
      const newLng = e.latLng.lng();

      onChange({
        address,
        locality,
        city,
        state,
        country,
        pincode,
        latitude: Math.round(newLat * 100000) / 100000,
        longitude: Math.round(newLng * 100000) / 100000,
      });
    });

    // Map click event handler
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    map.addListener("click", (e: any) => {
      if (disabled) return;
      const newLat = e.latLng.lat();
      const newLng = e.latLng.lng();

      marker.setPosition({ lat: newLat, lng: newLng });
      onChange({
        address,
        locality,
        city,
        state,
        country,
        pincode,
        latitude: Math.round(newLat * 100000) / 100000,
        longitude: Math.round(newLng * 100000) / 100000,
      });
    });

    // Setup Places Autocomplete if search input exists
    if (searchInputRef.current && google.maps.places) {
      const autocomplete = new google.maps.places.Autocomplete(searchInputRef.current, {
        componentRestrictions: { country: "in" },
        fields: ["address_components", "geometry", "formatted_address"],
      });

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (!place.geometry || !place.geometry.location) return;

        const newLat = place.geometry.location.lat();
        const newLng = place.geometry.location.lng();

        map.setCenter({ lat: newLat, lng: newLng });
        marker.setPosition({ lat: newLat, lng: newLng });

        let parsedLocality = locality;
        let parsedCity = city;
        let parsedState = state;
        let parsedPincode = pincode;

        // Extract components
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        place.address_components?.forEach((comp: any) => {
          const types = comp.types;
          if (types.includes("sublocality") || types.includes("neighborhood") || types.includes("sublocality_level_1")) {
            parsedLocality = comp.long_name;
          }
          if (types.includes("locality")) {
            parsedCity = comp.long_name;
          }
          if (types.includes("administrative_area_level_1")) {
            parsedState = comp.long_name;
          }
          if (types.includes("postal_code")) {
            parsedPincode = comp.long_name;
          }
        });

        onChange({
          address: place.formatted_address || address,
          locality: parsedLocality,
          city: parsedCity,
          state: parsedState,
          country: "India",
          pincode: parsedPincode,
          latitude: Math.round(newLat * 100000) / 100000,
          longitude: Math.round(newLng * 100000) / 100000,
        });
      });
    }
  }, [mapsStatus, disabled, latitude, longitude, address, locality, city, state, country, pincode, onChange]);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newLat = pos.coords.latitude;
        const newLng = pos.coords.longitude;

        if (googleMapInstanceRef.current && markerInstanceRef.current) {
          googleMapInstanceRef.current.setCenter({ lat: newLat, lng: newLng });
          markerInstanceRef.current.setPosition({ lat: newLat, lng: newLng });
        }

        onChange({
          address,
          locality,
          city,
          state,
          country,
          pincode,
          latitude: Math.round(newLat * 100000) / 100000,
          longitude: Math.round(newLng * 100000) / 100000,
        });
      },
      (err) => {
        alert(`Location permission denied or unavailable: ${err.message}`);
      }
    );
  };

  return (
    <div className="space-y-4">
      {/* Jharkhand Validation Warning Banner */}
      {validationError && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0" />
          <div>
            <strong className="block font-bold text-rose-200">State / Region Restriction</strong>
            <span>{validationError}</span>
          </div>
        </div>
      )}

      {/* Main Address Input Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2 space-y-1">
          <label className="text-xs text-slate-300 font-semibold">Street / Building Address *</label>
          <Input
            placeholder="e.g. Building 42, Circular Road, Opposite Lalpur Plaza"
            value={address}
            disabled={disabled}
            onChange={(e) =>
              onChange({
                address: e.target.value,
                locality,
                city,
                state,
                country,
                pincode,
                latitude,
                longitude,
              })
            }
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs text-slate-300 font-semibold">Locality / Area *</label>
          <Input
            placeholder="e.g. Lalpur"
            value={locality}
            disabled={disabled}
            onChange={(e) =>
              onChange({
                address,
                locality: e.target.value,
                city,
                state,
                country,
                pincode,
                latitude,
                longitude,
              })
            }
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs text-slate-300 font-semibold">City *</label>
          <Input
            placeholder="e.g. Ranchi"
            value={city}
            disabled={disabled}
            onChange={(e) => {
              const newCity = e.target.value;
              onChange({
                address,
                locality,
                city: newCity,
                state,
                country,
                pincode,
                latitude,
                longitude,
              });
            }}
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs text-slate-300 font-semibold flex items-center justify-between">
            <span>State *</span>
            <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-500/30">
              Jharkhand Only
            </Badge>
          </label>
          <Input
            placeholder="Jharkhand"
            value={state}
            disabled={disabled}
            onChange={(e) => {
              const newState = e.target.value;
              onChange({
                address,
                locality,
                city,
                state: newState,
                country,
                pincode,
                latitude,
                longitude,
              });
            }}
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs text-slate-300 font-semibold">Pincode *</label>
          <Input
            placeholder="e.g. 834001"
            value={pincode}
            disabled={disabled}
            onChange={(e) =>
              onChange({
                address,
                locality,
                city,
                state,
                country,
                pincode: e.target.value,
                latitude,
                longitude,
              })
            }
          />
        </div>
      </div>

      {/* Coordinate & Map Picker Section */}
      <div className="space-y-3 pt-2 border-t border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <label className="text-xs text-slate-300 font-semibold flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-emerald-400" />
            <span>Map Marker & GPS Coordinates</span>
          </label>

          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={disabled}
            onClick={handleUseCurrentLocation}
            className="text-xs gap-1.5 h-8 border-slate-700 hover:bg-slate-800"
          >
            <Compass className="h-3.5 w-3.5 text-emerald-400" />
            <span>Use My GPS Location</span>
          </Button>
        </div>

        {/* Latitude / Longitude Numeric Inputs */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[11px] text-slate-400 font-mono">Latitude (-90 to 90)</label>
            <Input
              type="number"
              step="0.00001"
              placeholder="e.g. 23.3441"
              value={latitude ?? ""}
              disabled={disabled}
              onChange={(e) => {
                const val = e.target.value ? parseFloat(e.target.value) : undefined;
                onChange({
                  address,
                  locality,
                  city,
                  state,
                  country,
                  pincode,
                  latitude: val,
                  longitude,
                });
              }}
              className="font-mono text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] text-slate-400 font-mono">Longitude (-180 to 180)</label>
            <Input
              type="number"
              step="0.00001"
              placeholder="e.g. 85.3096"
              value={longitude ?? ""}
              disabled={disabled}
              onChange={(e) => {
                const val = e.target.value ? parseFloat(e.target.value) : undefined;
                onChange({
                  address,
                  locality,
                  city,
                  state,
                  country,
                  pincode,
                  latitude,
                  longitude: val,
                });
              }}
              className="font-mono text-xs"
            />
          </div>
        </div>

        {/* Map Canvas / Search Bar / Fallback Box */}
        {mapsStatus === "ready" ? (
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search Google Maps location (e.g. Lalpur Chowk, Ranchi)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={disabled}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
              />
            </div>

            <div className="relative h-64 w-full rounded-2xl overflow-hidden border border-slate-800 bg-slate-950">
              <div ref={mapRef} className="h-full w-full" />
            </div>
            <p className="text-[11px] text-slate-400 flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>Click anywhere on the map or drag the marker to adjust exact property location.</span>
            </p>
          </div>
        ) : mapsStatus === "loading" ? (
          <div className="h-48 w-full rounded-2xl border border-slate-800 bg-slate-950 flex flex-col items-center justify-center text-center p-4">
            <Loader2 className="h-6 w-6 text-emerald-400 animate-spin mb-2" />
            <span className="text-xs text-slate-400">Loading Google Maps...</span>
          </div>
        ) : (
          /* Graceful Fallback when Maps SDK is unavailable or API key missing */
          <div className="p-4 rounded-2xl border border-slate-800 bg-slate-950/80 space-y-3">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>Map temporarily unavailable.</span>
            </div>
            <p className="text-xs text-slate-400">
              You can manually enter or fine-tune exact GPS coordinates (Latitude & Longitude) above for your property in {city || "Ranchi"}, {state || "Jharkhand"}.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
