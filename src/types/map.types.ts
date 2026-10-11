export interface PropertyLocationCoordinates {
  latitude?: number;
  longitude?: number;
  formatted_address: string;
  city: string;
  state: string;
  pincode: string;
}

export type LandmarkType = "COLLEGE" | "TECH_PARK" | "METRO" | "HOSPITAL" | "MALL" | "OTHER";

export interface NearbyLandmark {
  id: string;
  name: string;
  type: LandmarkType;
  distanceKm: number;
  travelTimeMinutes?: number;
}

export interface LocationSearchResult {
  placeId: string;
  description: string;
  locality: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
}
