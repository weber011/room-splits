"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface PropertyImageGalleryProps {
  images: string[];
  title: string;
  className?: string;
}

export function PropertyImageGallery({
  images,
  title,
  className,
}: PropertyImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="h-64 w-full rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500">
        No images available
      </div>
    );
  }

  const nextImage = () => {
    setActiveIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Active Main View */}
      <div className="relative h-72 sm:h-96 w-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 group">
        <Image
          src={images[activeIndex]}
          alt={`${title} - Photo ${activeIndex + 1}`}
          fill
          className="object-cover transition-all duration-300"
          sizes="(max-width: 768px) 100vw, 800px"
          priority
        />

        {/* Carousel Navigation Buttons */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-slate-950/70 backdrop-blur-md text-white hover:bg-slate-900 transition-all opacity-0 group-hover:opacity-100"
              aria-label="Previous Image"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-slate-950/70 backdrop-blur-md text-white hover:bg-slate-900 transition-all opacity-0 group-hover:opacity-100"
              aria-label="Next Image"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {/* Counter Badge */}
        <div className="absolute bottom-3 right-3 rounded-lg bg-slate-950/80 backdrop-blur-md px-2.5 py-1 text-xs text-slate-300 font-medium border border-slate-800">
          {activeIndex + 1} / {images.length}
        </div>
      </div>

      {/* Thumbnails Row */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={cn(
                "relative h-16 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-all",
                activeIndex === idx
                  ? "border-emerald-500 scale-105"
                  : "border-slate-800 opacity-60 hover:opacity-100"
              )}
            >
              <Image src={img} alt={`Thumbnail ${idx + 1}`} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
