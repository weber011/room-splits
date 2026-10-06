import { PropertyLocationCoordinates, NearbyLandmark } from "@/types/map.types";

/**
 * Calculates straight-line Haversine distance in kilometers between two coordinates.
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 10) / 10;
}

/**
 * Generates an official Google Maps Directions URL.
 * Never exposes server-side secret API keys to the client.
 */
export function getGoogleMapsDirectionsUrl(
  latitude: number,
  longitude: number,
  address?: string
): string {
  const destination = encodeURIComponent(
    address ? `${address} (${latitude},${longitude})` : `${latitude},${longitude}`
  );
  return `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
}

/**
 * Masks exact property coordinates into an approximate locality center (~500m radius)
 * if location visibility is restricted prior to confirmed visit/booking.
 */
export function getMaskedLocationCoordinates(
  coords: PropertyLocationCoordinates,
  isExactVisible: boolean
): {
  latitude: number;
  longitude: number;
  displayAddress: string;
} {
  if (isExactVisible) {
    return {
      latitude: coords.latitude,
      longitude: coords.longitude,
      displayAddress: coords.formatted_address,
    };
  }

  // Slight deterministic offset for privacy masking (~450m offset)
  const maskedLat = coords.latitude + 0.0035;
  const maskedLng = coords.longitude + 0.0035;

  return {
    latitude: Math.round(maskedLat * 10000) / 10000,
    longitude: Math.round(maskedLng * 10000) / 10000,
    displayAddress: `Approximate Locality Area (${coords.city}, ${coords.state} ${coords.pincode})`,
  };
}

/**
 * Default sample landmarks for Bengaluru PG localities
 */
export const DEFAULT_NEARBY_LANDMARKS: NearbyLandmark[] = [
  {
    id: "lm-1",
    name: "Indiranagar 100FT Road Metro Station",
    type: "METRO",
    distanceKm: 0.8,
    travelTimeMinutes: 4,
  },
  {
    id: "lm-2",
    name: "Bagmane Tech Park",
    type: "TECH_PARK",
    distanceKm: 2.1,
    travelTimeMinutes: 8,
  },
  {
    id: "lm-3",
    name: "Christ University (Koramangala)",
    type: "COLLEGE",
    distanceKm: 4.5,
    travelTimeMinutes: 15,
  },
  {
    id: "lm-4",
    name: "Manipal Hospital HAL Airport Road",
    type: "HOSPITAL",
    distanceKm: 1.5,
    travelTimeMinutes: 6,
  },
];
