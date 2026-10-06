export type PropertySortOption =
  | "relevance"
  | "price_asc"
  | "price_desc"
  | "rating"
  | "newest"
  | "nearest";

export type GenderPreferenceFilter = "ALL" | "MALE" | "FEMALE" | "UNISEX" | "COED";
export type RoomTypeFilter = "ALL" | "SINGLE" | "DOUBLE" | "TRIPLE" | "PRIVATE";
export type PropertyCategoryFilter = "ALL" | "PG" | "HOSTEL" | "COLIVING" | "APARTMENT";

export interface PropertySearchFilters {
  city?: string;
  locality?: string;
  propertyType?: PropertyCategoryFilter;
  roomType?: RoomTypeFilter;
  occupancy?: string;
  minRent?: number;
  maxRent?: number;
  maxSecurityDeposit?: number;
  amenities?: string[];
  genderPreference?: GenderPreferenceFilter;
  availability?: "AVAILABLE_NOW" | "UPCOMING" | "ALL";
  verifiedOnly?: boolean;
  minRating?: number;
  distanceKm?: number;
  sort?: PropertySortOption;
  page?: number;
  pageSize?: number;
}

export interface PropertySearchParams {
  query?: string;
  city?: string;
  locality?: string;
  category?: string;
  genderPolicy?: string;
  maxPrice?: number;
  minPrice?: number;
  sortBy?: string;
}

export interface PaginatedSearchResponse<T> {
  data: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  appliedFilters: PropertySearchFilters;
}
