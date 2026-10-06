import { Property } from "@/types/property.types";
import {
  PropertySearchFilters,
  PaginatedSearchResponse,
} from "@/types/search.types";
import { propertyService } from "./property.service";

/**
 * Database Indexing DDL Scripts for PostgreSQL / SQL search engine optimization.
 */
export const DATABASE_INDEX_SCRIPTS = `
-- RoomSplits Production Property Search Indexing
CREATE INDEX IF NOT EXISTS idx_properties_city_locality ON properties (city, locality);
CREATE INDEX IF NOT EXISTS idx_properties_starting_price ON properties (starting_price ASC);
CREATE INDEX IF NOT EXISTS idx_properties_gender_category ON properties (gender_policy, category);
CREATE INDEX IF NOT EXISTS idx_properties_rating ON properties (rating DESC);
CREATE INDEX IF NOT EXISTS idx_properties_created_at ON properties (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rooms_monthly_rent ON rooms (monthly_rent ASC, sharing_type);
`;

export class PropertySearchService {
  async searchProperties(
    filters: PropertySearchFilters
  ): Promise<PaginatedSearchResponse<Property>> {
    // Fetch base property database server-side
    const allProperties = await propertyService.getAllProperties();

    // Apply Server-Side Filtering
    let filtered = allProperties.filter((p) => {
      // 1. City Filter
      if (
        filters.city &&
        filters.city.toLowerCase() !== "all" &&
        !p.location.city.toLowerCase().includes(filters.city.toLowerCase())
      ) {
        return false;
      }

      // 2. Locality Filter
      if (
        filters.locality &&
        filters.locality.toLowerCase() !== "all" &&
        !p.location.locality.toLowerCase().includes(filters.locality.toLowerCase()) &&
        !p.title.toLowerCase().includes(filters.locality.toLowerCase())
      ) {
        return false;
      }

      // 3. Property Type / Category
      if (
        filters.propertyType &&
        filters.propertyType !== "ALL" &&
        p.category.toUpperCase() !== filters.propertyType.toUpperCase()
      ) {
        return false;
      }

      // 4. Gender Preference
      if (
        filters.genderPreference &&
        filters.genderPreference !== "ALL" &&
        p.genderPolicy.toUpperCase() !== filters.genderPreference.toUpperCase()
      ) {
        return false;
      }

      // 5. Min Rent & Max Rent
      if (filters.minRent !== undefined && p.startingPrice < filters.minRent) {
        return false;
      }
      if (filters.maxRent !== undefined && p.startingPrice > filters.maxRent) {
        return false;
      }

      // 6. Verified Only
      if (filters.verifiedOnly && !p.verified) {
        return false;
      }

      // 7. Minimum Rating
      if (filters.minRating !== undefined && p.rating < filters.minRating) {
        return false;
      }

      // 8. Selected Amenities Filter
      if (filters.amenities && filters.amenities.length > 0) {
        const hasAllAmenities = filters.amenities.every((req) =>
          p.amenities.some((a) => a.toLowerCase().includes(req.toLowerCase()))
        );
        if (!hasAllAmenities) return false;
      }

      return true;
    });

    // Apply Server-Side Sorting
    const sortOption = filters.sort || "relevance";
    filtered = [...filtered].sort((a, b) => {
      switch (sortOption) {
        case "price_asc":
          return a.startingPrice - b.startingPrice;
        case "price_desc":
          return b.startingPrice - a.startingPrice;
        case "rating":
          return b.rating - a.rating;
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "nearest":
          return (a.location.latitude || 0) - (b.location.latitude || 0);
        case "relevance":
        default:
          return b.reviewCount - a.reviewCount;
      }
    });

    // Apply Pagination
    const page = Math.max(1, filters.page || 1);
    const pageSize = Math.max(1, filters.pageSize || 6);
    const totalCount = filtered.length;
    const totalPages = Math.ceil(totalCount / pageSize) || 1;

    const startIndex = (page - 1) * pageSize;
    const paginatedData = filtered.slice(startIndex, startIndex + pageSize);

    return {
      data: paginatedData,
      page,
      pageSize,
      totalCount,
      totalPages,
      appliedFilters: filters,
    };
  }
}

export const propertySearchService = new PropertySearchService();
