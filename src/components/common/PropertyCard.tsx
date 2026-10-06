"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PriceDisplay } from "./PriceDisplay";
import { RatingDisplay } from "./RatingDisplay";
import { AmenityBadge } from "./AmenityBadge";
import { VerifiedBadge } from "./VerifiedBadge";
import { MapPin, CalendarCheck, Heart, Scale, Check } from "lucide-react";
import { Property } from "@/types";

export interface PropertyCardProps {
  property: Property;
  onVisitRequest?: (propertyId: string) => void;
  onToggleCompare?: (property: Property) => void;
  isCompared?: boolean;
  className?: string;
}

export function PropertyCard({
  property,
  onVisitRequest,
  onToggleCompare,
  isCompared = false,
  className,
}: PropertyCardProps) {
  const [isSaved, setIsSaved] = useState(false);

  return (
    <Card className={`overflow-hidden border-slate-800 hover:border-slate-700 hover:shadow-2xl transition-all duration-300 group flex flex-col justify-between ${className}`}>
      <div>
        {/* Cover Image & Overlay Badges */}
        <div className="relative h-56 w-full overflow-hidden bg-slate-800">
          <Image
            src={property.coverImage || property.images?.[0] || "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80"}
            alt={property.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute top-3 left-3 flex flex-wrap gap-2 z-10">
            {property.featured && (
              <Badge variant="default" className="shadow-md">
                Featured
              </Badge>
            )}
            <VerifiedBadge type="property" />
            <Badge variant="secondary" className="bg-slate-950/80 backdrop-blur-md uppercase text-[10px]">
              {property.genderPolicy}
            </Badge>
          </div>

          {/* Action Buttons: Save & Compare */}
          <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
            <button
              onClick={() => setIsSaved(!isSaved)}
              className={`p-2 rounded-full backdrop-blur-md transition-all shadow-md ${
                isSaved
                  ? "bg-rose-500 text-white"
                  : "bg-slate-950/70 text-slate-300 hover:text-white hover:bg-slate-900"
              }`}
              aria-label="Save Property"
            >
              <Heart className={`h-4 w-4 ${isSaved ? "fill-white" : ""}`} />
            </button>

            {onToggleCompare && (
              <button
                onClick={() => onToggleCompare(property)}
                className={`p-2 rounded-full backdrop-blur-md transition-all shadow-md ${
                  isCompared
                    ? "bg-emerald-500 text-white"
                    : "bg-slate-950/70 text-slate-300 hover:text-white hover:bg-slate-900"
                }`}
                title={isCompared ? "Remove from Compare" : "Add to Compare"}
                aria-label="Compare Property"
              >
                {isCompared ? <Check className="h-4 w-4" /> : <Scale className="h-4 w-4" />}
              </button>
            )}
          </div>

          <div className="absolute bottom-3 right-3 z-10">
            <RatingDisplay rating={property.rating} reviewCount={property.reviewCount} />
          </div>
        </div>

        {/* Content Body */}
        <CardContent className="p-6 space-y-4">
          <div>
            <Link href={`/property/${property.id}`}>
              <h3 className="font-bold text-lg text-white group-hover:text-emerald-400 transition-colors line-clamp-1">
                {property.title}
              </h3>
            </Link>
            <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
              <MapPin className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              <span>{property.location.locality}, {property.location.city}</span>
            </p>
          </div>

          {/* Amenities Badges */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {property.amenities.slice(0, 3).map((amenity) => (
              <AmenityBadge key={amenity} name={amenity} />
            ))}
            {property.amenities.length > 3 && (
              <span className="text-[10px] text-slate-400 self-center font-medium">
                +{property.amenities.length - 3} more
              </span>
            )}
          </div>
        </CardContent>
      </div>

      {/* Footer Price & Action */}
      <div className="p-6 pt-0 border-t border-slate-800/80 mt-2 flex items-center justify-between">
        <PriceDisplay amount={property.startingPrice} />
        <Button
          size="sm"
          variant="outline"
          onClick={() => onVisitRequest?.(property.id)}
          className="gap-1.5 hover:border-emerald-500"
        >
          <CalendarCheck className="h-3.5 w-3.5 text-emerald-400" />
          Book Visit
        </Button>
      </div>
    </Card>
  );
}
