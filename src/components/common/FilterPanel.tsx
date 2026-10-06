"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { RotateCcw, Check } from "lucide-react";
import { siteConfig } from "@/config/site.config";

export interface FilterPanelProps {
  onApplyFilters?: (filters: Record<string, unknown>) => void;
  className?: string;
}

export function FilterPanel({ onApplyFilters, className }: FilterPanelProps) {
  const [category, setCategory] = useState("all");
  const [genderPolicy, setGenderPolicy] = useState("all");
  const [sharingType, setSharingType] = useState("all");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState<number>(20000);

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((a) => a !== amenity)
        : [...prev, amenity]
    );
  };

  const resetFilters = () => {
    setCategory("all");
    setGenderPolicy("all");
    setSharingType("all");
    setSelectedAmenities([]);
    setMaxPrice(20000);
  };

  const handleApply = () => {
    onApplyFilters?.({
      category,
      genderPolicy,
      sharingType,
      selectedAmenities,
      maxPrice,
    });
  };

  return (
    <div className={`glass-panel rounded-3xl p-6 border border-slate-800 space-y-6 text-slate-100 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <h3 className="font-bold text-lg text-white">Filter Properties</h3>
        <button
          onClick={resetFilters}
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-emerald-400 transition-colors"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset All
        </button>
      </div>

      {/* Property Type */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-300">Property Category</label>
        <Select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          options={[
            { value: "all", label: "All Categories" },
            { value: "pg", label: "Paying Guest (PG)" },
            { value: "hostel", label: "Student Hostel" },
            { value: "coliving", label: "Co-Living Space" },
            { value: "flat", label: "Shared Flat Room" },
          ]}
        />
      </div>

      {/* Gender Policy */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-300">Gender Preference</label>
        <div className="grid grid-cols-4 gap-2">
          {[
            { id: "all", label: "All" },
            { id: "boys", label: "Boys" },
            { id: "girls", label: "Girls" },
            { id: "unisex", label: "Unisex" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setGenderPolicy(item.id)}
              className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                genderPolicy === item.id
                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/50"
                  : "bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sharing Type */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-300">Room Sharing</label>
        <Select
          value={sharingType}
          onChange={(e) => setSharingType(e.target.value)}
          options={[
            { value: "all", label: "Any Sharing" },
            { value: "single", label: "Private Single Room" },
            { value: "double", label: "2 Sharing Room" },
            { value: "triple", label: "3 Sharing Room" },
            { value: "four_plus", label: "4+ Sharing Room" },
          ]}
        />
      </div>

      {/* Price Range Slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-slate-300">Max Monthly Budget</span>
          <span className="text-emerald-400">₹{maxPrice.toLocaleString("en-IN")}/mo</span>
        </div>
        <input
          type="range"
          min={5000}
          max={35000}
          step={1000}
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full accent-emerald-500 bg-slate-800 rounded-lg cursor-pointer"
        />
      </div>

      {/* Amenities Multi-Select */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-300">Essential Amenities</label>
        <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto pr-1">
          {siteConfig.amenities.map((amenity) => {
            const isSelected = selectedAmenities.includes(amenity);
            return (
              <button
                key={amenity}
                onClick={() => toggleAmenity(amenity)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                  isSelected
                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/50"
                    : "bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200"
                }`}
              >
                {isSelected && <Check className="h-3 w-3" />}
                <span>{amenity}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Action Button */}
      <Button onClick={handleApply} className="w-full">
        Apply Filters
      </Button>
    </div>
  );
}
