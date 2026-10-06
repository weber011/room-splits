"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { propertySearchService } from "@/services/property-search.service";
import { Property } from "@/types/property.types";
import {
  PropertySearchFilters,
  PropertySortOption,
  GenderPreferenceFilter,
  PropertyCategoryFilter,
} from "@/types/search.types";
import { PropertyCard, LocationSearch } from "@/components/common";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Star,
  Sparkles,
  Building,
} from "lucide-react";

function DiscoverSearchContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Read URL query params
  const initialCity = searchParams.get("city") || "";
  const initialLocality = searchParams.get("locality") || "";
  const initialType = (searchParams.get("propertyType") as PropertyCategoryFilter) || "ALL";
  const initialGender = (searchParams.get("gender") as GenderPreferenceFilter) || "ALL";
  const initialMinRent = searchParams.get("minRent") ? Number(searchParams.get("minRent")) : undefined;
  const initialMaxRent = searchParams.get("maxRent") ? Number(searchParams.get("maxRent")) : undefined;
  const initialVerified = searchParams.get("verified") === "true";
  const initialMinRating = searchParams.get("minRating") ? Number(searchParams.get("minRating")) : undefined;
  const initialSort = (searchParams.get("sort") as PropertySortOption) || "relevance";
  const initialPage = searchParams.get("page") ? Number(searchParams.get("page")) : 1;

  // Search filter state
  const [city, setCity] = useState(initialCity);
  const [locality, setLocality] = useState(initialLocality);
  const [propertyType, setPropertyType] = useState<PropertyCategoryFilter>(initialType);
  const [genderPreference, setGenderPreference] = useState<GenderPreferenceFilter>(initialGender);
  const [minRent, setMinRent] = useState<number | undefined>(initialMinRent);
  const [maxRent, setMaxRent] = useState<number | undefined>(initialMaxRent);
  const [verifiedOnly, setVerifiedOnly] = useState(initialVerified);
  const [minRating, setMinRating] = useState<number | undefined>(initialMinRating);
  const [sort, setSort] = useState<PropertySortOption>(initialSort);
  const [page, setPage] = useState(initialPage);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  // Results state
  const [properties, setProperties] = useState<Property[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Sync state to URL params for shareable searches
  const updateUrlParams = (newParams: Record<string, string | number | boolean | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(newParams).forEach(([key, val]) => {
      if (val === undefined || val === "" || val === false || val === "ALL" || val === 0) {
        params.delete(key);
      } else {
        params.set(key, String(val));
      }
    });

    router.push(`${pathname}?${params.toString()}`);
  };

  const executeSearch = useCallback(async () => {
    setLoading(true);
    try {
      const filters: PropertySearchFilters = {
        city,
        locality,
        propertyType,
        genderPreference,
        minRent,
        maxRent,
        verifiedOnly,
        minRating,
        amenities: selectedAmenities,
        sort,
        page,
        pageSize: 6,
      };

      const res = await propertySearchService.searchProperties(filters);
      setProperties(res.data);
      setTotalCount(res.totalCount);
      setTotalPages(res.totalPages);
    } catch (err) {
      console.error("Search execution failed", err);
    } finally {
      setLoading(false);
    }
  }, [city, locality, propertyType, genderPreference, minRent, maxRent, verifiedOnly, minRating, selectedAmenities, sort, page]);

  useEffect(() => {
    executeSearch();
  }, [executeSearch]);

  const handleApplyFilterUpdate = (key: string, val: string | number | boolean | undefined) => {
    setPage(1);
    updateUrlParams({ [key]: val, page: 1 });
  };

  const handleResetFilters = () => {
    setCity("");
    setLocality("");
    setPropertyType("ALL");
    setGenderPreference("ALL");
    setMinRent(undefined);
    setMaxRent(undefined);
    setVerifiedOnly(false);
    setMinRating(undefined);
    setSelectedAmenities([]);
    setSort("relevance");
    setPage(1);
    router.push(pathname);
  };

  const toggleAmenity = (amenity: string) => {
    const updated = selectedAmenities.includes(amenity)
      ? selectedAmenities.filter((a) => a !== amenity)
      : [...selectedAmenities, amenity];
    setSelectedAmenities(updated);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6 pb-20">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 mb-2">Production Search Engine</Badge>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Search className="h-7 w-7 text-emerald-400" />
            <span>Discover Verified PGs & Co-Living Spaces</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Server-side filtered room discovery with real-time URL query parameter sharing.
          </p>
        </div>

        {/* Shareable Link Indicator */}
        <div className="flex items-center gap-2 text-xs bg-slate-900 border border-slate-800 px-3.5 py-2 rounded-xl text-slate-300">
          <Sparkles className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>Shareable URL active with live parameters</span>
        </div>
      </div>

      {/* Main 2-Column Search Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Column: Filter Panel */}
        <Card className="lg:col-span-1 border-slate-800 bg-slate-900/90 p-5 space-y-6 h-fit backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-emerald-400" />
              <span>Search Filters</span>
            </h3>
            <button
              onClick={handleResetFilters}
              className="text-[11px] text-emerald-400 hover:underline font-semibold"
            >
              Reset All
            </button>
          </div>

          {/* Location Autocomplete */}
          <div className="space-y-1.5 text-xs">
            <label className="text-slate-300 font-semibold block">Locality / City</label>
            <LocationSearch
              value={locality}
              onSelectLocation={(loc) => {
                setCity(loc.city);
                setLocality(loc.locality);
                handleApplyFilterUpdate("locality", loc.locality);
              }}
            />
          </div>

          {/* Property Category */}
          <div className="space-y-1.5 text-xs">
            <label className="text-slate-300 font-semibold block">Property Type</label>
            <select
              value={propertyType}
              onChange={(e) => {
                const val = e.target.value as PropertyCategoryFilter;
                setPropertyType(val);
                handleApplyFilterUpdate("propertyType", val);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-semibold"
            >
              <option value="ALL">All Categories</option>
              <option value="PG">PG (Paying Guest)</option>
              <option value="HOSTEL">Hostel</option>
              <option value="COLIVING">Co-Living Space</option>
              <option value="APARTMENT">Shared Apartment</option>
            </select>
          </div>

          {/* Gender Preference */}
          <div className="space-y-1.5 text-xs">
            <label className="text-slate-300 font-semibold block">Gender Policy</label>
            <select
              value={genderPreference}
              onChange={(e) => {
                const val = e.target.value as GenderPreferenceFilter;
                setGenderPreference(val);
                handleApplyFilterUpdate("gender", val);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-semibold"
            >
              <option value="ALL">All Gender Policies</option>
              <option value="MALE">Boys / Male Only</option>
              <option value="FEMALE">Girls / Female Only</option>
              <option value="UNISEX">Unisex / Co-Ed</option>
            </select>
          </div>

          {/* Monthly Rent Range */}
          <div className="space-y-2 text-xs">
            <label className="text-slate-300 font-semibold block">Monthly Rent Budget (₹)</label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                placeholder="Min ₹"
                value={minRent || ""}
                onChange={(e) => {
                  const val = e.target.value ? Number(e.target.value) : undefined;
                  setMinRent(val);
                  handleApplyFilterUpdate("minRent", val);
                }}
                className="bg-slate-950 border-slate-800 text-white text-xs"
              />
              <Input
                type="number"
                placeholder="Max ₹"
                value={maxRent || ""}
                onChange={(e) => {
                  const val = e.target.value ? Number(e.target.value) : undefined;
                  setMaxRent(val);
                  handleApplyFilterUpdate("maxRent", val);
                }}
                className="bg-slate-950 border-slate-800 text-white text-xs"
              />
            </div>
          </div>

          {/* Minimum Rating */}
          <div className="space-y-1.5 text-xs">
            <label className="text-slate-300 font-semibold block">Minimum Rating</label>
            <div className="flex gap-2">
              {[4.5, 4.0, 3.5].map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    const val = minRating === r ? undefined : r;
                    setMinRating(val);
                    handleApplyFilterUpdate("minRating", val);
                  }}
                  className={`flex-1 py-1.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
                    minRating === r
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                      : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"
                  }`}
                >
                  <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                  <span>{r}+</span>
                </button>
              ))}
            </div>
          </div>

          {/* Verified Toggle */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-300 font-semibold flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              Verified Properties Only
            </span>
            <input
              type="checkbox"
              checked={verifiedOnly}
              onChange={(e) => {
                setVerifiedOnly(e.target.checked);
                handleApplyFilterUpdate("verified", e.target.checked);
              }}
              className="h-4 w-4 rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-emerald-500"
            />
          </div>

          {/* Amenities Checklist */}
          <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
            <label className="text-slate-300 font-semibold block">Required Amenities</label>
            <div className="space-y-2">
              {["High-Speed Wi-Fi", "AC Rooms", "3x Daily Meals", "Gym Access", "Daily Housekeeping"].map((amenity) => {
                const isSelected = selectedAmenities.includes(amenity);
                return (
                  <label key={amenity} className="flex items-center justify-between cursor-pointer text-slate-300 hover:text-white">
                    <span>{amenity}</span>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleAmenity(amenity)}
                      className="h-4 w-4 rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-emerald-500"
                    />
                  </label>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Right Column: Search Results Grid & Controls */}
        <div className="lg:col-span-3 space-y-6">
          {/* Controls Bar: Count & Sorting */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
            <div>
              <span className="text-xs text-slate-400">
                Found <strong className="text-white font-bold">{totalCount}</strong> verified properties
              </span>
              {(locality || city || maxRent || genderPreference !== "ALL") && (
                <div className="flex items-center gap-1.5 flex-wrap mt-1">
                  {city && <Badge variant="secondary" className="text-[10px]">{city}</Badge>}
                  {locality && <Badge variant="secondary" className="text-[10px]">{locality}</Badge>}
                  {maxRent && <Badge variant="outline" className="text-[10px] text-emerald-400">Max ₹{maxRent}</Badge>}
                  {genderPreference !== "ALL" && <Badge variant="outline" className="text-[10px]">{genderPreference}</Badge>}
                </div>
              )}
            </div>

            {/* Sorting Dropdown */}
            <div className="flex items-center gap-2 text-xs self-end sm:self-auto">
              <ArrowUpDown className="h-4 w-4 text-emerald-400 shrink-0" />
              <span className="text-slate-400 font-medium">Sort By:</span>
              <select
                value={sort}
                onChange={(e) => {
                  const val = e.target.value as PropertySortOption;
                  setSort(val);
                  handleApplyFilterUpdate("sort", val);
                }}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-white font-bold focus:outline-none"
              >
                <option value="relevance">Most Relevant</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest Listed</option>
                <option value="nearest">Nearest Location</option>
              </select>
            </div>
          </div>

          {/* Property Cards Grid */}
          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
              <p className="text-sm text-slate-400">Filtering properties server-side...</p>
            </div>
          ) : properties.length === 0 ? (
            <Card className="p-12 text-center border-slate-800 bg-slate-900/90 text-slate-400 text-sm space-y-3">
              <Building className="h-10 w-10 text-slate-600 mx-auto" />
              <h3 className="font-bold text-white text-base">No Matching Properties Found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Try widening your search rent budget, resetting locality filters, or clearing amenity requirements.
              </p>
              <Button size="sm" onClick={handleResetFilters} variant="outline" className="text-xs">
                Reset All Filters
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {properties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}

          {/* Server-Side Pagination Bar */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-6 border-t border-slate-800 text-xs text-slate-300">
              <Button
                disabled={page <= 1}
                onClick={() => {
                  const newP = page - 1;
                  setPage(newP);
                  handleApplyFilterUpdate("page", newP);
                }}
                variant="outline"
                size="sm"
                className="gap-1 border-slate-800 text-slate-300 disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Previous Page</span>
              </Button>

              <span className="font-semibold text-slate-400">
                Page <strong className="text-white font-bold">{page}</strong> of <strong className="text-white font-bold">{totalPages}</strong>
              </span>

              <Button
                disabled={page >= totalPages}
                onClick={() => {
                  const newP = page + 1;
                  setPage(newP);
                  handleApplyFilterUpdate("page", newP);
                }}
                variant="outline"
                size="sm"
                className="gap-1 border-slate-800 text-slate-300 disabled:opacity-40"
              >
                <span>Next Page</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DiscoverPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
            <p className="text-sm text-slate-400">Initializing Search Engine...</p>
          </div>
        </div>
      }
    >
      <DiscoverSearchContent />
    </Suspense>
  );
}
