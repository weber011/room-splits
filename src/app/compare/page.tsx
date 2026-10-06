"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { propertyService } from "@/services/property.service";
import { Property } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PriceDisplay, RatingDisplay } from "@/components/common";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { Scale, Check, X, ArrowLeft, CalendarCheck } from "lucide-react";

export default function ComparePage() {
  const [properties, setProperties] = useState<Property[]>([]);

  useEffect(() => {
    async function loadData() {
      const data = await propertyService.getFeaturedProperties();
      setProperties(data.slice(0, 3));
    }
    loadData();
  }, []);

  const handleRemove = (id: string) => {
    setProperties((prev) => prev.filter((p) => p.id !== id));
  };

  if (properties.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 max-w-4xl mx-auto flex items-center justify-center">
        <EmptyState
          title="No Properties Selected for Comparison"
          description="Browse PG properties and click 'Compare' on cards to compare rent, deposit, and amenities side-by-side."
          actionLabel="Explore Properties"
          onAction={() => (window.location.href = "/discover")}
          icon={Scale}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <Badge variant="default" className="mb-2 gap-1">
            <Scale className="h-3.5 w-3.5" /> Side-by-Side Comparison
          </Badge>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Compare PGs & Co-Living Spaces
          </h1>
          <p className="text-sm text-slate-400 mt-1">Comparing {properties.length} selected properties.</p>
        </div>

        <Link href="/discover">
          <Button variant="outline" size="sm" className="gap-1.5">
            <ArrowLeft className="h-4 w-4" />
            Add More Properties
          </Button>
        </Link>
      </div>

      {/* Comparison Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-48 text-slate-400 font-bold">Property Details</TableHead>
            {properties.map((p) => (
              <TableHead key={p.id} className="min-w-[260px] text-center">
                <div className="space-y-3 py-2">
                  <div className="relative h-36 w-full rounded-xl overflow-hidden bg-slate-800 mx-auto border border-slate-700">
                    <Image src={p.coverImage} alt={p.title} fill className="object-cover" />
                    <button
                      onClick={() => handleRemove(p.id)}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-950/80 text-slate-300 hover:text-rose-400"
                      title="Remove from comparison"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <h4 className="font-bold text-white text-base line-clamp-1">{p.title}</h4>
                  <p className="text-xs text-slate-400">{p.location.locality}, {p.location.city}</p>
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {/* Monthly Rent */}
          <TableRow>
            <TableCell className="font-bold text-slate-300">Starting Rent</TableCell>
            {properties.map((p) => (
              <TableCell key={p.id} className="text-center">
                <PriceDisplay amount={p.startingPrice} size="md" />
              </TableCell>
            ))}
          </TableRow>

          {/* Security Deposit */}
          <TableRow>
            <TableCell className="font-bold text-slate-300">Security Deposit</TableCell>
            {properties.map((p) => (
              <TableCell key={p.id} className="text-center text-sm font-semibold text-white">
                ₹{(p.startingPrice * 2).toLocaleString("en-IN")}
              </TableCell>
            ))}
          </TableRow>

          {/* Rating */}
          <TableRow>
            <TableCell className="font-bold text-slate-300">Resident Rating</TableCell>
            {properties.map((p) => (
              <TableCell key={p.id} className="text-center">
                <RatingDisplay rating={p.rating} reviewCount={p.reviewCount} />
              </TableCell>
            ))}
          </TableRow>

          {/* Gender Policy */}
          <TableRow>
            <TableCell className="font-bold text-slate-300">Gender Policy</TableCell>
            {properties.map((p) => (
              <TableCell key={p.id} className="text-center capitalize">
                <Badge variant="secondary">{p.genderPolicy}</Badge>
              </TableCell>
            ))}
          </TableRow>

          {/* Lock-in & Notice */}
          <TableRow>
            <TableCell className="font-bold text-slate-300">Lock-in & Notice</TableCell>
            {properties.map((p) => (
              <TableCell key={p.id} className="text-center text-xs text-slate-300">
                {p.lockInMonths} Months Lock-in | {p.noticePeriodDays} Days Notice
              </TableCell>
            ))}
          </TableRow>

          {/* Wi-Fi & Food Included */}
          <TableRow>
            <TableCell className="font-bold text-slate-300">Daily Meals Included</TableCell>
            {properties.map((p) => (
              <TableCell key={p.id} className="text-center">
                {p.amenities.some((a) => a.includes("Meals") || a.includes("Food")) ? (
                  <Check className="h-5 w-5 text-emerald-400 mx-auto" />
                ) : (
                  <X className="h-5 w-5 text-slate-600 mx-auto" />
                )}
              </TableCell>
            ))}
          </TableRow>

          {/* Action Row */}
          <TableRow>
            <TableCell className="font-bold text-slate-300">Book Action</TableCell>
            {properties.map((p) => (
              <TableCell key={p.id} className="text-center">
                <Link href={`/property/${p.id}`}>
                  <Button size="sm" className="w-full gap-1.5">
                    <CalendarCheck className="h-3.5 w-3.5" />
                    Visit / Book
                  </Button>
                </Link>
              </TableCell>
            ))}
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
